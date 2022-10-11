import {
  ACCOUNT_DERIVATIVE_ORDER_HISTORY,
  ACCOUNT_EQUITY_ORDER_HISTORY,
  ACCOUNT_EQUITY_ORDER_HISTORY_LOAD_MORE,
  COMMON_SHOW_NOTIFICATION,
} from 'redux/actions';
import { IAction, INotification } from 'interfaces/common';
import {
  IDrOrderHistoryParams,
  IDrOrderHistoryResponse,
  IOrderHistoryResponse,
  IParamsEquityOrderHistory,
} from 'interfaces/api';
import { ToastType } from 'react-toastify';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { query } from 'utils/socketApi';
import config from 'config';

const getOrderHistory = (params: IParamsEquityOrderHistory) => {
  return query(config.apis.equityOrderHistory, params);
};

const getDrOrderHistory = (params: IDrOrderHistoryParams) => {
  return query(config.apis.derivativeOrderHistory, params);
};

function* doGetOrderHistory(request: IAction<IParamsEquityOrderHistory[]>) {
  try {
    let localData: IOrderHistoryResponse[] = [];
    let response: Array<{ data: IOrderHistoryResponse[] }>;
    // Wait for api query all account ... to query all data
    response = yield all(
      request.payload.map((p) =>
        call(getOrderHistory, { ...p, fetchCount: 100, offset: p.offset || 0 })
      )
    );
    response.forEach((data) => {
      localData = [...data.data, ...localData];
    });

    if (request.response) {
      yield put<IAction<IOrderHistoryResponse[]>>({
        type: request.response.success,
        payload: localData,
      });
    }
  } catch (error) {
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
        title: 'Order History',
        content: error.code || error.message,
        contentParams: error.messageParams,
        time: new Date(),
      },
    });
  }
}

function* doGetDrOrderHistory(request: IAction<IDrOrderHistoryParams>) {
  try {
    const response: { data: IDrOrderHistoryResponse[] | [] } = yield call(
      getDrOrderHistory,
      request.payload
    );
    let payload = response?.data;
    let totalDataCount = response?.data?.length;
    let offset = 0;
    while (totalDataCount === 100 && payload) {
      offset += 100;
      const newResponse: { data: IDrOrderHistoryResponse[] } = yield call(
        getDrOrderHistory,
        {
          ...request.payload,
          offset,
        }
      );
      if (newResponse.data) {
        payload = [...payload, ...newResponse.data];
        totalDataCount = newResponse.data.length;
      } else {
        totalDataCount = 0;
      }
    }
    yield put({
      type: request.response?.success,
      payload,
    });
  } catch (error) {
    yield put<IAction<INotification>>({
      type: COMMON_SHOW_NOTIFICATION,
      payload: {
        type: ToastType.ERROR,
        title: 'Derivative Order History',
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

export function* watchGetEquityOrderHistory() {
  yield takeLatest(ACCOUNT_EQUITY_ORDER_HISTORY, doGetOrderHistory);
  yield takeLatest(ACCOUNT_EQUITY_ORDER_HISTORY_LOAD_MORE, doGetOrderHistory);
}

export function* watchGetDrOrderHistory() {
  yield takeLatest(ACCOUNT_DERIVATIVE_ORDER_HISTORY, doGetDrOrderHistory);
}
