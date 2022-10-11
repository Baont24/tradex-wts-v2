import {
  ACCOUNT_OTP_COUNT_DOWN,
  ACCOUNT_OTP_GET_MATRIX,
  ACCOUNT_OTP_GET_MATRIX_FAIL,
  ACCOUNT_OTP_GET_MATRIX_SUCCESS,
  ACCOUNT_OTP_GET_TYPE,
  ACCOUNT_OTP_GET_TYPE_FAIL,
  ACCOUNT_OTP_GET_TYPE_SUCCESS,
  ACCOUNT_OTP_INIT_DATA_FOR_OTP_FORM,
  ACCOUNT_OTP_SENT,
  ACCOUNT_OTP_SET_VALID,
  ACCOUNT_OTP_VERIFY,
  ACCOUNT_OTP_VERIFY_FAIL,
  ACCOUNT_OTP_VERIFY_SUCCESS,
  COMMON_SHOW_NOTIFICATION,
} from 'redux/actions';
import {
  IAction,
  INotification,
  IQueryStatus,
  IResponse,
} from 'interfaces/common';
import {
  IOtpMatrix,
  IOtpSendToNotifyOrSms,
  IOtpToken,
} from 'interfaces/reducers';
import {
  IQueryOtpMatrixForKisResponse,
  ISentOtp,
  IVerifyOtpRequest,
} from 'interfaces/api';
import { IQueryOtpMatrixResponse } from 'interfaces/responses/IQueryOtpMatrixResponse';
import { IQueryOtpTypeResponse } from 'interfaces/responses/IQueryOtpTypeResponse';
import { IState } from 'redux/global-reducers';
import { IVerifyOtpResponse } from 'interfaces/responses/IVerifyOtpResponse';
import { MatrixOtpType, OtpCodeEnum } from 'constants/enum';
import { ToastType } from 'react-toastify';
import { call, put, select, takeLatest, takeLeading } from 'redux-saga/effects';
import { domainConfig } from 'config/domain';
import { query } from 'utils/socketApi';
import config from 'config';
import store from 'redux/store';

const callQueryOTPType = () => {
  return query(config.apis.queryOtpType, {});
};

const callVerifyOTP = (request: IVerifyOtpRequest) => {
  return query(config.apis.verifyOtpMatrix, request);
};

const callGetOTPMatrix = () => {
  return query(config.apis.queryOtpMatrix, {});
};

const callGetOTPMatrixForKis = () => {
  return query(config.apis.queryOtpMatrixforKis);
};

const notifyMobileOtp = (request: ISentOtp) => {
  return query(
    config.apis.notifyOtp,
    request,
    undefined,
    undefined,
    undefined,
    '/'
  );
};

function* doGetOTPMatrix() {
  try {
    if (
      domainConfig[config.domain]?.matrixOtpType === MatrixOtpType.SINGLE_KEY
    ) {
      const responseForKis: IResponse<IQueryOtpMatrixForKisResponse> = yield call(
        callGetOTPMatrixForKis
      );
      console.warn(responseForKis);
      yield put<IAction<IOtpMatrix>>({
        type: ACCOUNT_OTP_GET_MATRIX_SUCCESS,
        payload: {
          otpMatrixNumbers: [responseForKis.data.wordMatrixKey],
          otpMatrixKey: responseForKis.data.wordMatrixId,
        },
      });
    } else {
      const response: IResponse<IQueryOtpMatrixResponse> = yield call(
        callGetOTPMatrix
      );
      console.warn(response);
      yield put<IAction<IOtpMatrix>>({
        type: ACCOUNT_OTP_GET_MATRIX_SUCCESS,
        payload: {
          otpMatrixNumbers: [
            response.data.matrixKey1,
            response.data.matrixKey2,
          ],
          otpMatrixKey: response.data.id,
        },
      });
    }
  } catch (e) {
    console.error('fail to load otp matrix');
    yield put<IAction<Partial<IQueryStatus>>>({
      type: ACCOUNT_OTP_GET_MATRIX_FAIL,
      payload: { errorMessage: e.message || e.code },
    });

    yield put<IAction<INotification>>({
      type: COMMON_SHOW_NOTIFICATION,
      payload: {
        type: ToastType.ERROR,
        title: 'Otp Matrix',
        content: e.code || e.message,
        contentParams: e.messageParams,
        time: new Date(),
      },
    });
  }
}

