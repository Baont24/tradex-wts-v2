import {
  GLOBAL_CW_LIST,
  GLOBAL_FUTURES_LIST,
  GLOBAL_INDEX_LIST,
  GLOBAL_STOCK_LIST,
  GLOBAL_SYMBOL_LIST,
  GLOBAL_SYMBOL_LIST_UPDATE,
  MARKET_SYMBOL_INIT,
} from 'redux/actions';
import { IAction, IReducer } from 'interfaces/common';
import { IMarketData, INewSymbolData, ISymbolList } from 'interfaces/market';

export const SymbolList: IReducer<ISymbolList, IMarketData> = (
  state = {
    array: [],
  },
  action
) => {
  switch (action.type) {
    case MARKET_SYMBOL_INIT:
      if ((action.payload as IMarketData).symbolList) {
        return (action.payload as IMarketData).symbolList;
      } else {
        return state;
      }
    case GLOBAL_SYMBOL_LIST:
      if ((action.payload as IMarketData).symbolList) {
        return (action.payload as IMarketData).symbolList;
      } else {
        return state;
      }
    case GLOBAL_SYMBOL_LIST_UPDATE:
      return {
        ...state,
        latest: true,
      };
    default:
      return state;
  }
};

export function StockList(
  state: INewSymbolData[] = [],
  action: IAction<IMarketData>
) {
  switch (action.type) {
    case MARKET_SYMBOL_INIT:
      if (action.payload.stockList) {
        return action.payload.stockList;
      } else {
        return state;
      }
    case GLOBAL_STOCK_LIST:
      if (action.payload.stockList) {
        return action.payload.stockList;
      } else {
        return state;
      }
    default:
      return state;
  }
}

export function FuturesList(
  state: INewSymbolData[] = [],
  action: IAction<IMarketData>
) {
  switch (action.type) {
    case MARKET_SYMBOL_INIT:
      if (action.payload.futuresList) {
        return action.payload.futuresList;
      } else {
        return state;
      }
    case GLOBAL_FUTURES_LIST:
      if (action.payload.futuresList) {
        return action.payload.futuresList;
      } else {
        return state;
      }
    default:
      return state;
  }
}

export function CWList(
  state: INewSymbolData[] = [],
  action: IAction<IMarketData>
) {
  switch (action.type) {
    case MARKET_SYMBOL_INIT:
      if (action.payload.cwList) {
        return action.payload.cwList;
      } else {
        return state;
      }
    case GLOBAL_CW_LIST:
      if (action.payload.cwList) {
        return action.payload.cwList;
      } else {
        return state;
      }
    default:
      return state;
  }
}

export function IndexList(
  state: INewSymbolData[] = [],
  action: IAction<IMarketData>
) {
  switch (action.type) {
    case MARKET_SYMBOL_INIT:
      if (action.payload.indexList) {
        return action.payload.indexList;
      } else {
        return state;
      }
    case GLOBAL_INDEX_LIST:
      if (action.payload.indexList) {
        return action.payload.indexList;
      } else {
        return state;
      }
    default:
      return state;
  }
}
