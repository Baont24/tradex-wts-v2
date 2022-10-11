import { COMMON_SHOW_NOTIFICATION, QUERY_CLIENT_DETAIL } from 'redux/actions';
import {
  IAction,
  IClientDetail,
  IClientDetailParams,
  INotification,
} from 'interfaces/common';
import { ToastType } from 'react-toastify';
import { call, put, takeLatest } from 'redux-saga/effects';
import { query } from 'utils/socketApi';
import config from 'config';

const getClientDetail = (params: IClientDetailParams) => {
  return query(config.apis.clientDetail, params);
};

function* doGetClientDetail(request: IAction<IClientDetailParams>) {
  try {
    let response: { data?: IClientDetail } | null = null;
    response = yield call(getClientDetail, request.payload);
    yield put({
      type: request.response?.success,
      payload: response?.data,
    });
  } catch (error) {
    if (request.response) {
      yield put({
        type: request.response.failed,
        payload: error.code || error.message,
      });
    }
    yield put<IAction<INotification>>({
      type: COMMON_SHOW_NOTIFICATION,
      payload: {
        type: ToastType.ERROR,
        title: 'Client Detail',
        content: error.code || error.message,
        contentParams: error.messageParams,
        time: new Date(),
      },
    });
  }
}

export function* watchGetClientDetail() {
  yield takeLatest(QUERY_CLIENT_DETAIL, doGetClientDetail);
}
