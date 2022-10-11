import {
  AUTHENTICATION_LOGOUT,
  WATCHLIST_SERVER_ADD_ITEM,
  WATCHLIST_SERVER_DELETE_ITEM,
  WATCHLIST_SERVER_GET_LIST_SUCCESS,
  WATCHLIST_SERVER_UPDATE_ITEM_SUCCESS,
} from 'redux/actions';
import { IReducer, IWatchlist } from 'interfaces/common';

export const WatchlistServer: IReducer<IWatchlist[], IWatchlist> = (
  state = [],
  action
) => {
  switch (action.type) {
    case WATCHLIST_SERVER_GET_LIST_SUCCESS:
      return action.payload as IWatchlist[];
    case WATCHLIST_SERVER_ADD_ITEM:
      return [...state, action.payload as IWatchlist];
    case WATCHLIST_SERVER_UPDATE_ITEM_SUCCESS:
      return [
        ...state.map((val) =>
          val.id === (action.payload as IWatchlist).id
            ? {
                ...val,
                ...((action.payload as IWatchlist).name && {
                  name: (action.payload as IWatchlist).name,
                }),
                ...((action.payload as IWatchlist).data && {
                  data: (action.payload as IWatchlist).data?.slice(0),
                }),
              }
            : { ...val }
        ),
      ];
    case WATCHLIST_SERVER_DELETE_ITEM:
      return state.filter(
        (val) => val.id !== (action.payload as IWatchlist).id
      );
    case AUTHENTICATION_LOGOUT:
      return [];
    default:
      return state;
  }
};
