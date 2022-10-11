import {
  COMMON_SHOW_NOTIFICATION,
  QUERY_CASH_TRANSFER_HISTORY,
  QUERY_CASH_TRANSFER_HISTORY_LOAD_MORE,
  QUERY_DERIVATIVE_CASH_TRANSFER_HISTORY,
  QUERY_DERIVATIVE_CASH_TRANSFER_HISTORY_LOAD_MORE,
  QUERY_VSD_CASH_TRANSFER_HISTORY,
  QUERY_VSD_CASH_TRANSFER_HISTORY_LOAD_MORE,
} from 'redux/actions';
import { IAction, INotification, IResponse } from 'interfaces/common';
import {
  ICashTransferHistoryResponse,
  IEquityCashTransferHistoryResponse,
  IParamsCashTransferHistory,
} from 'interfaces/api';
import { IState } from 'redux/global-reducers';
import { ToastType } from 'react-toastify';
import { call, put, select, takeLatest } from 'redux-saga/effects';
import { query } from 'utils/socketApi';
import config from 'config';

const queryEquityCashTransferHistory = (params: IParamsCashTransferHistory) => {
  return query(config.apis.equityCashTransferHistory, params);
};

function* doEquityCashTransferHistory(
  request: IAction<IParamsCashTransferHistory>
) {
  try {
    const response: IResponse<IEquityCashTransferHistoryResponse> = yield call(
      queryEquityCashTransferHistory,
      request.payload
    );
    if (request.response) {
      yield put<IAction<IEquityCashTransferHistoryResponse>>({
        type: request.response.success,
        payload: response.data,
      });
    }
  } catch (error) {
    yield put<IAction<INotification>>({
      type: COMMON_SHOW_NOTIFICATION,
      payload: {
        type: ToastType.ERROR,
        title: 'Cash Transfer History',
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

export function* watchEquityCashTransferHistory() {
  yield takeLatest(QUERY_CASH_TRANSFER_HISTORY, doEquityCashTransferHistory);
  yield takeLatest(
    QUERY_CASH_TRANSFER_HISTORY_LOAD_MORE,
    doEquityCashTransferHistory
  );
}

// Query VSD cash transfer
const queryVSDCashTransferHistory = (params: IParamsCashTransferHistory) => {
  return query(config.apis.VSDCashTransferHistory, params);
};

function* doVSDCashTransferHistory(
  request: IAction<IParamsCashTransferHistory>
) {
  try {
    let payload: ICashTransferHistoryResponse[] = [];
    const store: IState = yield select((s: IState) => ({
      selectedAccount: s.selectedAccount,
    }));
    const response: IResponse<ICashTransferHistoryResponse[]> = yield call(
      queryVSDCashTransferHistory,
      request.payload
    );
    payload = response.data.map((val) => {
      return {
        ...val,
        beneficiary: store.selectedAccount?.accountName || '',
      };
    });
    yield put({
      type: request.response?.success,
      payload,
    });
  } catch (error) {
    yield put<IAction<INotification>>({
      type: COMMON_SHOW_NOTIFICATION,
      payload: {
        type: ToastType.ERROR,
        title: 'Cash Transfer History',
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

export function* watchVSDCashTransferHistory() {
  yield takeLatest(QUERY_VSD_CASH_TRANSFER_HISTORY, doVSDCashTransferHistory);
  yield takeLatest(
    QUERY_VSD_CASH_TRANSFER_HISTORY_LOAD_MORE,
    doVSDCashTransferHistory
  );
}

// Query Derivative cash transfer
const queryDerivativeCashTransferHistory = (
  params: IParamsCashTransferHistory
) => {
  return query(config.apis.derivativeCashTransferHistory, params);
};

function* doDerivativeCashTransferHistory(
  request: IAction<IParamsCashTransferHistory>
) {
  try {
    const response: IResponse<ICashTransferHistoryResponse[]> = yield call(
      queryDerivativeCashTransferHistory,
      request.payload
    );

    yield put({
      type: request.response?.success,
      payload: response.data,
    });
  } catch (error) {
    yield put<IAction<INotification>>({
      type: COMMON_SHOW_NOTIFICATION,
      payload: {
        type: ToastType.ERROR,
        title: 'Cash Transfer History',
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

export function* watchDerivativeCashTransferHistory() {
  yield takeLatest(
    QUERY_DERIVATIVE_CASH_TRANSFER_HISTORY,
    doDerivativeCashTransferHistory
  );
  yield takeLatest(
    QUERY_DERIVATIVE_CASH_TRANSFER_HISTORY_LOAD_MORE,
    doDerivativeCashTransferHistory
  );
}
