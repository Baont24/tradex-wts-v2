import {
  ACCOUNT_DERIVATIVE_ORDER_HISTORY,
  ACCOUNT_DERIVATIVE_ORDER_HISTORY_FAILED,
  ACCOUNT_DERIVATIVE_ORDER_HISTORY_SUCCESS,
  ACCOUNT_EQUITY_ORDER_HISTORY,
  ACCOUNT_EQUITY_ORDER_HISTORY_FAILED,
  ACCOUNT_EQUITY_ORDER_HISTORY_LOAD_MORE,
  ACCOUNT_EQUITY_ORDER_HISTORY_SUCCESS,
} from 'redux/actions';
import { IDrOrderHistoryResponse, IOrderHistoryResponse } from 'interfaces/api';
import { IQueryReducer } from 'interfaces/common';

export interface IEquityOrderHistory {
  readonly data: IOrderHistoryResponse[];
  readonly status?: {
    readonly isLoading?: boolean;
    readonly isFailed?: boolean;
  };
}
export const EquityOrderHistory: IQueryReducer<
  IOrderHistoryResponse[],
  string
> = (state = { data: [], status: {} }, action) => {
  switch (action.type) {
    case ACCOUNT_EQUITY_ORDER_HISTORY:
      return {
        data: [],
        status: {
          isLoading: true,
        },
      };
    case ACCOUNT_EQUITY_ORDER_HISTORY_LOAD_MORE:
      return {
        data: state.data,
        status: {
          isLoading: true,
        },
      };
    case ACCOUNT_EQUITY_ORDER_HISTORY_SUCCESS:
      return {
        data: [...state.data, ...(action.payload as IOrderHistoryResponse[])],
        status: {
          isSucceeded: true,
          loadMore: (action.payload as IOrderHistoryResponse[]).length > 0,
        },
      };
    case ACCOUNT_EQUITY_ORDER_HISTORY_FAILED:
      return {
        data: [],
        status: {
          isFailed: true,
          errorMessage: action.payload as string,
        },
      };
    default:
      return state;
  }
};

export const DrOrderHistory: IQueryReducer<IDrOrderHistoryResponse[]> = (
  state = { data: [], status: {} },
  action
) => {
  switch (action.type) {
    case ACCOUNT_DERIVATIVE_ORDER_HISTORY:
      return {
        data: [],
        status: {
          isLoading: true,
        },
      };
    case ACCOUNT_DERIVATIVE_ORDER_HISTORY_SUCCESS:
      return {
        data: action.payload,
        status: {
          isLoading: false,
        },
      };
    case ACCOUNT_DERIVATIVE_ORDER_HISTORY_FAILED:
      return {
        data: [],
        status: {
          isFailed: true,
        },
      };
    default:
      return state;
  }
};
