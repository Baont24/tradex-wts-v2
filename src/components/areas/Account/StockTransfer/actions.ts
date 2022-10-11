import { IAction } from 'interfaces/common';
import {
  IStockTransferHistoryParams,
  IStockTransferParams,
  IStockTransferSubmitParams,
  // IStockTransferTimeParams,
} from 'interfaces/api';

export const ACCOUNT_QUERY_STOCK_TRANSFER = 'account/QUERY_STOCK_TRANSFER';
export const ACCOUNT_QUERY_STOCK_TRANSFER_SUCCESS =
  'account/QUERY_STOCK_TRANSFER_SUCCESS';
export const ACCOUNT_QUERY_STOCK_TRANSFER_FAILED =
  'account/QUERY_STOCK_TRANSFER_FAILED';
export const ACCOUNT_QUERY_STOCK_TRANSFER_HISTORY =
  'account/QUERY_STOCK_TRANSFER_HISTORY';
export const ACCOUNT_QUERY_STOCK_TRANSFER_HISTORY_LOAD_MORE =
  'account/QUERY_STOCK_TRANSFER_HISTORY_LOAD_MORE';
export const ACCOUNT_QUERY_STOCK_TRANSFER_HISTORY_SUCCESS =
  'account/QUERY_STOCK_TRANSFER_HISTORY_SUCCESS';
export const ACCOUNT_QUERY_STOCK_TRANSFER_HISTORY_FAILED =
  'account/QUERY_STOCK_TRANSFER_HISTORY_FAILED';
export const ACCOUNT_SUBMIT_STOCK_TRANSFER = 'account/SUBMIT_STOCK_TRANSFER';
export const ACCOUNT_SUBMIT_STOCK_TRANSFER_SUCCESS =
  'account/SUBMIT_STOCK_TRANSFER_SUCCESS';
export const ACCOUNT_SUBMIT_STOCK_TRANSFER_FAILED =
  'account/SUBMIT_STOCK_TRANSFER_FAILED';

export const queryStockTransfer = (
  payload: IStockTransferParams
): IAction<IStockTransferParams> => ({
  type: ACCOUNT_QUERY_STOCK_TRANSFER,
  response: {
    success: ACCOUNT_QUERY_STOCK_TRANSFER_SUCCESS,
    failed: ACCOUNT_QUERY_STOCK_TRANSFER_FAILED,
  },
  payload,
});

export const queryStockTransferHistory = (
  payload: IStockTransferHistoryParams
): IAction<IStockTransferHistoryParams> => ({
  type:
    payload.offset != null && payload.offset > 0
      ? ACCOUNT_QUERY_STOCK_TRANSFER_HISTORY_LOAD_MORE
      : ACCOUNT_QUERY_STOCK_TRANSFER_HISTORY,
  response: {
    success: ACCOUNT_QUERY_STOCK_TRANSFER_HISTORY_SUCCESS,
    failed: ACCOUNT_QUERY_STOCK_TRANSFER_HISTORY_FAILED,
  },
  payload,
});

export const submitStockTransfer = (
  payload: IStockTransferSubmitParams[]
): IAction<IStockTransferSubmitParams[]> => ({
  type: ACCOUNT_SUBMIT_STOCK_TRANSFER,
  response: {
    success: ACCOUNT_SUBMIT_STOCK_TRANSFER_SUCCESS,
    failed: ACCOUNT_SUBMIT_STOCK_TRANSFER_FAILED,
  },
  payload,
});
