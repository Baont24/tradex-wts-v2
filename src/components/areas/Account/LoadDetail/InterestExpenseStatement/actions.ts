import { IAction } from 'interfaces/common';
import { ILoanExpenseStatementRequest } from 'interfaces/api';

export const ACCOUNT_QUERY_INTEREST_EXPENSE_STATEMENT =
  'account/QUERY_INTEREST_EXPENSE_STATEMENT';
export const ACCOUNT_QUERY_INTEREST_EXPENSE_STATEMENT_SUCCESS =
  'account/QUERY_INTEREST_EXPENSE_STATEMENT_SUCCESS';
export const ACCOUNT_QUERY_INTEREST_EXPENSE_STATEMENT_FAILED =
  'account/QUERY_INTEREST_EXPENSE_STATEMENT_FAILED';

export const queryInterestExpenseStatement = (
  payload: ILoanExpenseStatementRequest
): IAction<ILoanExpenseStatementRequest> => ({
  type: ACCOUNT_QUERY_INTEREST_EXPENSE_STATEMENT,
  payload,
  response: {
    success: ACCOUNT_QUERY_INTEREST_EXPENSE_STATEMENT_SUCCESS,
    failed: ACCOUNT_QUERY_INTEREST_EXPENSE_STATEMENT_FAILED,
  },
});
