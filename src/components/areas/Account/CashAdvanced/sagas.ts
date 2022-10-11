import {
  ACCOUNT_QUERY_CASH_ADVANCED,
  ACCOUNT_QUERY_CASH_ADVANCED_AMOUNT,
  ACCOUNT_QUERY_CASH_ADVANCED_HISTORY,
  ACCOUNT_QUERY_CASH_ADVANCED_HISTORY_LOAD_MORE,
  ACCOUNT_QUERY_CASH_ADVANCED_INTEREST_AMT,
  ACCOUNT_QUERY_CASH_ADVANCED_LOAD_MORE,
  ACCOUNT_QUERY_CASH_ADVANCED_PAYMENT,
  ACCOUNT_QUERY_CASH_ADVANCED_PAYMENT_TIME,
} from './actions';
import { COMMON_SHOW_NOTIFICATION } from 'redux/actions';
import { IAction, INotification, IResponse } from 'interfaces/common';
import {
  IEquityCashAdvancedAmountParams,
  IEquityCashAdvancedAmountResponse,
  IEquityCashAdvancedHistoryParams,
  IEquityCashAdvancedHistoryResponse,
  IEquityCashAdvancedParams,
  IEquityCashAdvancedPaymentParams,
  IEquityCashAdvancedPaymentResponse,
  IEquityCashAdvancedPaymentTimeParams,
  IEquityCashAdvancedPaymentTimeResponse,
  IEquityCashAdvancedResponse,
} from 'interfaces/api';
import { IEquityCashAdvancedPaymentAction } from 'interfaces/actions';
import {
  IMASEquityCalculateInterestAmtParams,
  IMASEquityCalculateInterestAmtResponse,
  IMASEquityCashAdvancedParams,
  IMASEquityCashAdvancedPaymentParams,
  IMASEquityCashAdvancedPaymentResponse,
  IMASEquityCashAdvancedResponse,
} from 'interfaces/apiTTL';
import { IState } from 'redux/global-reducers';
import { ToastType } from 'react-toastify';
import { call, put, select, takeLatest } from 'redux-saga/effects';
import { formatStringToNumber, multiplyBy1000 } from 'utils/common';
import { query, queryRestTTL } from 'utils/socketApi';
import config from 'config';

const queryEquityCashAdvanced = (params: IEquityCashAdvancedParams) => {
  return query(config.apis.equityCashAdvanced, params);
};

const queryEquityCashAdvancedHistory = (
  params: IEquityCashAdvancedHistoryParams
) => {
  return query(config.apis.equityCashAdvancedHistory, params);
};

const queryEquityCashAdvancedAmount = (
  params: IEquityCashAdvancedAmountParams
) => {
  return query(config.apis.equityCashAdvancedAmount, params);
};

const queryEquityCashAdvancedPayment = (
  params: IEquityCashAdvancedPaymentParams
) => {
  return query(config.apis.equityCashAdvancedPayment, params);
};

const queryEquityCashAdvancedPaymentTime = (
  params: IEquityCashAdvancedPaymentTimeParams
) => {
  return query(config.apis.equityCashAdvancedPaymentTime, params);
};

const queryEquityCashAdvancedIICA = (params: IMASEquityCashAdvancedParams) => {
  return queryRestTTL(config.apis.equityCashAdvancedIICA, params);
};

const queryEquityCashAdvancedPaymentIICA = (
  params: IMASEquityCashAdvancedPaymentParams
) => {
  return queryRestTTL(config.apis.equityCashAdvancedPaymentIICA, params);
};

const queryEquityCalculateInterestAmtIICA = (
  params: IMASEquityCalculateInterestAmtParams
) => {
  return queryRestTTL(config.apis.equityCalculateInterestAmtIICA, params);
};

function* calculateInterestAmt(
  request: IAction<IMASEquityCalculateInterestAmtParams>
) {
  try {
    const payload: IMASEquityCalculateInterestAmtResponse = yield call(
      queryEquityCalculateInterestAmtIICA,
      request.payload
    );
    if (request.response) {
      yield put<IAction<IMASEquityCalculateInterestAmtResponse>>({
        type: request.response.success,
        payload,
      });
    }
  } catch (error) {
    console.error('Equity cash advanced', error);
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
        title: 'Cash In Advanced',
        content: error.code || error.message,
        contentParams: error.messageParams,
        time: new Date(),
      },
    });
  }
}

