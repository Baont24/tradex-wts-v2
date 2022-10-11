import { IAction } from 'interfaces/common';
import { IParamsIndexStockList } from 'interfaces/api';
import { IPriceBoardAction } from 'interfaces/actions';
import { IPriceBoardReducer } from 'interfaces/reducers';
import {
  MARKET_QUERY_INDEX_STOCK_LIST,
  MARKET_QUERY_INDEX_STOCK_LIST_FAILED,
  MARKET_QUERY_INDEX_STOCK_LIST_SUCCESS,
} from 'redux/actions';

export const BOARD_INIT_PRICE_BOARD = 'board/INIT_PRICE_BOARD';
export const BOARD_INIT_PRICE_BOARD_SUCCESS = 'board/INIT_PRICE_BOARD_SUCCESS';
export const BOARD_INIT_PRICE_BOARD_FAILED = 'board/INIT_PRICE_BOARD_FAILED';
export const BOARD_SELECT_SYMBOL = 'board/SELECT_SYMBOL';
export const BOARD_UPDATE_PRICE_BOARD = 'board/UPDATE_PRICE_BOARD';
export const BOARD_UPDATE_WATCHLIST_BOARD = 'board/UPDATE_WATCHLIST_BOARD';

export const initPriceBoard = (
  payload?: IPriceBoardAction
): IAction<IPriceBoardAction | undefined> => ({
  type: BOARD_INIT_PRICE_BOARD,
  payload,
  response: {
    success: BOARD_INIT_PRICE_BOARD_SUCCESS,
    failed: BOARD_INIT_PRICE_BOARD_FAILED,
  },
});

export const updatePriceBoard = (
  payload?: Partial<IPriceBoardReducer>
): IAction<Partial<IPriceBoardReducer> | undefined> => ({
  type: BOARD_UPDATE_PRICE_BOARD,
  payload,
});

/**
 * Update or delete symbol from watchlist
 * @param code Symbol code
 * @param newIndex Position to move to. `newIndex == null` means delete symbol code
 */
export const updateWatchlistBoard = (
  code: string,
  newIndex?: number
): IAction<{ readonly code: string; readonly newIndex?: number }> => ({
  type: BOARD_UPDATE_WATCHLIST_BOARD,
  payload: {
    code,
    newIndex,
  },
});

export const selectSymbolPriceBoard = (
  payload?: IPriceBoardAction
): IAction<IPriceBoardAction | undefined> => ({
  type: BOARD_SELECT_SYMBOL,
  payload,
});

export const getIndexStockList = (data: IParamsIndexStockList) => ({
  type: MARKET_QUERY_INDEX_STOCK_LIST,
  response: {
    success: MARKET_QUERY_INDEX_STOCK_LIST_SUCCESS,
    failed: MARKET_QUERY_INDEX_STOCK_LIST_FAILED,
  },
  data,
});
