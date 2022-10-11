import { AUTHENTICATION_VERIFY_OTP } from 'redux/actions';
import { IAction, IRequest, ISocket } from 'interfaces/common';
import { ILoginDomainInfo } from 'interfaces/reducers';
import { IState } from 'redux/global-reducers';
import { IVerifyOTP } from 'interfaces/actions';
import { call, put, select, takeLatest } from 'redux-saga/effects';
import { verifyOTP } from 'utils/socketApi';
import store from 'redux/store';

const MAX_RETRY_COUNT = 10;
let retryCount = 0;

const callVerifyOTP = (param: IVerifyOTP, wtsSocket: ISocket | null) => {
  const params = {
    otp_value: param.otpValue,
    mobile_otp: param.mobileOTP,
  };

  return verifyOTP(wtsSocket, params);
};

function* doVerifyOTP(request: IRequest<IVerifyOTP>) {
  const { wtsSocket }: { wtsSocket: ISocket | null } = yield select(
    (state: IState) => ({
      wtsSocket: state.wtsSocket,
    })
  );
  try {
    yield call(callVerifyOTP, request.data, wtsSocket);
    yield put<IAction<ILoginDomainInfo>>({
      type: request.response.success,
      payload: {
        showOTP: false,
      },
    });

    retryCount = 0;
  } catch (err) {
    if (err.code === 'WRONG_OTP' || err.code === 'WRONG_MOBILE_OTP') {
      retryCount = 0;

      yield put<IAction<ILoginDomainInfo>>({
        type: request.response.failed,
        payload: {
          showOTP: true,
          message: err.message,
          otpIndex: request.data.otpIndex,
          registerMobileOtp: request.data.registerMobileOtp,
        },
      });
    } else {
      if (wtsSocket) {
        const auth = wtsSocket.authToken;
        if (auth?.s && auth.s.otp === true) {
          return;
        }
      }

      if (retryCount < MAX_RETRY_COUNT) {
        setTimeout(() => {
          retryCount++;
          store.dispatch<IAction<IVerifyOTP>>({
            type: request.type,
            payload: request.data,
          });
        }, 100);
      } else {
        retryCount = 0;
        yield put<IAction<ILoginDomainInfo>>({
          type: request.response.failed,
          payload: {
            showOTP: true,
            message: err.message,
            otpIndex: request.data.otpIndex,
            registerMobileOtp: request.data.registerMobileOtp,
          },
        });
      }
    }
  }
}

export default function* watchVerifyOTP() {
  yield takeLatest(AUTHENTICATION_VERIFY_OTP, doVerifyOTP);
}
