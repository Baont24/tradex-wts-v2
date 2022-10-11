import {
  ACCOUNT_QUERY_STOP_ORDER_HISTORY,
  ACCOUNT_QUERY_STOP_ORDER_HISTORY_FAILED,
  ACCOUNT_QUERY_STOP_ORDER_HISTORY_SUCCESS,
  ACCOUNT_SET_STOP_ORDER_HISTORY_PARAMS,
} from './actions';
import { IQueryReducer, IReducerState } from 'interfaces/common';
import { IStopOrderHistoryAction } from 'interfaces/actions';
import { IStopOrderHistoryResponse } from 'interfaces/api';
import { getDateAMonthAgo } from 'utils/datetime';

const initialState: IReducerState<
  IStopOrderHistoryResponse[],
  IStopOrderHistoryAction
> = {
  data: [],
  status: {},
  params: {
    fromDate: getDateAMonthAgo(),
    toDate: new Date(),
    sellBuyType: 'All',
    status: 'All',
  },
};

export const StopOrderHistory: IQueryReducer<
  IStopOrderHistoryResponse[],
  IStopOrderHistoryAction | string,
  IStopOrderHistoryAction
> = (state = initialState, action) => {
  switch (action.type) {
    case ACCOUNT_SET_STOP_ORDER_HISTORY_PARAMS:
      return {
        ...state,
        params: {
          ...state.params,
          ...(action.payload as IStopOrderHistoryAction),
        },
      };
    case ACCOUNT_QUERY_STOP_ORDER_HISTORY:
      return {
        ...state,
        data: [],
        status: {
          isLoading: true,
        },
      };
    case ACCOUNT_QUERY_STOP_ORDER_HISTORY_SUCCESS:
      return {
        ...state,
        data: action.payload as IStopOrderHistoryResponse[],
        status: {
          isSucceeded: true,
        },
      };
    case ACCOUNT_QUERY_STOP_ORDER_HISTORY_FAILED:
      return {
        ...state,
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
