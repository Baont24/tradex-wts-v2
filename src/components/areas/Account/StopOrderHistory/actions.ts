import { IAction } from 'interfaces/common';
import { IStopOrderHistoryAction } from 'interfaces/actions';

export const ACCOUNT_QUERY_STOP_ORDER_HISTORY =
  'account/QUERY_STOP_ORDER_HISTORY';
export const ACCOUNT_SET_STOP_ORDER_HISTORY_PARAMS =
  'account/SET_STOP_ORDER_HISTORY_PARAMS';
export const ACCOUNT_QUERY_STOP_ORDER_HISTORY_SUCCESS =
  'account/QUERY_STOP_ORDER_HISTORY_SUCCESS';
export const ACCOUNT_QUERY_STOP_ORDER_HISTORY_FAILED =
  'account/QUERY_STOP_ORDER_HISTORY_FAILED';

export const queryStopOrderHistory = (): IAction => ({
  type: ACCOUNT_QUERY_STOP_ORDER_HISTORY,
  payload: undefined,
  response: {
    success: ACCOUNT_QUERY_STOP_ORDER_HISTORY_SUCCESS,
    failed: ACCOUNT_QUERY_STOP_ORDER_HISTORY_FAILED,
  },
});

export const setStopOrderHistoryParams = (
  payload: Partial<IStopOrderHistoryAction>
): IAction<Partial<IStopOrderHistoryAction>> => ({
  type: ACCOUNT_SET_STOP_ORDER_HISTORY_PARAMS,
  payload,
});
