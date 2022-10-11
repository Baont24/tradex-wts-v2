import {
  ACCOUNT_EQUITY_LOAN_STATEMENT,
  ACCOUNT_EQUITY_LOAN_STATEMENT_FAILED,
  ACCOUNT_EQUITY_LOAN_STATEMENT_SUCCESS,
} from 'redux/actions';
import { IAction } from 'interfaces/common';
import { IParamsEquityLoanStatement } from 'interfaces/api';

export const queryEquityLoanStatement = (
  data: IParamsEquityLoanStatement
): IAction<IParamsEquityLoanStatement> => ({
  type: ACCOUNT_EQUITY_LOAN_STATEMENT,
  response: {
    success: ACCOUNT_EQUITY_LOAN_STATEMENT_SUCCESS,
    failed: ACCOUNT_EQUITY_LOAN_STATEMENT_FAILED,
  },
  payload: data,
});
