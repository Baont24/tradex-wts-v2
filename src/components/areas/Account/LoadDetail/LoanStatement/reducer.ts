import {
  ACCOUNT_EQUITY_LOAN_STATEMENT,
  ACCOUNT_EQUITY_LOAN_STATEMENT_FAILED,
  ACCOUNT_EQUITY_LOAN_STATEMENT_SUCCESS,
} from 'redux/actions';
import { ILoanStatementResponse } from 'interfaces/api';
import { IQueryReducer } from 'interfaces/common';

export const EquityLoanStatementReducer: IQueryReducer<
  ILoanStatementResponse[],
  string
> = (state = { data: [], status: {} }, action) => {
  switch (action.type) {
    case ACCOUNT_EQUITY_LOAN_STATEMENT:
      return {
        data: [],
        status: {
          isLoading: true,
        },
      };
    case ACCOUNT_EQUITY_LOAN_STATEMENT_SUCCESS:
      return {
        data: action.payload as ILoanStatementResponse[],
        status: { isSucceeded: true },
      };
    case ACCOUNT_EQUITY_LOAN_STATEMENT_FAILED:
      return {
        data: [],
        status: { isFailed: true, errorMessage: action.payload as string },
      };
    default:
      return state;
  }
};
