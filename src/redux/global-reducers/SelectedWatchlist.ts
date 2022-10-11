import {
  AUTHENTICATION_LOGOUT,
  WATCHLIST_SELECT_ITEM,
  WATCHLIST_SERVER_UPDATE_ITEM_SUCCESS,
  WATCHLIST_UPDATE_SELECTED_ITEM,
} from 'redux/actions';
import { IReducer, IWatchlist } from 'interfaces/common';

const SelectedWatchlist: IReducer<IWatchlist | null> = (
  state = null,
  action
) => {
  switch (action.type) {
    case WATCHLIST_SELECT_ITEM:
      return action.payload;
    case WATCHLIST_UPDATE_SELECTED_ITEM:
    case WATCHLIST_SERVER_UPDATE_ITEM_SUCCESS:
      return state && state.id === action.payload?.id
        ? { ...state, ...action.payload }
        : state;
    case AUTHENTICATION_LOGOUT:
      return null;
    default:
      return state;
  }
};

export default SelectedWatchlist;
