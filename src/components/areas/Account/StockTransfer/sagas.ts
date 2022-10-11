import {
  ACCOUNT_QUERY_STOCK_TRANSFER,
  ACCOUNT_QUERY_STOCK_TRANSFER_HISTORY,
  ACCOUNT_QUERY_STOCK_TRANSFER_HISTORY_LOAD_MORE,
  ACCOUNT_SUBMIT_STOCK_TRANSFER,
} from './actions';
import { COMMON_SHOW_NOTIFICATION } from 'redux/actions';
import { IAction, IError, INotification } from 'interfaces/common';
import {
  IStockTransferHistoryParams,
  IStockTransferHistoryResponse,
  IStockTransferParams,
  IStockTransferResponse,
  IStockTransferSubmitParams,
  IStockTransferSubmitResponse,
} from 'interfaces/api';
import { ToastType } from 'react-toastify';
import { call, put, takeEvery, takeLeading } from 'redux-saga/effects';
import { query } from 'utils/socketApi';
import config from 'config';

const queryStockTransfer = (params: IStockTransferParams) => {
  return query(config.apis.queryStockTransfer, params);
};

const queryStockTransferHistory = (params: IStockTransferHistoryParams) => {
  return query(config.apis.queryStockTransferHistory, params);
};

const submitStockTransfer = (params: IStockTransferSubmitParams) => {
  return query(config.apis.submitStockTransfer, params);
};

function* doQueryStockTransfer(request: IAction<IStockTransferParams>) {
  try {
    const response = yield call(queryStockTransfer, request.payload);

    if (request.response) {
      yield put<IAction<IStockTransferResponse[]>>({
        type: request.response.success,
        payload: response.data,
      });
    }
  } catch (error) {
    console.error('Query stock transfer', error);

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
        title: 'Stock Transfer',
        content: error.code || error.message,
        contentParams: error.messageParams,
        time: new Date(),
      },
    });
  }
}

function* doQueryStockTransferHistory(
  request: IAction<IStockTransferHistoryParams>
) {
  try {
    const response = yield call(queryStockTransferHistory, request.payload);

    if (request.response) {
      yield put<IAction<IStockTransferHistoryResponse[]>>({
        type: request.response.success,
        payload: response.data,
      });
    }
  } catch (error) {
    console.error('Query stock transfer history', error);

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
        title: 'Stock Transfer History',
        content: error.code || error.message,
        contentParams: error.messageParams,
        time: new Date(),
      },
    });
  }
}

function* doSubmitStockTransfer(
  requests: IAction<IStockTransferSubmitParams[]>
) {
  const mutableResponseData: Array<IStockTransferSubmitResponse | IError> = [];

  for (const request of requests.payload) {
    try {
      const response = yield call(submitStockTransfer, request);

      yield put<IAction<INotification>>({
        type: COMMON_SHOW_NOTIFICATION,
        payload: {
          type: ToastType.SUCCESS,
          title: 'Stock Transfer',
          content: 'STOCK_TRANSFER_SYMBOL_SUCCESSFULLY',
          contentParams: {
            symbol: request.stockSymbol,
          },
          time: new Date(),
        },
      });

      mutableResponseData.push(response.data);
    } catch (error) {
      console.error('Submit stock transfer', error);

      mutableResponseData.push(error);

      yield put<IAction<INotification>>({
        type: COMMON_SHOW_NOTIFICATION,
        payload: {
          type: ToastType.ERROR,
          title: 'Stock Transfer',
          content: error.code || error.message,
          contentParams: error.messageParams,
          time: new Date(),
        },
      });
    }
  }
  if (requests.response) {
    yield put<IAction<Array<IStockTransferSubmitResponse | IError>>>({
      type: requests.response.success,
      payload: mutableResponseData,
    });
  }
}

export function* watchQueryStockTransfer() {
  yield takeLeading(ACCOUNT_QUERY_STOCK_TRANSFER, doQueryStockTransfer);
  yield takeLeading(
    ACCOUNT_QUERY_STOCK_TRANSFER_HISTORY,
    doQueryStockTransferHistory
  );
  yield takeLeading(
    ACCOUNT_QUERY_STOCK_TRANSFER_HISTORY_LOAD_MORE,
    doQueryStockTransferHistory
  );
  yield takeEvery(ACCOUNT_SUBMIT_STOCK_TRANSFER, doSubmitStockTransfer);
}
