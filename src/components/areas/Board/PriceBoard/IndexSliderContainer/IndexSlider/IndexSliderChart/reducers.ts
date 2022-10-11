import { IAction, IIndexMinutesData } from 'interfaces/common';
import {
  MARKET_GET_INDEX_MINUTES,
  MARKET_GET_INDEX_MINUTES_FAILED,
  MARKET_GET_INDEX_MINUTES_SUCCESS,
  MARKET_GET_LAST_TRADING_DATE,
  MARKET_GET_LAST_TRADING_DATE_FAILED,
  MARKET_GET_LAST_TRADING_DATE_SUCCESS,
} from 'redux/actions';

export const IndexMinutes = (
  state: IIndexMinutesData = {},
  action: IAction<IIndexMinutesData[]>
) => {
  switch (action.type) {
    case MARKET_GET_INDEX_MINUTES:
      return state;
    case MARKET_GET_INDEX_MINUTES_SUCCESS:
      return action.payload;
    case MARKET_GET_INDEX_MINUTES_FAILED:
      return action.payload;
    default:
      return state;
  }
};

export const LastTradingDate = (
  state: string | null = null,
  action: IAction<string | null>
): string | null => {
  switch (action.type) {
    case MARKET_GET_LAST_TRADING_DATE:
      return state;
    case MARKET_GET_LAST_TRADING_DATE_SUCCESS:
      return action.payload;
    case MARKET_GET_LAST_TRADING_DATE_FAILED:
      return action.payload;
    default:
      return state;
  }
};
