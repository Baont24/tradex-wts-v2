import {
  IAction,
  IActionExtra,
  INotification,
  IWatchlist,
} from 'interfaces/common';
import { IQuerySymbolData } from 'interfaces/actions';
import {
  WATCHLIST_ADD_ITEM,
  WATCHLIST_DELETE_ITEM,
  WATCHLIST_GET_SYMBOL_DATA,
  WATCHLIST_GET_SYMBOL_DATA_FAILED,
  WATCHLIST_GET_SYMBOL_DATA_SUCCEDED,
  WATCHLIST_SELECT_ITEM,
  WATCHLIST_SERVER_ADD_ITEM,
  WATCHLIST_SERVER_DELETE_ITEM,
  WATCHLIST_SERVER_GET_LIST,
  WATCHLIST_SERVER_UPDATE_ITEM,
  WATCHLIST_UPDATE_ITEM,
} from 'redux/actions';
import { isAuthenticated } from 'utils/domain';

export const addWatchlist = (
  payload: IWatchlist,
  extraData: INotification
): IActionExtra<IWatchlist, INotification> => ({
  type: isAuthenticated() ? WATCHLIST_SERVER_ADD_ITEM : WATCHLIST_ADD_ITEM,
  payload,
  extraData,
});

export const updateWatchlist = (
  payload: IWatchlist,
  extraData: INotification
): IActionExtra<IWatchlist, INotification> => ({
  type: isAuthenticated()
    ? WATCHLIST_SERVER_UPDATE_ITEM
    : WATCHLIST_UPDATE_ITEM,
  payload,
  extraData,
});

export const deleteWatchlist = (
  payload: Partial<IWatchlist>,
  extraData: INotification
): IActionExtra<Partial<IWatchlist>, INotification> => ({
  type: isAuthenticated()
    ? WATCHLIST_SERVER_DELETE_ITEM
    : WATCHLIST_DELETE_ITEM,
  payload,
  extraData,
});

export const selectWatchlist = (
  payload: IWatchlist | null
): IAction<IWatchlist | null> => ({
  type: WATCHLIST_SELECT_ITEM,
  payload,
});

export const getSymbolDataWatchlist = (
  payload: IQuerySymbolData
): IAction<IQuerySymbolData> => ({
  type: WATCHLIST_GET_SYMBOL_DATA,
  payload,
  response: {
    failed: WATCHLIST_GET_SYMBOL_DATA_FAILED,
    success: WATCHLIST_GET_SYMBOL_DATA_SUCCEDED,
  },
});

export const getServerWatchlist = () => ({ type: WATCHLIST_SERVER_GET_LIST });
