import { IAction, IObjectData } from 'interfaces/common';
import { INewSymbolData } from 'interfaces/market';
import {
  MARKET_CACHE_SYMBOL_DATA,
  MARKET_CACHE_SYMBOL_ODDLOT_DATA,
  MARKET_INDEX_SUBSCRIBE_DATA,
  MARKET_SYMBOL_ODDLOT_SUBSCRIBE_DATA,
  MARKET_SYMBOL_SUBSCRIBE_DATA,
} from 'redux/actions';

const SymbolCachedData = (
  state: IObjectData<INewSymbolData> = {},
  action: IAction<IObjectData<INewSymbolData> | INewSymbolData>
): IObjectData<INewSymbolData> => {
  switch (action.type) {
    case MARKET_CACHE_SYMBOL_DATA:
      return {
        ...state,
        ...(action.payload as IObjectData<INewSymbolData>),
      };
    case MARKET_SYMBOL_SUBSCRIBE_DATA:
    case MARKET_INDEX_SUBSCRIBE_DATA:
      const data = action.payload as INewSymbolData;
      return {
        ...state,
        [data.s]: { ...state[data.s], ...data },
      };
    default:
      return state;
  }
};

const SymbolOddlotCachedData = (
  state: IObjectData<INewSymbolData> = {},
  action: IAction<IObjectData<INewSymbolData> | INewSymbolData>
): IObjectData<INewSymbolData> => {
  switch (action.type) {
    case MARKET_CACHE_SYMBOL_ODDLOT_DATA:
      return {
        ...state,
        ...(action.payload as IObjectData<INewSymbolData>),
      };
    case MARKET_SYMBOL_ODDLOT_SUBSCRIBE_DATA:
      const data = action.payload as INewSymbolData;
      return {
        ...state,
        [data.s]: { ...state[data.s], ...data },
      };
    default:
      return state;
  }
};

export { SymbolCachedData, SymbolOddlotCachedData };