function* doQueryEquityCashAdvanced(
  request: IAction<IEquityCashAdvancedParams>
) {
  try {
    const store: IState = yield select((s: IState) => ({
      selectedAccount: s.selectedAccount,
    }));
    let payload: IEquityCashAdvancedResponse[] = [];
    if (store.selectedAccount?.isIICA) {
      const response: IMASEquityCashAdvancedResponse = yield call(
        queryEquityCashAdvancedIICA,
        {
          subAccountID: request.payload.accountNo,
          mvBankID: store.selectedAccount.bankIICAId ?? '',
          mvSettlement: '3T',
        }
      );
      payload = response.mvChildBeanList.map((val) => {
        return {
          netSoldAmount: multiplyBy1000(val.mvAmount),
          mvAvailableAmount: multiplyBy1000(val.mvAvailableAmount),
          value:
            formatStringToNumber(val.mvPrice) *
            formatStringToNumber(val.mvQuantity),
          volume: formatStringToNumber(val.mvQuantity),
          feeTax: multiplyBy1000(val.tradingFee),
          soldDate: val.tradeDate,
          stock: val.mvStockID,
          id: val.mvContractID,
          paymentDate: val.cashSettleDay,
          mvSettleDay: val.mvSettleDay,
          mvOrderID: val.mvOrderID,
        };
      });
    } else {
      const response: IResponse<IEquityCashAdvancedResponse[]> = yield call(
        queryEquityCashAdvanced,
        request.payload
      );
      payload = response.data;
    }

    if (request.response) {
      yield put<IAction<IEquityCashAdvancedResponse[]>>({
        type: request.response.success,
        payload,
      });
    }
  } catch (error) {
    console.error('Equity cash advanced', error);
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
        title: 'Cash In Advanced',
        content: error.code || error.message,
        contentParams: error.messageParams,
        time: new Date(),
      },
    });
  }
}

function* doQueryEquityCashAdvancedHistory(
  request: IAction<IEquityCashAdvancedHistoryParams>
) {
  try {
    const response: IResponse<
      IEquityCashAdvancedHistoryResponse[]
    > = yield call(queryEquityCashAdvancedHistory, request.payload);

    if (request.response) {
      yield put<IAction<IEquityCashAdvancedHistoryResponse[]>>({
        type: request.response.success,
        payload: response.data,
      });
    }
  } catch (error) {
    console.error('Equity cash advanced history', error);
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
        title: 'Cash In Advanced',
        content: error.code || error.message,
        contentParams: error.messageParams,
        time: new Date(),
      },
    });
  }
}

function* doQueryEquityCashAdvancedAmount(
  request: IAction<IEquityCashAdvancedAmountParams>
) {
  try {
    const store: IState = yield select((s: IState) => ({
      selectedAccount: s.selectedAccount,
    }));
    let payload: IEquityCashAdvancedAmountResponse;
    const response: IResponse<IEquityCashAdvancedAmountResponse> = yield call(
      queryEquityCashAdvancedAmount,
      request.payload
    );
    payload = response.data;

    if (store.selectedAccount?.isIICA) {
      const responseCashAdvanced: IMASEquityCashAdvancedResponse = yield call(
        queryEquityCashAdvancedIICA,
        {
          subAccountID: request.payload.accountNo,
          mvBankID: store.selectedAccount.bankIICAId ?? '',
          mvSettlement: '3T',
        }
      );
      const availableCashAdvance =
        responseCashAdvanced.mvChildBeanList.reduce(
          (acc, val) => acc + multiplyBy1000(val.mvAmount),
          0
        ) ?? 0;
      payload = {
        ...payload,
        availableCashAdvance,
      };
    }

    if (request.response) {
      yield put<IAction<IEquityCashAdvancedAmountResponse>>({
        type: request.response.success,
        payload,
      });
    }
  } catch (error) {
    console.error('Equity cash advanced amount', error);
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
        title: 'Cash In Advanced',
        content: error.code || error.message,
        contentParams: error.messageParams,
        time: new Date(),
      },
    });
  }
}

