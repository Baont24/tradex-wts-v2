import {
  ACCOUNT_EQUITY_CONFIRM_DEBT,
  ACCOUNT_EQUITY_CONFIRM_DEBT_FAILED,
  ACCOUNT_EQUITY_CONFIRM_DEBT_SUCCESS,
  ACCOUNT_EQUITY_SUBMIT_CONFIRM_DEBT,
  ACCOUNT_EQUITY_SUBMIT_CONFIRM_DEBT_FAILED,
  ACCOUNT_EQUITY_SUBMIT_CONFIRM_DEBT_SUCCESS,
} from 'redux/actions';
import { IAction } from 'interfaces/common';
import { IParamsEquityConfirmDebt, ISubmitConfirmDebt } from 'interfaces/api';

export const queryEquityConfirmDebt = (
  payload: IParamsEquityConfirmDebt
): IAction<IParamsEquityConfirmDebt> => ({
  type: ACCOUNT_EQUITY_CONFIRM_DEBT,
  response: {
    success: ACCOUNT_EQUITY_CONFIRM_DEBT_SUCCESS,
    failed: ACCOUNT_EQUITY_CONFIRM_DEBT_FAILED,
  },
  payload,
});

export const onSubmmitConfirmDebt = (
  payload: ISubmitConfirmDebt
): IAction<ISubmitConfirmDebt> => ({
  type: ACCOUNT_EQUITY_SUBMIT_CONFIRM_DEBT,
  response: {
    success: ACCOUNT_EQUITY_SUBMIT_CONFIRM_DEBT_SUCCESS,
    failed: ACCOUNT_EQUITY_SUBMIT_CONFIRM_DEBT_FAILED,
  },
  payload,
});
