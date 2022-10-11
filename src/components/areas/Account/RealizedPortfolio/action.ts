import { IAction } from 'interfaces/common';
import { IDrAccountClosePositionItemParams } from 'interfaces/api';

export const ACCOUNT_REALIZED_PORTFOLIO = 'account/DR_REALIZED_PORTFOLIO';
export const ACCOUNT_REALIZED_PORTFOLIO_SUCCESS =
  'account/DR_REALIZED_PORTFOLIO_SUCCESS';
export const ACCOUNT_REALIZED_PORTFOLIO_FAILED =
  'account/DR_REALIZED_PORTFOLIO_FAILED';

export const getRealizedPortfolio = (
  payload: IDrAccountClosePositionItemParams
): IAction<IDrAccountClosePositionItemParams> => ({
  type: ACCOUNT_REALIZED_PORTFOLIO,
  response: {
    success: ACCOUNT_REALIZED_PORTFOLIO_SUCCESS,
    failed: ACCOUNT_REALIZED_PORTFOLIO_FAILED,
  },
  payload,
});
