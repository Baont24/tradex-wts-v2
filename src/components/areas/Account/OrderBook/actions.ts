import { IAction } from 'interfaces/common';
import { IOrderBookAction, IOrderBookDetailAction } from 'interfaces/actions';

// get order book
export const ACCOUNT_ORDER_BOOK = 'account/ORDER_BOOK';
export const ACCOUNT_ORDER_BOOK_LOAD_MORE = 'account/ORDER_BOOK_LOAD_MORE';
export const ACCOUNT_ORDER_BOOK_SUCCESS = 'account/ORDER_BOOK_SUCCESS';
export const ACCOUNT_ORDER_BOOK_FAILED = 'account/ORDER_BOOK_FAILED';

// get order book detail
export const ACCOUNT_ORDER_BOOK_DETAIL = 'account/ORDER_BOOK_DETAIL';
export const ACCOUNT_ORDER_BOOK_DETAIL_SUCCESS =
  'account/ORDER_BOOK_DETAIL_SUCCESS';
export const ACCOUNT_ORDER_BOOK_DETAIL_FAILED =
  'account/ORDER_BOOK_DETAIL_FAILED';

export const queryOrderBook = (
  payload: IOrderBookAction
): IAction<IOrderBookAction> => ({
  type:
    payload.offset != null && payload.offset > 0
      ? ACCOUNT_ORDER_BOOK_LOAD_MORE
      : ACCOUNT_ORDER_BOOK,
  payload,
  response: {
    success: ACCOUNT_ORDER_BOOK_SUCCESS,
    failed: ACCOUNT_ORDER_BOOK_FAILED,
  },
});

export const queryOrderBookDetail = (
  payload: IOrderBookDetailAction
): IAction<IOrderBookDetailAction> => ({
  type: ACCOUNT_ORDER_BOOK_DETAIL,
  payload,
  response: {
    success: ACCOUNT_ORDER_BOOK_DETAIL_SUCCESS,
    failed: ACCOUNT_ORDER_BOOK_DETAIL_FAILED,
  },
});
