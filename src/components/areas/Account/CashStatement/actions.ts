import { IAction } from 'interfaces/common';
import {
  ICashStatementRequest,
  ITransactionHistoryParams,
} from 'interfaces/api';

export const ACCOUNT_EQUITY_CASH_STATEMENT = 'account/EQUITY_CASH_STATEMENT';
export const ACCOUNT_EQUITY_CASH_STATEMENT_LOAD_MORE =
  'account/EQUITY_CASH_STATEMENT_LOAD_MORE';
export const ACCOUNT_EQUITY_CASH_STATEMENT_SUCCESS =
  'account/EQUITY_CASH_STATEMENT_SUCCESS';
export const ACCOUNT_EQUITY_CASH_STATEMENT_FAILED =
  'account/EQUITY_CASH_STATEMENT_FAILED';

export const ACCOUNT_DERIVATIVES_CASH_STATEMENT =
  'account/DERIVATIVES_CASH_STATEMENT';
export const ACCOUNT_DERIVATIVES_CASH_STATEMENT_LOAD_MORE =
  'account/DERIVATIVES_CASH_STATEMENT_LOAD_MORE';
export const ACCOUNT_DERIVATIVES_CASH_STATEMENT_SUCCESS =
  'account/DERIVATIVES_CASH_STATEMENT_SUCCESS';
export const ACCOUNT_DERIVATIVES_CASH_STATEMENT_FAILED =
  'account/DERIVATIVES_CASH_STATEMENT_FAILED';

export const queryEquityCashStatement = (
  payload: ICashStatementRequest
): IAction<ICashStatementRequest> => ({
  type:
    payload.offset != null && payload.offset > 0
      ? ACCOUNT_EQUITY_CASH_STATEMENT_LOAD_MORE
      : ACCOUNT_EQUITY_CASH_STATEMENT,
  response: {
    success: ACCOUNT_EQUITY_CASH_STATEMENT_SUCCESS,
    failed: ACCOUNT_EQUITY_CASH_STATEMENT_FAILED,
  },
  payload,
});

export const queryDerivativesCashStatement = (
  payload: ITransactionHistoryParams
): IAction<ITransactionHistoryParams> => ({
  type:
    payload.offset != null && payload.offset > 0
      ? ACCOUNT_DERIVATIVES_CASH_STATEMENT_LOAD_MORE
      : ACCOUNT_DERIVATIVES_CASH_STATEMENT,
  response: {
    success: ACCOUNT_DERIVATIVES_CASH_STATEMENT_SUCCESS,
    failed: ACCOUNT_DERIVATIVES_CASH_STATEMENT_FAILED,
  },
  payload,
});
