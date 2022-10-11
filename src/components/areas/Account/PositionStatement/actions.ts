import { IAction } from 'interfaces/common';
import { IPositionStatementParams } from 'interfaces/api';

export const ACCOUNT_QUERY_POSITION_STATEMENT =
  'account/QUERY_POSITION_STATEMENT';
export const ACCOUNT_QUERY_POSITION_STATEMENT_SUCCESS =
  'account/QUERY_POSITION_STATEMENT_SUCCESS';
export const ACCOUNT_QUERY_POSITION_STATEMENT_FAILED =
  'account/QUERY_POSITION_STATEMENT_FAILED';

export const queryPositionStatement = (
  payload: IPositionStatementParams
): IAction<IPositionStatementParams> => ({
  type: ACCOUNT_QUERY_POSITION_STATEMENT,
  payload,
  response: {
    success: ACCOUNT_QUERY_POSITION_STATEMENT_SUCCESS,
    failed: ACCOUNT_QUERY_POSITION_STATEMENT_FAILED,
  },
});