function* doQueryEquityCashAdvancedPayment(
  request: IAction<IEquityCashAdvancedPaymentAction>
) {
  try {
    const store: IState = yield select((s: IState) => ({
      selectedAccount: s.selectedAccount,
    }));
    const itemCashAdvancedIICA = request.payload.itemSelected;
    let payload: IEquityCashAdvancedPaymentResponse = { success: false };
    if (store.selectedAccount?.isIICA) {
      const maxTPlusX =
        itemCashAdvancedIICA?.reduce((acc, val: { mvSettleDay: string }) => {
          const tx = +val.mvSettleDay[1];
          const max = +acc[1];
          if (tx > max) {
            return val.mvSettleDay;
          }
          return acc;
        }, 'T0') ?? 'T0';

      const response: IMASEquityCashAdvancedPaymentResponse = yield call(
        queryEquityCashAdvancedPaymentIICA,
        {
          subAccountID: store.selectedAccount.accountNumber,
          mvAmount: (request.payload.submitAmount / 1000).toString(),
          mvTotalAmt: request.payload.availableAmount.toString(),
          mvBankID: store.selectedAccount.bankIICAId ?? '',
          mvContractIDStrArray:
            itemCashAdvancedIICA?.map((val) => val.id).join('|') ?? '|',
          mvOrderIDStrArray:
            itemCashAdvancedIICA?.map((val) => val.mvOrderID).join('|') ?? '|',
          mvTPLUSX: maxTPlusX,
        }
      );
      payload = { success: response.mvResult === 'SUCCESS' };
    } else {
      const responseTime: IResponse<IEquityCashAdvancedPaymentTimeResponse> = yield call(
        queryEquityCashAdvancedPaymentTime,
        { accountNo: request.payload.accountNo }
      );

      if (!responseTime.data.result) {
        throw new Error('Payment Time Error');
      }

      const response: IResponse<IEquityCashAdvancedPaymentResponse> = yield call(
        queryEquityCashAdvancedPayment,
        request.payload
      );

      payload = response.data;
    }

    if (payload.success) {
      yield put<IAction<INotification>>({
        type: COMMON_SHOW_NOTIFICATION,
        payload: {
          type: ToastType.SUCCESS,
          title: 'Cash In Advanced',
          content: 'MAS_CASH_ADVANCE_SUCCESS',
          time: new Date(),
        },
      });
    } else {
      yield put<IAction<INotification>>({
        type: COMMON_SHOW_NOTIFICATION,
        payload: {
          type: ToastType.ERROR,
          title: 'Cash In Advanced ',
          content: 'Cash In Advanced Failed',
          time: new Date(),
        },
      });
    }

    if (request.response) {
      yield put<IAction<IEquityCashAdvancedPaymentResponse>>({
        type: request.response.success,
        payload,
      });
    }
  } catch (error) {
    console.error('Equity cash advanced payment', error);
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
        title: 'Cash In Advanced',
        content: error.code || error.message,
        contentParams: error.messageParams,
        time: new Date(),
      },
    });
  }
}

function* doQueryEquityCashAdvancedPaymentTime(
  request: IAction<IEquityCashAdvancedPaymentTimeParams>
) {
  try {
    const response: IResponse<IEquityCashAdvancedPaymentTimeResponse> = yield call(
      queryEquityCashAdvancedPaymentTime,
      request.payload
    );

    if (request.response) {
      yield put<IAction<IEquityCashAdvancedPaymentTimeResponse>>({
        type: request.response.success,
        payload: response.data,
      });
    }
  } catch (error) {
    console.error('Equity cash advanced payment time', error);
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
        title: 'Cash In Advanced',
        content: error.code || error.message,
        contentParams: error.messageParams,
        time: new Date(),
      },
    });
  }
}

export function* watchQueryEquityCashAdvanced() {
  yield takeLatest(ACCOUNT_QUERY_CASH_ADVANCED, doQueryEquityCashAdvanced);
  yield takeLatest(
    ACCOUNT_QUERY_CASH_ADVANCED_LOAD_MORE,
    doQueryEquityCashAdvanced
  );
  yield takeLatest(
    ACCOUNT_QUERY_CASH_ADVANCED_HISTORY,
    doQueryEquityCashAdvancedHistory
  );
  yield takeLatest(
    ACCOUNT_QUERY_CASH_ADVANCED_HISTORY_LOAD_MORE,
    doQueryEquityCashAdvancedHistory
  );
  yield takeLatest(
    ACCOUNT_QUERY_CASH_ADVANCED_AMOUNT,
    doQueryEquityCashAdvancedAmount
  );
  yield takeLatest(
    ACCOUNT_QUERY_CASH_ADVANCED_PAYMENT,
    doQueryEquityCashAdvancedPayment
  );
  yield takeLatest(
    ACCOUNT_QUERY_CASH_ADVANCED_PAYMENT_TIME,
    doQueryEquityCashAdvancedPaymentTime
  );
  yield takeLatest(
    ACCOUNT_QUERY_CASH_ADVANCED_INTEREST_AMT,
    calculateInterestAmt
  );
}
