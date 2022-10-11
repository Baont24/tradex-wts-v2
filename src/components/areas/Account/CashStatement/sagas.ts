import {
  ACCOUNT_DERIVATIVES_CASH_STATEMENT,
  ACCOUNT_DERIVATIVES_CASH_STATEMENT_LOAD_MORE,
  ACCOUNT_EQUITY_CASH_STATEMENT,
  ACCOUNT_EQUITY_CASH_STATEMENT_LOAD_MORE,
} from './actions';
import { COMMON_SHOW_NOTIFICATION } from 'redux/actions';
import { IAction, INotification } from 'interfaces/common';
import {
  ICashStatementRequest,
  IEquityCashStatementResponse,
  ITransactionHistoryParams,
  ITransactionHistoryResponse,
} from 'interfaces/api';
import { IState } from 'redux/global-reducers';
import { ToastType } from 'react-toastify';
import { call, put, select, takeLatest } from 'redux-saga/effects';
import { query } from 'utils/socketApi';
import config from 'config';

const queryEquityCashStatement = (params: ICashStatementRequest) => {
  return query(config.apis.equityCashStatement, params);
};

const queryDerivativesCashStatement = (params: ITransactionHistoryParams) => {
  return query(config.apis.equityTransactionhistory, params);
};

function* doEquityCashStatement(request: IAction<ICashStatementRequest>) {
  try {
    const store: IState = yield select((state: IState) => ({
      equityCashStatement: state.equityCashStatement,
    }));
    const response: { data: IEquityCashStatementResponse } = yield call(
      queryEquityCashStatement,
      request.payload
    );

    if (Object.keys(response.data).length > 0 && request.response) {
      yield put<IAction<IEquityCashStatementResponse>>({
        type: request.response.success,
        payload: {
          ...response.data,
          list:
            store.equityCashStatement.data !== null
              ? [...store.equityCashStatement.data.list, ...response.data.list]
              : [...response.data.list],
        },
      });
    }
  } catch (error) {
    yield put<IAction<INotification>>({
      type: COMMON_SHOW_NOTIFICATION,
      payload: {
        type: ToastType.ERROR,
        title: 'Cash Statement',
        content: error.code || error.message,
        contentParams: error.messageParams,
        time: new Date(),
      },
    });
    if (request.response) {
      yield put<IAction<string>>({
        type: request.response.failed,
        payload: error.code || error.message,
      });
    }
  }
}

function* doDerivativesCashStatement(
  request: IAction<ITransactionHistoryParams>
) {
  try {
    const store: IState = yield select((state: IState) => ({
      derivativesCashStatement: state.derivativesCashStatement,
    }));

    const response: { data: ITransactionHistoryResponse } = yield call(
      queryDerivativesCashStatement,
      request.payload
    );

    if (response.data.listTransactionHistory.length > 0 && request.response) {
      yield put<IAction<ITransactionHistoryResponse>>({
        type: request.response.success,
        payload: {
          ...response.data,
          listTransactionHistory:
            store.derivativesCashStatement.data !== null
              ? [
                  ...store.derivativesCashStatement.data.listTransactionHistory,
                  ...response.data.listTransactionHistory,
                ]
              : [...response.data.listTransactionHistory],
        },
      });
    }
  } catch (error) {
    yield put<IAction<INotification>>({
      type: COMMON_SHOW_NOTIFICATION,
      payload: {
        type: ToastType.ERROR,
        title: 'Cash Statement',
        content: error.code || error.message,
        contentParams: error.messageParams,
        time: new Date(),
      },
    });
    if (request.response) {
      yield put<IAction<string>>({
        type: request.response.failed,
        payload: error.code || error.message,
      });
    }
  }
}

export function* watchCashStatement() {
  yield takeLatest(ACCOUNT_EQUITY_CASH_STATEMENT, doEquityCashStatement);
  yield takeLatest(
    ACCOUNT_EQUITY_CASH_STATEMENT_LOAD_MORE,
    doEquityCashStatement
  );
  yield takeLatest(
    ACCOUNT_DERIVATIVES_CASH_STATEMENT,
    doDerivativesCashStatement
  );
  yield takeLatest(
    ACCOUNT_DERIVATIVES_CASH_STATEMENT_LOAD_MORE,
    doDerivativesCashStatement
  );
}