function* doGetOTPType() {
  try {
    const response: IResponse<IQueryOtpTypeResponse> = yield call(
      callQueryOTPType
    );
    yield put<IAction<string>>({
      type: ACCOUNT_OTP_GET_TYPE_SUCCESS,
      payload: response.data.authCode,
    });
    return response.data.authCode;
  } catch (err) {
    console.error('fail to query otp type', err);
    yield put<IAction<Partial<IQueryStatus>>>({
      type: ACCOUNT_OTP_GET_TYPE_FAIL,
      payload: {
        errorMessage: err.message,
      },
    });
    return null;
  }
}

function* doInitForOtpForm() {
  let otpType: string | null | undefined = store.getState().otp.type.data;
  if (otpType == null) {
    otpType = yield doGetOTPType();
    if (otpType != null) {
      if (otpType === OtpCodeEnum.MATRIX) {
        yield doGetOTPMatrix();
      }
    }
  } else {
    if (otpType === OtpCodeEnum.MATRIX) {
      yield doGetOTPMatrix();
    }
  }
}

function* doVerifyOtp(request: IAction<IVerifyOtpRequest>) {
  try {
    const response: IResponse<IVerifyOtpResponse> =
      domainConfig[config.domain]?.matrixOtpType === MatrixOtpType.SINGLE_KEY
        ? yield call(callVerifyOTP, {
            ...request.payload,
            wordMatrixValue: request.payload.wordMatrixValue01,
          })
        : yield call(callVerifyOTP, request.payload);
    yield put<IAction<IOtpToken>>({
      type: ACCOUNT_OTP_VERIFY_SUCCESS,
      payload: {
        token: response.data.otpToken,
        expiryTime:
          request.payload.expireTime != null
            ? request.payload.expireTime * 59 * 60 * 1000 + new Date().getTime()
            : 0,
      },
    });
    if (request.payload.isValid) {
      yield put({
        type: ACCOUNT_OTP_SET_VALID,
      });
    }
  } catch (e) {
    console.error('fail to verify otp', e);
    yield put<IAction<Partial<IQueryStatus>>>({
      type: ACCOUNT_OTP_VERIFY_FAIL,
      payload: {
        errorMessage: e.message,
      },
    });
  }
}

function* doSentOtp(
  request: IAction<Pick<ISentOtp, 'matrixId' | 'isOtpOneModal' | 'forceSMS'>>
) {
  if (!request.payload.isOtpOneModal) {
    yield doGetOTPMatrix();
  }
  const storage: IState = yield select((s: IState) => ({
    otp: s.otp,
    otpSending: s.otpSending,
  }));

  let matrixId =
    request.payload.matrixId ?? storage.otp.otpMatrix.data?.otpMatrixKey;
  try {
    yield call(notifyMobileOtp, {
      forceSMS: request.payload.forceSMS,
      matrixId,
    });

    let seconds = 15;
    let countDownSecond: NodeJS.Timeout;
    countDownSecond = setInterval(() => {
      seconds--;
      store.dispatch<IAction<IOtpSendToNotifyOrSms>>({
        type: ACCOUNT_OTP_COUNT_DOWN,
        payload: {
          countDownSeconds: seconds,
          countSentOtp: 1,
          countDownMessage15s: '',
        },
      });
      if (seconds <= 0) {
        clearInterval(countDownSecond);
        seconds = 15;
      }
    }, 1000);
  } catch (error) {
    console.error('Notify mobile send OTP ', error);
  }
}

export default function* watchGetOTPType() {
  yield takeLatest(ACCOUNT_OTP_GET_MATRIX, doGetOTPMatrix);
  yield takeLatest(ACCOUNT_OTP_GET_TYPE, doGetOTPType);
  yield takeLatest(ACCOUNT_OTP_INIT_DATA_FOR_OTP_FORM, doInitForOtpForm);
  yield takeLatest(ACCOUNT_OTP_VERIFY, doVerifyOtp);
  yield takeLeading(ACCOUNT_OTP_SENT, doSentOtp);
}
