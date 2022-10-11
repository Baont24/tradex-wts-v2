import {
  ACCOUNT_DERIVATIVE_ORDER_HISTORY,
  ACCOUNT_DERIVATIVE_ORDER_HISTORY_FAILED,
  ACCOUNT_DERIVATIVE_ORDER_HISTORY_SUCCESS,
  ACCOUNT_EQUITY_ORDER_HISTORY,
  ACCOUNT_EQUITY_ORDER_HISTORY_FAILED,
  ACCOUNT_EQUITY_ORDER_HISTORY_LOAD_MORE,
  ACCOUNT_EQUITY_ORDER_HISTORY_SUCCESS,
} from 'redux/actions';
import { IAction } from 'interfaces/common';
import {
  IDrOrderHistoryParams,
  IParamsEquityOrderHistory,
} from 'interfaces/api';

export const getEquityOrderHistory = (
  data: IParamsEquityOrderHistory[]
): IAction<IParamsEquityOrderHistory[]> => ({
  type:
    data[0]?.offset != null && data[0].offset > 0
      ? ACCOUNT_EQUITY_ORDER_HISTORY_LOAD_MORE
      : ACCOUNT_EQUITY_ORDER_HISTORY,
  response: {
    success: ACCOUNT_EQUITY_ORDER_HISTORY_SUCCESS,
    failed: ACCOUNT_EQUITY_ORDER_HISTORY_FAILED,
  },
  payload: data,
});

export const getDrOrderHistory = (
  data: IDrOrderHistoryParams
): IAction<IDrOrderHistoryParams> => ({
  type: ACCOUNT_DERIVATIVE_ORDER_HISTORY,
  response: {
    success: ACCOUNT_DERIVATIVE_ORDER_HISTORY_SUCCESS,
    failed: ACCOUNT_DERIVATIVE_ORDER_HISTORY_FAILED,
  },
  payload: data,
});
