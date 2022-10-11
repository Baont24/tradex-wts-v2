import {
  ICashTransferHistoryResponse,
  IEquityCashTransferHistoryResponse,
} from 'interfaces/api';
import { IQueryReducer } from 'interfaces/common';
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

const defaultCashTransferHistory: IEquityCashTransferHistoryResponse = {
  totalCount: 0,
  list: [],
};

export const EquityCashTransferHistoryReducer: IQueryReducer<IEquityCashTransferHistoryResponse> = (
  state = { data: defaultCashTransferHistory, status: {} },
  action
) => {
  switch (action.type) {
    case QUERY_CASH_TRANSFER_HISTORY:
      return { status: { isLoading: true }, data: defaultCashTransferHistory };
    case QUERY_CASH_TRANSFER_HISTORY_LOAD_MORE:
      return {
        data: state.data,
        status: {
          isLoading: true,
        },
      };
    case QUERY_CASH_TRANSFER_HISTORY_SUCCESS:
      return {
        status: {
          isSucceeded: true,
          loadMore:
            (action.payload as IEquityCashTransferHistoryResponse).list.length >
            0,
        },
        data: {
          totalCount: action.payload.totalCount,
          list: [
            ...state.data.list,
            ...(action.payload as IEquityCashTransferHistoryResponse).list,
          ],
        },
      };
    case QUERY_CASH_TRANSFER_HISTORY_FAILED:
      return {
        status: { isFailed: true },
        data: defaultCashTransferHistory,
      };
    default:
      return state;
  }
};

export const VSDCashTransferHistoryReducer: IQueryReducer<
  ICashTransferHistoryResponse[]
> = (state = { data: [], status: {} }, action) => {
  switch (action.type) {
    case QUERY_VSD_CASH_TRANSFER_HISTORY:
      return { status: { isLoading: true }, data: [] };
    case QUERY_VSD_CASH_TRANSFER_HISTORY_LOAD_MORE:
      return {
        data: state.data,
        status: {
          isLoading: true,
        },
      };
    case QUERY_VSD_CASH_TRANSFER_HISTORY_SUCCESS:
      return {
        status: {
          isSucceeded: true,
          loadMore:
            (action.payload as ICashTransferHistoryResponse[]).length > 0,
        },
        data: [
          ...state.data,
          ...(action.payload as ICashTransferHistoryResponse[]),
        ],
      };
    case QUERY_VSD_CASH_TRANSFER_HISTORY_FAILED:
      return { status: { isFailed: true }, data: [] };
    default:
      return state;
  }
};

export const DerivativeCashTransferHistoryReducer: IQueryReducer<
  ICashTransferHistoryResponse[]
> = (state = { data: [], status: {} }, action) => {
  switch (action.type) {
    case QUERY_DERIVATIVE_CASH_TRANSFER_HISTORY:
      return { status: { isLoading: true }, data: [] };
    case QUERY_DERIVATIVE_CASH_TRANSFER_HISTORY_LOAD_MORE:
      return {
        data: state.data,
        status: {
          isLoading: true,
        },
      };
    case QUERY_DERIVATIVE_CASH_TRANSFER_HISTORY_SUCCESS:
      return {
        status: {
          isSucceeded: true,
          loadMore:
            (action.payload as ICashTransferHistoryResponse[]).length > 0,
        },
        data: [
          ...state.data,
          ...(action.payload as ICashTransferHistoryResponse[]),
        ],
      };
    case QUERY_DERIVATIVE_CASH_TRANSFER_HISTORY_FAILED:
      return { status: { isFailed: true }, data: [] };
    default:
      return state;
  }
};
