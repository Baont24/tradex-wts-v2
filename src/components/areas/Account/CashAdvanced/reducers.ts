import {
  ACCOUNT_QUERY_CASH_ADVANCED,
  ACCOUNT_QUERY_CASH_ADVANCED_AMOUNT,
  ACCOUNT_QUERY_CASH_ADVANCED_AMOUNT_FAILED,
  ACCOUNT_QUERY_CASH_ADVANCED_AMOUNT_SUCCESS,
  ACCOUNT_QUERY_CASH_ADVANCED_FAILED,
  ACCOUNT_QUERY_CASH_ADVANCED_HISTORY,
  ACCOUNT_QUERY_CASH_ADVANCED_HISTORY_FAILED,
  ACCOUNT_QUERY_CASH_ADVANCED_HISTORY_LOAD_MORE,
  ACCOUNT_QUERY_CASH_ADVANCED_HISTORY_SUCCESS,
  ACCOUNT_QUERY_CASH_ADVANCED_INTEREST_AMT,
  ACCOUNT_QUERY_CASH_ADVANCED_INTEREST_AMT_FAILED,
  ACCOUNT_QUERY_CASH_ADVANCED_INTEREST_AMT_SUCCESS,
  ACCOUNT_QUERY_CASH_ADVANCED_LOAD_MORE,
  ACCOUNT_QUERY_CASH_ADVANCED_PAYMENT,
  ACCOUNT_QUERY_CASH_ADVANCED_PAYMENT_FAILED,
  ACCOUNT_QUERY_CASH_ADVANCED_PAYMENT_SUCCESS,
  ACCOUNT_QUERY_CASH_ADVANCED_PAYMENT_TIME,
  ACCOUNT_QUERY_CASH_ADVANCED_PAYMENT_TIME_FAILED,
  ACCOUNT_QUERY_CASH_ADVANCED_PAYMENT_TIME_SUCCESS,
  ACCOUNT_QUERY_CASH_ADVANCED_SUCCESS,
} from './actions';
import { AUTHENTICATION_LOGOUT } from 'redux/actions';
import {
  IEquityCashAdvancedAmountResponse,
  IEquityCashAdvancedHistoryResponse,
  IEquityCashAdvancedPaymentResponse,
  IEquityCashAdvancedPaymentTimeResponse,
  IEquityCashAdvancedResponse,
} from 'interfaces/api';
import { IMASEquityCalculateInterestAmtResponse } from 'interfaces/apiTTL';
import { IQueryReducer } from 'interfaces/common';

export const EquityCashAdvanced: IQueryReducer<
  IEquityCashAdvancedResponse[],
  string
> = (state = { data: [], status: {} }, action) => {
  switch (action.type) {
    case ACCOUNT_QUERY_CASH_ADVANCED:
      return {
        data: [],
        status: {
          isLoading: true,
        },
      };
    case ACCOUNT_QUERY_CASH_ADVANCED_LOAD_MORE:
      return {
        data: state.data,
        status: {
          isLoading: true,
        },
      };
    case ACCOUNT_QUERY_CASH_ADVANCED_SUCCESS:
      return {
        data: [
          ...state.data,
          ...(action.payload as IEquityCashAdvancedResponse[]),
        ],
        status: {
          isSucceeded: true,
          loadMore:
            (action.payload as IEquityCashAdvancedResponse[]).length > 0,
        },
      };
    case ACCOUNT_QUERY_CASH_ADVANCED_FAILED:
      return {
        data: [],
        status: {
          isFailed: true,
          errorMessage: action.payload as string,
        },
      };
    case AUTHENTICATION_LOGOUT:
      return {
        data: [],
        status: {},
      };
    default:
      return state;
  }
};

export const EquityCashAdvancedInterestAmt: IQueryReducer<IMASEquityCalculateInterestAmtResponse | null> = (
  state = { data: null, status: {} },
  action
) => {
  switch (action.type) {
    case ACCOUNT_QUERY_CASH_ADVANCED_INTEREST_AMT:
      return {
        data: null,
        status: {
          isLoading: true,
        },
      };
    case ACCOUNT_QUERY_CASH_ADVANCED_INTEREST_AMT_SUCCESS:
      return {
        data: action.payload as IMASEquityCalculateInterestAmtResponse,
        status: {
          isSucceeded: true,
        },
      };
    case ACCOUNT_QUERY_CASH_ADVANCED_INTEREST_AMT_FAILED:
      return {
        data: null,
        status: {
          isFailed: true,
        },
      };
    case AUTHENTICATION_LOGOUT:
      return {
        data: null,
        status: {},
      };
    default:
      return state;
  }
};

