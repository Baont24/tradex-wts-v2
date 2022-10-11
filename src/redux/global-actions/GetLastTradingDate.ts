import {
  MARKET_GET_LAST_TRADING_DATE,
  MARKET_GET_LAST_TRADING_DATE_FAILED,
  MARKET_GET_LAST_TRADING_DATE_SUCCESS,
} from 'redux/actions';

export const getLastTradingDate = () => {
  return {
    type: MARKET_GET_LAST_TRADING_DATE,
    response: {
      success: MARKET_GET_LAST_TRADING_DATE_SUCCESS,
      failed: MARKET_GET_LAST_TRADING_DATE_FAILED,
    },
  };
};
