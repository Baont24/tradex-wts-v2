import {
  ACCOUNT_EQUITY_STOCK_TRANSACTION_HISTORY,
  ACCOUNT_EQUITY_STOCK_TRANSACTION_HISTORY_FAILED,
  ACCOUNT_EQUITY_STOCK_TRANSACTION_HISTORY_LOAD_MORE,
  ACCOUNT_EQUITY_STOCK_TRANSACTION_HISTORY_SUCCESS,
} from 'redux/actions';
import { IAction } from 'interfaces/common';
import { IParamsEquityStockTransactionHistory } from 'interfaces/api';

export const getStockTransactionHistory = (
  payload: IParamsEquityStockTransactionHistory
): IAction<IParamsEquityStockTransactionHistory> => ({
  type:
    payload.offset != null && payload.offset > 0
      ? ACCOUNT_EQUITY_STOCK_TRANSACTION_HISTORY_LOAD_MORE
      : ACCOUNT_EQUITY_STOCK_TRANSACTION_HISTORY,
  response: {
    success: ACCOUNT_EQUITY_STOCK_TRANSACTION_HISTORY_SUCCESS,
    failed: ACCOUNT_EQUITY_STOCK_TRANSACTION_HISTORY_FAILED,
  },
  payload,
});
