import {
  ACCOUNT_QUERY_INTEREST_EXPENSE_STATEMENT,
  ACCOUNT_QUERY_INTEREST_EXPENSE_STATEMENT_FAILED,
  ACCOUNT_QUERY_INTEREST_EXPENSE_STATEMENT_SUCCESS,
} from './actions';
import { ILoanExpenseStatementReducer } from 'interfaces/reducers';
import { IQueryReducer } from 'interfaces/common';

export const EquityInterestExpenseStatement: IQueryReducer<
  ILoanExpenseStatementReducer,
  string
> = (state = { data: { list: [] }, status: {} }, action) => {
  switch (action.type) {
    case ACCOUNT_QUERY_INTEREST_EXPENSE_STATEMENT:
      return { data: { list: [] }, status: { isLoading: true } };
    case ACCOUNT_QUERY_INTEREST_EXPENSE_STATEMENT_SUCCESS:
      return {
        data: action.payload as ILoanExpenseStatementReducer,
        status: { isSucceeded: true },
      };
    case ACCOUNT_QUERY_INTEREST_EXPENSE_STATEMENT_FAILED:
      return {
        data: { list: [] },
        status: { isFailed: true, errorMessage: action.payload as string },
      };
    default:
      return state;
  }
};
