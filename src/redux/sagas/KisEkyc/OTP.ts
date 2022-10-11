import { COMMON_SHOW_NOTIFICATION } from 'redux/actions';
import { IEkycOTPParams, IEkycVerifyOTPParams } from 'interfaces/ekyc';
import { IRequest } from 'interfaces/common';
import { ToastType as NOTIFICATION_TYPE } from 'react-toastify';
import { SEND_EKYC_OTP, VERIFY_EKYC_OTP } from 'screens/KisEkyc/action';
import { call, put, takeLatest } from 'redux-saga/effects';
import { query } from 'utils/socketApi';
import config from 'config';

const sendOTP = (params: IEkycOTPParams) => {
  return query(config.apis.ekycAdminSendOtp, params);
};

function* doSendOTP(request: IRequest<IEkycOTPParams>) {
  console.log('sending OTP');

  try {
    const response = yield call(sendOTP, request.payload);
    console.log('response', response);
    yield put({
      type: request.response.success,
      payload: response.data.otpId,
    });
    yield put({
      type: COMMON_SHOW_NOTIFICATION,
      payload: {
        type: NOTIFICATION_TYPE.SUCCESS,
        title: 'Send OTP',
        content: 'Success',
        time: new Date(),
      },
    });
  } catch (error) {
    yield put({
      type: request.response.failed,
    });
    yield put({
      type: COMMON_SHOW_NOTIFICATION,
      payload: {
        type: NOTIFICATION_TYPE.ERROR,
        title: 'Send OTP',
        content: error.code ? error.code : error.message,
        time: new Date(),
      },
    });
  }
}

export function* watchSendOTP() {
  yield takeLatest(SEND_EKYC_OTP, doSendOTP);
}

const VerifyOTP = (params: IEkycVerifyOTPParams) => {
  return query(config.apis.ekycAdminVerifyOtp, params);
};

function* doVerifyOTP(request: IRequest<IEkycVerifyOTPParams>) {
  console.log('Verifying OTP');

  try {
    const response = yield call(VerifyOTP, request.payload);
    yield put({
      type: request.response.success,
      payload: response,
    });
    yield put({
      type: COMMON_SHOW_NOTIFICATION,
      payload: {
        type: NOTIFICATION_TYPE.SUCCESS,
        title: 'Verify OTP',
        content: 'Success',
        time: new Date(),
      },
    });
  } catch (error) {
    yield put({
      type: request.response.failed,
    });
    yield put({
      type: COMMON_SHOW_NOTIFICATION,
      payload: {
        type: NOTIFICATION_TYPE.ERROR,
        title: 'Verify OTP',
        content: error.code ? error.code : error.message,
        time: new Date(),
      },
    });
  }
}

export function* watchVerifyOTP() {
  yield takeLatest(VERIFY_EKYC_OTP, doVerifyOTP);
}
