import { IAction } from 'interfaces/common';
import { IParamsCashTransferHistory } from 'interfaces/api';
import {
  QUERY_CASH_TRANSFER_HISTORY,
  QUERY_CASH_TRANSFER_HISTORY_FAILED,
  QUERY_CASH_TRANSFER_HISTORY_LOAD_MORE,
  QUERY_CASH_TRANSFER_HISTORY_SUCCESS,
  QUERY_DERIVATIVE_CASH_TRANSFER_HISTORY,
  QUERY_DERIVATIVE_CASH_TRANSFER_HISTORY_FAILED,
  QUERY_DERIVATIVE_CASH_TRANSFER_HISTORY_LOAD_MORE,
  QUERY_DERIVATIVE_CASH_TRANSFER_HISTORY_SUCCESS,
  QUERY_VSD_CASH_TRANSFER_HISTORY,
  QUERY_VSD_CASH_TRANSFER_HISTORY_FAILED,
  QUERY_VSD_CASH_TRANSFER_HISTORY_LOAD_MORE,
  QUERY_VSD_CASH_TRANSFER_HISTORY_SUCCESS,
} from 'redux/actions';

export const queryEquityCashTransferHistory = (
  data: IParamsCashTransferHistory
): IAction<IParamsCashTransferHistory> => ({
  type:
    data.offset != null && data.offset > 0
      ? QUERY_CASH_TRANSFER_HISTORY_LOAD_MORE
      : QUERY_CASH_TRANSFER_HISTORY,
  response: {
    success: QUERY_CASH_TRANSFER_HISTORY_SUCCESS,
    failed: QUERY_CASH_TRANSFER_HISTORY_FAILED,
  },
  payload: data,
});

export const queryVSDCashTransferHistory = (
  data: IParamsCashTransferHistory
): IAction<IParamsCashTransferHistory> => ({
  type:
    data.offset != null && data.offset > 0
      ? QUERY_VSD_CASH_TRANSFER_HISTORY_LOAD_MORE
      : QUERY_VSD_CASH_TRANSFER_HISTORY,
  response: {
    success: QUERY_VSD_CASH_TRANSFER_HISTORY_SUCCESS,
    failed: QUERY_VSD_CASH_TRANSFER_HISTORY_FAILED,
  },
  payload: data,
});

export const queryDerivativeCashTransferHistory = (
  data: IParamsCashTransferHistory
): IAction<IParamsCashTransferHistory> => ({
  type:
    data.offset != null && data.offset > 0
      ? QUERY_DERIVATIVE_CASH_TRANSFER_HISTORY_LOAD_MORE
      : QUERY_DERIVATIVE_CASH_TRANSFER_HISTORY,
  response: {
    success: QUERY_DERIVATIVE_CASH_TRANSFER_HISTORY_SUCCESS,
    failed: QUERY_DERIVATIVE_CASH_TRANSFER_HISTORY_FAILED,
  },
  payload: data,
});
