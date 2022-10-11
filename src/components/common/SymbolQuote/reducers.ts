import { IQueryReducer, IReducer } from 'interfaces/common';
import { ISymbolQuote, ISymbolQuoteChart } from 'interfaces/market';
import {
  MARKET_QUERY_SYMBOL_QUOTE,
  MARKET_QUERY_SYMBOL_QUOTE_CHART,
  MARKET_QUERY_SYMBOL_QUOTE_CHART_CLEAR,
  MARKET_QUERY_SYMBOL_QUOTE_CHART_FAILED,
  MARKET_QUERY_SYMBOL_QUOTE_CHART_SUCCESS,
  MARKET_QUERY_SYMBOL_QUOTE_FAILED,
  MARKET_QUERY_SYMBOL_QUOTE_SUCCESS,
  MARKET_SYMBOL_MOBILE_SERVER_SUBSCRIBE_DATA,
} from 'redux/actions';

const initialValue: ISymbolQuoteChart = { quotes: {} };

const SymbolQuoteData: IQueryReducer<ISymbolQuote[]> = (
  state = { data: [], status: {} },
  action
) => {
  switch (action.type) {
    case MARKET_QUERY_SYMBOL_QUOTE:
      return { data: [], status: { isLoading: true } };
    case MARKET_QUERY_SYMBOL_QUOTE_SUCCESS:
      return { data: action.payload, status: { isSucceeded: true } };
    case MARKET_QUERY_SYMBOL_QUOTE_FAILED:
      return { data: [], status: { isFailed: true } };
    default:
      return state;
  }
};

const SymbolQuoteChart: IQueryReducer<
  ISymbolQuoteChart,
  string | Record<string, ISymbolQuote[]>
> = (state = { data: initialValue, status: {} }, action) => {
  switch (action.type) {
    case MARKET_QUERY_SYMBOL_QUOTE_CHART:
      return { data: { ...state.data }, status: { isLoading: true } };
    case MARKET_QUERY_SYMBOL_QUOTE_CHART_SUCCESS: {
      const symbolQuote = action.payload as Record<string, ISymbolQuote[]>;
      return {
        data: {
          ...state.data,
          quotes: { ...state.data.quotes, ...symbolQuote },
        },
        status: { isSucceeded: true },
      };
    }
    case MARKET_QUERY_SYMBOL_QUOTE_CHART_FAILED: {
      const symbolQuote = action.payload as Record<string, ISymbolQuote[]>;
      return {
        data: {
          ...state.data,
          quotes: { ...state.data.quotes, ...symbolQuote },
        },
        status: { isFailed: true },
      };
    }
    case MARKET_QUERY_SYMBOL_QUOTE_CHART_CLEAR:
      return { data: initialValue, status: {} };
    default:
      return state;
  }
};

const SymbolQuoteSubscribedData: IReducer<Record<
  string,
  ISymbolQuote
> | null> = (state = null, action) => {
  switch (action.type) {
    case MARKET_SYMBOL_MOBILE_SERVER_SUBSCRIBE_DATA:
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
};

export { SymbolQuoteData, SymbolQuoteChart, SymbolQuoteSubscribedData };
