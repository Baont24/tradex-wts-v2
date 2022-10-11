import {
  ACCOUNT_EQUITY_STOCK_TRANSACTION_HISTORY,
  ACCOUNT_EQUITY_STOCK_TRANSACTION_HISTORY_LOAD_MORE,
  COMMON_SHOW_NOTIFICATION,
} from 'redux/actions';
import { IAction, INotification, IRequest, IResponse } from 'interfaces/common';
import {
  IParamsEquityStockTransactionHistory,
  ISecuritiesStatementResponse,
} from 'interfaces/api';
import { ToastType } from 'react-toastify';
import { call, put, takeLatest } from 'redux-saga/effects';
import { query } from 'utils/socketApi';
import config from 'config';

const getStockTransactionHistory = (
  params: IParamsEquityStockTransactionHistory
) => {
  return query(config.apis.equityStockTransactionHistory, params);
};

function* doGetStockTransactionHistory(
  request: IRequest<IParamsEquityStockTransactionHistory>
) {
  try {
    const response: IResponse<ISecuritiesStatementResponse> = yield call(
      getStockTransactionHistory,
      request.payload
    );

    yield put<IAction<ISecuritiesStatementResponse>>({
      type: request.response.success,
      payload: response.data,
    });
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
        title: 'Stock Transaction History',
        content: error.code || error.message,
        contentParams: error.messageParams,
        time: new Date(),
      },
    });
  }
}

export function* watchGetStockTransactionHistory() {
  yield takeLatest(
    ACCOUNT_EQUITY_STOCK_TRANSACTION_HISTORY,
    doGetStockTransactionHistory
  );
  yield takeLatest(
    ACCOUNT_EQUITY_STOCK_TRANSACTION_HISTORY_LOAD_MORE,
    doGetStockTransactionHistory
  );
}
