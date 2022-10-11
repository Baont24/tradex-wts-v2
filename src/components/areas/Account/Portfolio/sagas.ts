import {
  ACCOUNT_OPEN_POSITION_ITEM,
  COMMON_SHOW_NOTIFICATION,
} from 'redux/actions';
import { IAction, INotification } from 'interfaces/common';
import {
  IDrAccountOpenPositionItemResponse,
  IEquityIDrAccountOpenPositionItemParams,
} from 'interfaces/api';
import { ToastType } from 'react-toastify';
import { call, put, takeLatest } from 'redux-saga/effects';
import { query } from 'utils/socketApi';
import config from 'config';

const getAccountOpenPositionItem = (
  params: IEquityIDrAccountOpenPositionItemParams
) => {
  return query(config.apis.equityAccountOpenPositionItem, params);
};

function* doGetAccountOpenPositionItem(
  request: IAction<IEquityIDrAccountOpenPositionItemParams>
) {
  try {
    let response: { data?: IDrAccountOpenPositionItemResponse } | null = null;
    response = yield call(getAccountOpenPositionItem, request.payload);
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
        title: 'Portfolio',
        content: error.code || error.message,
        contentParams: error.messageParams,
        time: new Date(),
      },
    });
  }
}

export function* watchGetAccountOpenPositionItem() {
  yield takeLatest(ACCOUNT_OPEN_POSITION_ITEM, doGetAccountOpenPositionItem);
}
