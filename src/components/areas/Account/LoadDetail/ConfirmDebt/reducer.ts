import {
  ACCOUNT_EQUITY_CONFIRM_DEBT,
  ACCOUNT_EQUITY_CONFIRM_DEBT_FAILED,
  ACCOUNT_EQUITY_CONFIRM_DEBT_SUCCESS,
  ACCOUNT_EQUITY_SUBMIT_CONFIRM_DEBT,
  ACCOUNT_EQUITY_SUBMIT_CONFIRM_DEBT_FAILED,
  ACCOUNT_EQUITY_SUBMIT_CONFIRM_DEBT_SUCCESS,
} from 'redux/actions';
import {
  IConfirmDebtResponse,
  IEquityConfirmDebtResponse,
} from 'interfaces/api';
import { IQueryReducer } from 'interfaces/common';

export const EquityConfirmDebt: IQueryReducer<{
  readonly resConfirmDebt: IEquityConfirmDebtResponse;
  readonly callAPi:
    | 'Second_Time_Signed_Equal_True'
    | 'First_Time_Signed_Equal_False';
} | null> = (state = { data: null, status: {} }, action) => {
  switch (action.type) {
    case ACCOUNT_EQUITY_CONFIRM_DEBT:
      return {
        data: null,
        status: {
          isLoading: true,
        },
      };
    case ACCOUNT_EQUITY_CONFIRM_DEBT_SUCCESS:
      return {
        data: action.payload,
        status: { isSucceeded: true },
      };
    case ACCOUNT_EQUITY_CONFIRM_DEBT_FAILED:
      return {
        data: null,
        status: { isFailed: true },
      };
    default:
      return state;
  }
};

export const EquitySubmitConfirmDebt: IQueryReducer<IConfirmDebtResponse | null> = (
  state = { data: null, status: {} },
  action
) => {
  switch (action.type) {
    case ACCOUNT_EQUITY_SUBMIT_CONFIRM_DEBT:
      return {
        data: null,
        status: {
          isLoading: true,
        },
      };
    case ACCOUNT_EQUITY_SUBMIT_CONFIRM_DEBT_SUCCESS:
      return {
        data: action.payload,
        status: { isSucceeded: true },
      };
    case ACCOUNT_EQUITY_SUBMIT_CONFIRM_DEBT_FAILED:
      return {
        data: null,
        status: { isFailed: true },
      };
    default:
      return state;
  }
};
