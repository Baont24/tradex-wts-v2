import {
  CHANGE_ORDER_FORM_HEIGHT,
  ORDER_QUERY_STOCK_INFO,
  ORDER_QUERY_STOCK_INFO_FAILED,
  ORDER_QUERY_STOCK_INFO_MAX_QTY,
  ORDER_QUERY_STOCK_INFO_MAX_QTY_SUCCESS,
  ORDER_QUERY_STOCK_INFO_MODAL,
  ORDER_QUERY_STOCK_INFO_MODAL_FAILED,
  ORDER_QUERY_STOCK_INFO_MODAL_MAX_QTY,
  ORDER_QUERY_STOCK_INFO_MODAL_MAX_QTY_SUCCESS,
  ORDER_QUERY_STOCK_INFO_MODAL_SUCCEEDED,
  ORDER_QUERY_STOCK_INFO_SUCCEEDED,
} from './actions';
import { IChangeOrderFormHeight } from 'interfaces/actions';
import { IOrderStockInfo } from 'interfaces/reducers';
import { IQueryReducer } from 'interfaces/common';

export const OrderStockInfo: IQueryReducer<
  IOrderStockInfo | null,
  string | number
> = (
  state = {
    data: null,
    status: {},
  },
  action
) => {
  switch (action.type) {
    case ORDER_QUERY_STOCK_INFO:
      return {
        data: null,
        status: {
          isLoading: true,
        },
      };
    case ORDER_QUERY_STOCK_INFO_SUCCEEDED:
      return {
        data: action.payload as IOrderStockInfo,
        status: {
          isSucceeded: true,
        },
      };
    case ORDER_QUERY_STOCK_INFO_FAILED:
      return {
        data: null,
        status: {
          isFailed: true,
          errorMessage: action.payload as string,
        },
      };
    case ORDER_QUERY_STOCK_INFO_MAX_QTY:
      return {
        data: state.data,
        status: {
          isLoading: true,
        },
      };
    case ORDER_QUERY_STOCK_INFO_MAX_QTY_SUCCESS:
      return {
        data: {
          ...(state.data as IOrderStockInfo),
          maxQty: action.payload as number,
        },
        status: {
          isSucceeded: true,
        },
      };
    default:
      return state;
  }
};

export const OrderStockInfoModal: IQueryReducer<
  IOrderStockInfo | null,
  string | number
> = (
  state = {
    data: null,
    status: {},
  },
  action
) => {
  switch (action.type) {
    case ORDER_QUERY_STOCK_INFO_MODAL:
      return {
        data: null,
        status: {
          isLoading: true,
        },
      };
    case ORDER_QUERY_STOCK_INFO_MODAL_SUCCEEDED:
      return {
        data: action.payload as IOrderStockInfo,
        status: {
          isSucceeded: true,
        },
      };
    case ORDER_QUERY_STOCK_INFO_MODAL_FAILED:
      return {
        data: null,
        status: {
          isFailed: true,
          errorMessage: action.payload as string,
        },
      };
    case ORDER_QUERY_STOCK_INFO_MODAL_MAX_QTY:
      return {
        data: state.data,
        status: {
          isLoading: true,
        },
      };
    case ORDER_QUERY_STOCK_INFO_MODAL_MAX_QTY_SUCCESS:
      return {
        data: {
          ...(state.data as IOrderStockInfo),
          maxQty: action.payload as number,
        },
        status: {
          isSucceeded: true,
        },
      };
    default:
      return state;
  }
};

export const OrderChangeHeight: IQueryReducer<IChangeOrderFormHeight | null> = (
  state = { data: null, status: {} },
  action
) => {
  switch (action.type) {
    case CHANGE_ORDER_FORM_HEIGHT:
      return {
        data: action.payload,
        status: {},
      };

    default:
      return state;
  }
};
