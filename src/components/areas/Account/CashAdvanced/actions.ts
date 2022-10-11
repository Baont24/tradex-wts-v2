import { IAction } from 'interfaces/common';
import {
  IEquityCashAdvancedAmountParams,
  IEquityCashAdvancedHistoryParams,
  IEquityCashAdvancedParams,
  IEquityCashAdvancedPaymentTimeParams,
} from 'interfaces/api';
import { IEquityCashAdvancedPaymentAction } from 'interfaces/actions';
import { IMASEquityCalculateInterestAmtParams } from 'interfaces/apiTTL';

export const ACCOUNT_QUERY_CASH_ADVANCED = 'account/QUERY_CASH_ADVANCED';
export const ACCOUNT_QUERY_CASH_ADVANCED_LOAD_MORE =
  'account/QUERY_CASH_ADVANCED_LOAD_MORE';
export const ACCOUNT_QUERY_CASH_ADVANCED_SUCCESS =
  'account/QUERY_CASH_ADVANCED_SUCCESS';
export const ACCOUNT_QUERY_CASH_ADVANCED_FAILED =
  'account/QUERY_CASH_ADVANCED_FAILED';

export const ACCOUNT_QUERY_CASH_ADVANCED_HISTORY =
  'account/QUERY_CASH_ADVANCED_HISTORY';
export const ACCOUNT_QUERY_CASH_ADVANCED_HISTORY_LOAD_MORE =
  'account/QUERY_CASH_ADVANCED_HISTORY_LOAD_MORE';
export const ACCOUNT_QUERY_CASH_ADVANCED_HISTORY_SUCCESS =
  'account/QUERY_CASH_ADVANCED_HISTORY_SUCCESS';
export const ACCOUNT_QUERY_CASH_ADVANCED_HISTORY_FAILED =
  'account/QUERY_CASH_ADVANCED_HISTORY_FAILED';

export const ACCOUNT_QUERY_CASH_ADVANCED_AMOUNT =
  'account/QUERY_CASH_ADVANCED_AMOUNT';
export const ACCOUNT_QUERY_CASH_ADVANCED_AMOUNT_SUCCESS =
  'account/QUERY_CASH_ADVANCED_AMOUNT_SUCCESS';
export const ACCOUNT_QUERY_CASH_ADVANCED_AMOUNT_FAILED =
  'account/QUERY_CASH_ADVANCED_AMOUNT_FAILED';

export const ACCOUNT_QUERY_CASH_ADVANCED_PAYMENT =
  'account/QUERY_CASH_ADVANCED_PAYMENT';
export const ACCOUNT_QUERY_CASH_ADVANCED_PAYMENT_SUCCESS =
  'account/QUERY_CASH_ADVANCED_PAYMENT_SUCCESS';
export const ACCOUNT_QUERY_CASH_ADVANCED_PAYMENT_FAILED =
  'account/QUERY_CASH_ADVANCED_PAYMENT_FAILED';

export const ACCOUNT_QUERY_CASH_ADVANCED_PAYMENT_TIME =
  'account/QUERY_CASH_ADVANCED_PAYMENT_TIME';
export const ACCOUNT_QUERY_CASH_ADVANCED_PAYMENT_TIME_SUCCESS =
  'account/QUERY_CASH_ADVANCED_PAYMENT_TIME_SUCCESS';
export const ACCOUNT_QUERY_CASH_ADVANCED_PAYMENT_TIME_FAILED =
  'account/QUERY_CASH_ADVANCED_PAYMENT_TIME_FAILED';

export const ACCOUNT_QUERY_CASH_ADVANCED_INTEREST_AMT =
  'account/QUERY_CASH_ADVANCED_INTEREST_AMT';
export const ACCOUNT_QUERY_CASH_ADVANCED_INTEREST_AMT_SUCCESS =
  'account/QUERY_CASH_ADVANCED_INTEREST_AMT_SUCCESS';
export const ACCOUNT_QUERY_CASH_ADVANCED_INTEREST_AMT_FAILED =
  'account/QUERY_CASH_ADVANCED_INTEREST_AMT_FAILED';

export const queryEquityCashAdvanced = (
  payload: IEquityCashAdvancedParams
): IAction<IEquityCashAdvancedParams> => ({
  type:
    payload.offset != null && payload.offset > 0
      ? ACCOUNT_QUERY_CASH_ADVANCED_LOAD_MORE
      : ACCOUNT_QUERY_CASH_ADVANCED,
  payload,
  response: {
    success: ACCOUNT_QUERY_CASH_ADVANCED_SUCCESS,
    failed: ACCOUNT_QUERY_CASH_ADVANCED_FAILED,
  },
});

export const queryEquityCalculateInterestAmt = (
  payload: IMASEquityCalculateInterestAmtParams
): IAction<IMASEquityCalculateInterestAmtParams> => ({
  type: ACCOUNT_QUERY_CASH_ADVANCED_INTEREST_AMT,
  payload,
  response: {
    success: ACCOUNT_QUERY_CASH_ADVANCED_INTEREST_AMT_SUCCESS,
    failed: ACCOUNT_QUERY_CASH_ADVANCED_INTEREST_AMT_FAILED,
  },
});

export const queryEquityCashAdvancedHistory = (
  payload: IEquityCashAdvancedHistoryParams
): IAction<IEquityCashAdvancedHistoryParams> => ({
  type:
    payload.offset != null && payload.offset > 0
      ? ACCOUNT_QUERY_CASH_ADVANCED_HISTORY_LOAD_MORE
      : ACCOUNT_QUERY_CASH_ADVANCED_HISTORY,
  payload,
  response: {
    success: ACCOUNT_QUERY_CASH_ADVANCED_HISTORY_SUCCESS,
    failed: ACCOUNT_QUERY_CASH_ADVANCED_HISTORY_FAILED,
  },
});

export const queryEquityCashAdvancedAmount = (
  payload: IEquityCashAdvancedAmountParams
): IAction<IEquityCashAdvancedAmountParams> => ({
  type: ACCOUNT_QUERY_CASH_ADVANCED_AMOUNT,
  payload,
  response: {
    success: ACCOUNT_QUERY_CASH_ADVANCED_AMOUNT_SUCCESS,
    failed: ACCOUNT_QUERY_CASH_ADVANCED_AMOUNT_FAILED,
  },
});

export const queryEquityCashAdvancedPayment = (
  payload: IEquityCashAdvancedPaymentAction
): IAction<IEquityCashAdvancedPaymentAction> => ({
  type: ACCOUNT_QUERY_CASH_ADVANCED_PAYMENT,
  payload,
  response: {
    success: ACCOUNT_QUERY_CASH_ADVANCED_PAYMENT_SUCCESS,
    failed: ACCOUNT_QUERY_CASH_ADVANCED_PAYMENT_FAILED,
  },
});

export const queryEquityCashAdvancedPaymentTime = (
  payload: IEquityCashAdvancedPaymentTimeParams
): IAction<IEquityCashAdvancedPaymentTimeParams> => ({
  type: ACCOUNT_QUERY_CASH_ADVANCED_PAYMENT_TIME,
  payload,
  response: {
    success: ACCOUNT_QUERY_CASH_ADVANCED_PAYMENT_TIME_SUCCESS,
    failed: ACCOUNT_QUERY_CASH_ADVANCED_PAYMENT_TIME_FAILED,
  },
});
