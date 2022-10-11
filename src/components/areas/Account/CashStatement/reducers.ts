import {
  ACCOUNT_DERIVATIVES_CASH_STATEMENT,
  ACCOUNT_DERIVATIVES_CASH_STATEMENT_FAILED,
  ACCOUNT_DERIVATIVES_CASH_STATEMENT_LOAD_MORE,
  ACCOUNT_DERIVATIVES_CASH_STATEMENT_SUCCESS,
  ACCOUNT_EQUITY_CASH_STATEMENT,
  ACCOUNT_EQUITY_CASH_STATEMENT_FAILED,
  ACCOUNT_EQUITY_CASH_STATEMENT_LOAD_MORE,
  ACCOUNT_EQUITY_CASH_STATEMENT_SUCCESS,
} from './actions';
import {
  IEquityCashStatementResponse,
  ITransactionHistoryResponse,
} from 'interfaces/api';
import { IQueryReducer } from 'interfaces/common';

export const EquityCashStatement: IQueryReducer<
  IEquityCashStatementResponse | null,
  string
> = (state = { data: null, status: {} }, action) => {
  switch (action.type) {
    case ACCOUNT_EQUITY_CASH_STATEMENT:
      return { status: { isLoading: true }, data: null };
    case ACCOUNT_EQUITY_CASH_STATEMENT_LOAD_MORE:
      return { status: { isLoading: true }, data: state.data };
    case ACCOUNT_EQUITY_CASH_STATEMENT_SUCCESS:
      return {
        status: {
          isSucceeded: true,
          loadMore:
            (action.payload as IEquityCashStatementResponse).list.length > 0,
        },
        data: action.payload as IEquityCashStatementResponse,
      };
    case ACCOUNT_EQUITY_CASH_STATEMENT_FAILED:
      return {
        status: { isFailed: true, errorMessage: action.payload as string },
        data: null,
      };
    default:
      return state;
  }
};

export const DerivativesCashStatement: IQueryReducer<
  ITransactionHistoryResponse | null,
  string
> = (state = { data: null, status: {} }, action) => {
  switch (action.type) {
    case ACCOUNT_DERIVATIVES_CASH_STATEMENT:
      return { status: { isLoading: true }, data: null };
    case ACCOUNT_DERIVATIVES_CASH_STATEMENT_LOAD_MORE:
      return {
        status: {
          isLoading: true,
        },
        data: state.data,
      };
    case ACCOUNT_DERIVATIVES_CASH_STATEMENT_SUCCESS:
      return {
        status: {
          isSucceeded: true,
          loadMore:
            (action.payload as ITransactionHistoryResponse)
              .listTransactionHistory.length > 0,
        },
        data: action.payload as ITransactionHistoryResponse,
      };
    case ACCOUNT_DERIVATIVES_CASH_STATEMENT_FAILED:
      return {
        status: { isFailed: true, errorMessage: action.payload as string },
        data: null,
      };
    default:
      return state;
  }
};
