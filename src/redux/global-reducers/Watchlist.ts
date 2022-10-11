import { IReducer, IWatchlist } from 'interfaces/common';
import {
  WATCHLIST_ADD_ITEM,
  WATCHLIST_DELETE_ITEM,
  WATCHLIST_UPDATE_ITEM,
} from 'redux/actions';

export const Watchlist: IReducer<IWatchlist[], IWatchlist> = (
  state = [],
  action
) => {
  switch (action.type) {
    case WATCHLIST_ADD_ITEM:
      return [...state, action.payload as IWatchlist];
    case WATCHLIST_UPDATE_ITEM:
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
    case WATCHLIST_DELETE_ITEM:
      return state.filter(
        (val) => val.id !== (action.payload as IWatchlist).id
      );
    default:
      return state;
  }
};
