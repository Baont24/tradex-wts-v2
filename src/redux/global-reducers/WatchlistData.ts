import { INewSymbolData } from 'interfaces/market';
import { IQueryReducer, IReducerState } from 'interfaces/common';
import {
  WATCHLIST_GET_SYMBOL_DATA,
  WATCHLIST_GET_SYMBOL_DATA_FAILED,
  WATCHLIST_GET_SYMBOL_DATA_SUCCEDED,
} from 'redux/actions';

const initialState: IReducerState<INewSymbolData[]> = {
  data: [],
  status: {},
};

const WatchlistData: IQueryReducer<INewSymbolData[]> = (
  state = initialState,
  action
) => {
  switch (action.type) {
    case WATCHLIST_GET_SYMBOL_DATA:
      return {
        data: [],
        status: {
          isLoading: true,
        },
      };
    case WATCHLIST_GET_SYMBOL_DATA_SUCCEDED:
      return {
        data: action.payload,
        status: {
          isSucceeded: true,
        },
      };
    case WATCHLIST_GET_SYMBOL_DATA_FAILED:
      return {
        data: [],
        status: {
          isFailed: true,
        },
      };
    default:
      return state;
  }
};

export default WatchlistData;
