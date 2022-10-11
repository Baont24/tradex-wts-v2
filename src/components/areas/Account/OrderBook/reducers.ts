import {
  ACCOUNT_ORDER_BOOK,
  ACCOUNT_ORDER_BOOK_DETAIL,
  ACCOUNT_ORDER_BOOK_DETAIL_FAILED,
  ACCOUNT_ORDER_BOOK_DETAIL_SUCCESS,
  ACCOUNT_ORDER_BOOK_FAILED,
  ACCOUNT_ORDER_BOOK_LOAD_MORE,
  ACCOUNT_ORDER_BOOK_SUCCESS,
} from './actions';
import { IOrderBookDetailResponse } from 'interfaces/api';
import { IOrderBookReducer } from 'interfaces/reducers';
import { IQueryReducer } from 'interfaces/common';
import { MARKET_ORDER_MATCH_SUBSCRIBE_DATA } from 'redux/actions';

export const OrderBook: IQueryReducer<
  IOrderBookReducer[],
  IOrderBookReducer | string
> = (state = { data: [], status: {} }, action) => {
  switch (action.type) {
    case ACCOUNT_ORDER_BOOK:
      return {
        data: [],
        status: {
          isLoading: true,
        },
      };
    case ACCOUNT_ORDER_BOOK_LOAD_MORE:
      return {
        data: state.data,
        status: {
          isLoading: true,
        },
      };
    case ACCOUNT_ORDER_BOOK_SUCCESS:
      return {
        data: [...state.data, ...(action.payload as IOrderBookReducer[])],
        status: {
          isSucceeded: true,
          loadMore: (action.payload as IOrderBookReducer[]).length > 0,
        },
      };
    case ACCOUNT_ORDER_BOOK_FAILED:
      return {
        data: [],
        status: {
          isFailed: true,
          errorMessage: action.payload as string,
        },
      };
    case MARKET_ORDER_MATCH_SUBSCRIBE_DATA:
      const data = action.payload as IOrderBookReducer;
      const idx = state.data.findIndex(
        (val) => val.orderNumber === data.orderNumber
      );
      return {
        ...state,
        data:
          idx === -1
            ? [data, ...state.data]
            : idx === 0
            ? [{ ...state.data[idx], ...data }, ...state.data.slice(1)]
            : [
                ...state.data.slice(0, idx),
                { ...state.data[idx], ...data },
                ...state.data.slice(idx + 1),
              ],
      };
    default:
      return state;
  }
};

export const OrderBookDetail: IQueryReducer<
  IOrderBookDetailResponse[],
  string
> = (state = { data: [], status: {} }, action) => {
  switch (action.type) {
    case ACCOUNT_ORDER_BOOK_DETAIL:
      return {
        data: [],
        status: {
          isLoading: true,
        },
      };
    case ACCOUNT_ORDER_BOOK_DETAIL_SUCCESS:
      return {
        data: action.payload as IOrderBookDetailResponse[],
        status: {
          isSucceeded: true,
        },
      };
    case ACCOUNT_ORDER_BOOK_DETAIL_FAILED:
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
