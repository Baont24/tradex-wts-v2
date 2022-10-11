import {
  ACCOUNT_REALIZED_PORTFOLIO,
  ACCOUNT_REALIZED_PORTFOLIO_FAILED,
  ACCOUNT_REALIZED_PORTFOLIO_SUCCESS,
} from './action';
import { IDrAccountClosePositionItemResponse } from 'interfaces/api';
import { IQueryReducer } from 'interfaces/common';

export const AccountRealizedPortfolio: IQueryReducer<IDrAccountClosePositionItemResponse | null> = (
  state = { data: null, status: {} },
  action
) => {
  switch (action.type) {
    case ACCOUNT_REALIZED_PORTFOLIO:
      return {
        data: state.data,
        status: {
          isLoading: true,
        },
      };
    case ACCOUNT_REALIZED_PORTFOLIO_SUCCESS:
      return {
        data: action.payload,
        status: {
          isSucceeded: true,
        },
      };
    case ACCOUNT_REALIZED_PORTFOLIO_FAILED:
      return {
        data: null,
        status: {
          isFailed: true,
        },
      };
    default:
      return state;
  }
};
