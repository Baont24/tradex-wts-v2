import { IAction } from 'interfaces/common';
import { ISymbolQuoteParams } from 'interfaces/api';
import {
  MARKET_QUERY_SYMBOL_QUOTE,
  MARKET_QUERY_SYMBOL_QUOTE_CHART,
  MARKET_QUERY_SYMBOL_QUOTE_CHART_FAILED,
  MARKET_QUERY_SYMBOL_QUOTE_CHART_SUCCESS,
  MARKET_QUERY_SYMBOL_QUOTE_FAILED,
  MARKET_QUERY_SYMBOL_QUOTE_SUCCESS,
} from 'redux/actions';

export const querySymbolDataQuote = (
  payload: ISymbolQuoteParams
): IAction<ISymbolQuoteParams> => {
  return {
    type: MARKET_QUERY_SYMBOL_QUOTE,
    response: {
      success: MARKET_QUERY_SYMBOL_QUOTE_SUCCESS,
      failed: MARKET_QUERY_SYMBOL_QUOTE_FAILED,
    },
    payload,
  };
};

export const queryAllSymbolDataQuote = (
  symbol: string
): IAction<{ readonly symbol: string }> => {
  return {
    type: MARKET_QUERY_SYMBOL_QUOTE_CHART,
    response: {
      success: MARKET_QUERY_SYMBOL_QUOTE_CHART_SUCCESS,
      failed: MARKET_QUERY_SYMBOL_QUOTE_CHART_FAILED,
    },
    payload: { symbol },
  };
};
