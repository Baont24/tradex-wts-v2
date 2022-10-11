import {
  EQUITY_LOAN_CONTRACT,
  EQUITY_LOAN_CONTRACT_FAILED,
  EQUITY_LOAN_CONTRACT_SUCCESS,
} from 'redux/actions';
import { IAction } from 'interfaces/common';
import { IParamsEquityLoanStatement } from 'interfaces/api';

export const queryEquityLoanContract = (
  data: IParamsEquityLoanStatement
): IAction<IParamsEquityLoanStatement> => ({
  type: EQUITY_LOAN_CONTRACT,
  response: {
    success: EQUITY_LOAN_CONTRACT_SUCCESS,
    failed: EQUITY_LOAN_CONTRACT_FAILED,
  },
  payload: data,
});
