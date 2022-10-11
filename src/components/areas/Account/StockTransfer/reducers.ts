import {
  ACCOUNT_QUERY_STOCK_TRANSFER,
  ACCOUNT_QUERY_STOCK_TRANSFER_FAILED,
  ACCOUNT_QUERY_STOCK_TRANSFER_HISTORY,
  ACCOUNT_QUERY_STOCK_TRANSFER_HISTORY_FAILED,
  ACCOUNT_QUERY_STOCK_TRANSFER_HISTORY_LOAD_MORE,
  ACCOUNT_QUERY_STOCK_TRANSFER_HISTORY_SUCCESS,
  ACCOUNT_QUERY_STOCK_TRANSFER_SUCCESS,
  ACCOUNT_SUBMIT_STOCK_TRANSFER,
  ACCOUNT_SUBMIT_STOCK_TRANSFER_FAILED,
  ACCOUNT_SUBMIT_STOCK_TRANSFER_SUCCESS,
} from './actions';
import { IError, IQueryReducer } from 'interfaces/common';
import {
  IStockTransferHistoryResponse,
  IStockTransferResponse,
  IStockTransferSubmitResponse,
} from 'interfaces/api';

export const StockTransfer: IQueryReducer<IStockTransferResponse[], string> = (
  state = { data: [], status: {} },
  action
) => {
  switch (action.type) {
    case ACCOUNT_QUERY_STOCK_TRANSFER:
      return {
        data: [],
        status: {
          isLoading: true,
        },
      };
    case ACCOUNT_QUERY_STOCK_TRANSFER_SUCCESS:
      return {
        data: action.payload as IStockTransferResponse[],
        status: {
          isSucceeded: true,
        },
      };
    case ACCOUNT_QUERY_STOCK_TRANSFER_FAILED:
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

export const StockTransferHistory: IQueryReducer<
  IStockTransferHistoryResponse[],
  string
> = (state = { data: [], status: {} }, action) => {
  switch (action.type) {
    case ACCOUNT_QUERY_STOCK_TRANSFER_HISTORY:
      return {
        data: [],
        status: {
          isLoading: true,
        },
      };
    case ACCOUNT_QUERY_STOCK_TRANSFER_HISTORY_LOAD_MORE:
      return {
        data: state.data,
        status: {
          isLoading: true,
        },
      };
    case ACCOUNT_QUERY_STOCK_TRANSFER_HISTORY_SUCCESS:
      return {
        data: [
          ...state.data,
          ...(action.payload as IStockTransferHistoryResponse[]),
        ],
        status: {
          isSucceeded: true,
          loadMore:
            (action.payload as IStockTransferHistoryResponse[]).length > 0,
        },
      };
    case ACCOUNT_QUERY_STOCK_TRANSFER_HISTORY_FAILED:
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

export const StockTransferSubmit: IQueryReducer<
  Array<IStockTransferSubmitResponse | IError>,
  string
> = (state = { data: [], status: {} }, action) => {
  switch (action.type) {
    case ACCOUNT_SUBMIT_STOCK_TRANSFER:
      return {
        data: [],
        status: {
          isLoading: true,
        },
      };
    case ACCOUNT_SUBMIT_STOCK_TRANSFER_SUCCESS:
      return {
        data: action.payload as Array<IStockTransferSubmitResponse | IError>,
        status: {
          isSucceeded: true,
        },
      };
    case ACCOUNT_SUBMIT_STOCK_TRANSFER_FAILED:
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
