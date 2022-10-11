import {
  GLOBAL_CURRENT_SYMBOL,
  GLOBAL_SYMBOL_INFO_MODAL,
  MARKET_SET_CURRENT_SYMBOL_DATA,
  MARKET_SET_CURRENT_SYMBOL_INFO_DATA,
  MARKET_SYMBOL_SUBSCRIBE_DATA,
} from 'redux/actions';
import { IAction, IReducer } from 'interfaces/common';
import { ICurrentSymbol, INewSymbolData } from 'interfaces/market';
import { ISymbolInfoModal } from 'interfaces/actions';
import { REHYDRATE } from 'redux-persist';
import config from 'config';

export const defaultSymbol: ICurrentSymbol = config.defaultSymbol;

export function CurrentSymbol(
  state: ICurrentSymbol = defaultSymbol,
  action: IAction<ICurrentSymbol>
): ICurrentSymbol {
  switch (action.type) {
    case GLOBAL_CURRENT_SYMBOL:
      if (
        action.payload.dataUpdated === true &&
        action.payload.code !== state.code &&
        action.payload.forceUpdate !== true
      ) {
        return state;
      }
      return { ...action.payload };
    case MARKET_SET_CURRENT_SYMBOL_INFO_DATA:
      if (action.payload.resetData) {
        return { ...action.payload };
      } else if (
        action.payload.code === state.code &&
        action.payload.price === state.price
      ) {
        return state;
      }
      return { ...action.payload };
    default:
      return state;
  }
}

interface ICurrentSymbolState {
  readonly currentSymbol: ICurrentSymbol;
}

export const CurrentSymbolData: IReducer<
  INewSymbolData,
  ICurrentSymbol | ICurrentSymbolState
> = (
  state = { s: defaultSymbol.code, t: defaultSymbol.symbolType },
  action
) => {
  switch (action.type) {
    case REHYDRATE:
      const currentSymbol =
        (action.payload as ICurrentSymbolState)?.currentSymbol ?? defaultSymbol;
      return { s: currentSymbol.code, ...currentSymbol.infoData };
    case MARKET_SET_CURRENT_SYMBOL_DATA:
      return { ...(action.payload as INewSymbolData) };
    case MARKET_SET_CURRENT_SYMBOL_INFO_DATA:
      const infoData = (action.payload as ICurrentSymbol)?.infoData;
      return infoData != null ? { ...infoData } : state;
    case MARKET_SYMBOL_SUBSCRIBE_DATA:
      return state?.s === (action.payload as INewSymbolData).s
        ? { ...state, ...(action.payload as INewSymbolData) }
        : state;
    default:
      return state;
  }
};

export const SymbolInfoModal: IReducer<ISymbolInfoModal> = (
  state = { show: false },
  action
) => {
  switch (action.type) {
    case GLOBAL_SYMBOL_INFO_MODAL:
      return {
        ...action.payload,
      };
    default:
      return state;
  }
};
