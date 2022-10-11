import { COMMON_SHOW_NOTIFICATION } from 'redux/actions';
import { IAction, INotification } from 'interfaces/common';
import { IIdentityAction, IResetPasswordAction } from 'interfaces/actions';
import {
  IIdentityParams,
  IResetPasswordParams,
  IVerifyIdentityResponse,
} from 'interfaces/api';
import { RESET_PASSWORD, VERIFY_IDENTITY, VERIFY_IDENTITY_OTP } from './action';
import { ToastType } from 'react-toastify';
import { call, put, takeLatest } from 'redux-saga/effects';
import { query } from 'utils/socketApi';
import config from 'config';
import store from 'redux/store';

function queryVerifyIdentity(params: IIdentityParams) {
  return query(config.apis.verifyIdentity, params);
}
function queryResetPassword(params: IResetPasswordParams) {
  return query(config.apis.resetPassword, params);
}

function* doVerifyIdentity(request: IAction<IIdentityAction>) {
  try {
    const res: { data: IVerifyIdentityResponse } = yield call(
      queryVerifyIdentity,
      request.payload
    );
    yield put({ type: request.response?.success, payload: res.data });
    if (request.payload.isResendOTP) {
      let seconds = 30;
      let countDownSecond: NodeJS.Timeout;
      countDownSecond = setInterval(() => {
        seconds--;
        store.dispatch<IAction<IVerifyIdentityResponse>>({
          type: VERIFY_IDENTITY_OTP,
          payload: {
            isCountDown: true,
            seconds,
            countDownMessage: `OTP is sent to your phone via SMS. (Resend in ${seconds}s)`,
          },
        });
        if (seconds <= 0) {
          clearInterval(countDownSecond);
        }
      }, 1000);
    }
  } catch (error) {
    console.log('Verify Identity Failed', error.message);

    if (request.response) {
      yield put<IAction<string>>({
        type: request.response.failed,
        payload: error.code || error.message,
      });
    }

    yield put<IAction<INotification>>({
      type: COMMON_SHOW_NOTIFICATION,
      payload: {
        type: ToastType.ERROR,
        title: 'Verify Identity',
        content: error.params || error.message,
        contentParams: error.messageParams,
        time: new Date(),
      },
    });
  }
}
function* doResetPassword(request: IAction<IResetPasswordAction>) {
  try {
    yield call(queryResetPassword, request.payload);

    yield put({ type: request.response?.success });

    yield put<IAction<INotification>>({
      type: COMMON_SHOW_NOTIFICATION,
      payload: {
        type: ToastType.SUCCESS,
        title: 'Reset Password',
        content: 'You have reset password successfully',
        contentParams: { error: 'You have reset password successfully' },
        time: new Date(),
      },
    });
  } catch (error) {
    console.log('Reset Password Failed', error.message);

    if (request.response) {
      yield put<IAction<string>>({
        type: request.response.failed,
        payload: error.code || error.message,
      });
    }

    yield put<IAction<INotification>>({
      type: COMMON_SHOW_NOTIFICATION,
      payload: {
        type: ToastType.ERROR,
        title: 'Reset Password',
        content: error.params || error.message,
        contentParams: error.messageParams,
        time: new Date(),
      },
    });
  }
}

export function* verifyIdentity() {
  yield takeLatest(VERIFY_IDENTITY, doVerifyIdentity);
  yield takeLatest(RESET_PASSWORD, doResetPassword);
}
