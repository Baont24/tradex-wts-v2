import {
  GLOBAL_MARKET_STATUS,
  GLOBAL_MARKET_STATUS_CHANGE_DATA,
} from 'redux/actions';
import { IMarketStatus } from 'interfaces/market';
import { IReducer } from 'interfaces/common';

export const MarketStatus: IReducer<IMarketStatus[], IMarketStatus> = (
  state = [],
  action
) => {
  switch (action.type) {
    case GLOBAL_MARKET_STATUS:
      if (action.payload) {
        return action.payload as IMarketStatus[];
      } else {
        return state;
      }
    case GLOBAL_MARKET_STATUS_CHANGE_DATA:
      if (action.payload) {
        return state.map((val) =>
          (action.payload as IMarketStatus).market === val.market &&
          (action.payload as IMarketStatus).type === val.type
            ? (action.payload as IMarketStatus)
            : val
        );
      } else {
        return state;
      }
    default:
      return state;
  }
};
