import {
  CHANGE_PASSWORD,
  CHANGE_PIN,
  COMMON_SHOW_NOTIFICATION,
} from 'redux/actions';
import { IAction, INotification } from 'interfaces/common';
import { IParamsChangePassword } from 'interfaces/api';
import { ToastType } from 'react-toastify';
import { call, put, takeLatest } from 'redux-saga/effects';
import { query } from 'utils/socketApi';
import config from 'config';

const queryChangePassword = (params: IParamsChangePassword) => {
  return query(config.apis.changePassword, params);
};

function* doChangePassword(request: IAction<IParamsChangePassword>) {
  try {
    const response: { data: { succes: boolean } } = yield call(
      queryChangePassword,
      request.payload
    );

    yield put({
      type: request.response?.success,
      payload: response.data,
    });
    yield put<IAction<INotification>>({
      type: COMMON_SHOW_NOTIFICATION,
      payload: {
        type: ToastType.SUCCESS,
        title: 'Change password',
        content: 'Change password successfully',
        time: new Date(),
      },
    });
  } catch (error) {
    yield put<IAction<INotification>>({
      type: COMMON_SHOW_NOTIFICATION,
      payload: {
        type: ToastType.ERROR,
        title: 'Change password',
        content: error.code || error.message,
        contentParams: error.messageParams,
        time: new Date(),
      },
    });
    yield put({
      type: request.response?.failed,
      payload: error.code || error.message,
    });
  }
}

export default function* watchChangePassword() {
  yield takeLatest(CHANGE_PASSWORD, doChangePassword);
}

// Change pin
const queryChangePIN = (params: IParamsChangePassword) => {
  return query(config.apis.changePIN, params);
};

function* doChangePIN(request: IAction<IParamsChangePassword>) {
  try {
    const response: { data: { succes: boolean } } = yield call(
      queryChangePIN,
      request.payload
    );

    yield put({
      type: request.response?.success,
      payload: response.data,
    });
    yield put<IAction<INotification>>({
      type: COMMON_SHOW_NOTIFICATION,
      payload: {
        type: ToastType.SUCCESS,
        title: 'Change PIN',
        content: 'Change PIN successfully',
        time: new Date(),
      },
    });
  } catch (error) {
    yield put<IAction<INotification>>({
      type: COMMON_SHOW_NOTIFICATION,
      payload: {
        type: ToastType.ERROR,
        title: 'Change PIN',
        content: error.code || error.message,
        contentParams: error.messageParams,
        time: new Date(),
      },
    });
    yield put({
      type: request.response?.failed,
      payload: error.code || error.message,
    });
  }
}

export function* watchChangePIN() {
  yield takeLatest(CHANGE_PIN, doChangePIN);
}