export const EquityCashAdvancedHistory: IQueryReducer<
  IEquityCashAdvancedHistoryResponse[],
  string
> = (state = { data: [], status: {} }, action) => {
  switch (action.type) {
    case ACCOUNT_QUERY_CASH_ADVANCED_HISTORY:
      return {
        data: [],
        status: {
          isLoading: true,
        },
      };
    case ACCOUNT_QUERY_CASH_ADVANCED_HISTORY_LOAD_MORE:
      return {
        data: state.data,
        status: {
          isLoading: true,
        },
      };
    case ACCOUNT_QUERY_CASH_ADVANCED_HISTORY_SUCCESS:
      return {
        data: [
          ...state.data,
          ...(action.payload as IEquityCashAdvancedHistoryResponse[]),
        ],
        status: {
          isSucceeded: true,
          loadMore:
            (action.payload as IEquityCashAdvancedHistoryResponse[]).length > 0,
        },
      };
    case ACCOUNT_QUERY_CASH_ADVANCED_HISTORY_FAILED:
      return {
        data: [],
        status: {
          isFailed: true,
          errorMessage: action.payload as string,
        },
      };
    case AUTHENTICATION_LOGOUT:
      return {
        data: [],
        status: {},
      };
    default:
      return state;
  }
};

export const EquityCashAdvancedAmount: IQueryReducer<
  IEquityCashAdvancedAmountResponse | null,
  string
> = (state = { data: null, status: {} }, action) => {
  switch (action.type) {
    case ACCOUNT_QUERY_CASH_ADVANCED_AMOUNT:
      return {
        data: null,
        status: {
          isLoading: true,
        },
      };
    case ACCOUNT_QUERY_CASH_ADVANCED_AMOUNT_SUCCESS:
      return {
        data: action.payload as IEquityCashAdvancedAmountResponse,
        status: {
          isSucceeded: true,
        },
      };
    case ACCOUNT_QUERY_CASH_ADVANCED_AMOUNT_FAILED:
      return {
        data: null,
        status: {
          isFailed: true,
          errorMessage: action.payload as string,
        },
      };
    case AUTHENTICATION_LOGOUT:
      return {
        data: null,
        status: {},
      };
    default:
      return state;
  }
};

export const EquityCashAdvancedPayment: IQueryReducer<
  IEquityCashAdvancedPaymentResponse | null,
  string
> = (state = { data: null, status: {} }, action) => {
  switch (action.type) {
    case ACCOUNT_QUERY_CASH_ADVANCED_PAYMENT:
      return {
        data: null,
        status: {
          isLoading: true,
        },
      };
    case ACCOUNT_QUERY_CASH_ADVANCED_PAYMENT_SUCCESS:
      return {
        data: action.payload as IEquityCashAdvancedPaymentResponse,
        status: {
          isSucceeded: true,
        },
      };
    case ACCOUNT_QUERY_CASH_ADVANCED_PAYMENT_FAILED:
      return {
        data: null,
        status: {
          isFailed: true,
          errorMessage: action.payload as string,
        },
      };
    case AUTHENTICATION_LOGOUT:
      return {
        data: null,
        status: {},
      };
    default:
      return state;
  }
};

export const EquityCashAdvancedPaymentTime: IQueryReducer<
  IEquityCashAdvancedPaymentTimeResponse | null,
  string
> = (state = { data: null, status: {} }, action) => {
  switch (action.type) {
    case ACCOUNT_QUERY_CASH_ADVANCED_PAYMENT_TIME:
      return {
        data: null,
        status: {
          isLoading: true,
        },
      };
    case ACCOUNT_QUERY_CASH_ADVANCED_PAYMENT_TIME_SUCCESS:
      return {
        data: action.payload as IEquityCashAdvancedPaymentTimeResponse,
        status: {
          isSucceeded: true,
        },
      };
    case ACCOUNT_QUERY_CASH_ADVANCED_PAYMENT_TIME_FAILED:
      return {
        data: null,
        status: {
          isFailed: true,
          errorMessage: action.payload as string,
        },
      };
    case AUTHENTICATION_LOGOUT:
      return {
        data: null,
        status: {},
      };
    default:
      return state;
  }
};
