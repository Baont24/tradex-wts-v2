import {
  GLOBAL_SYMBOL_INFO_MODAL,
  MARKET_SET_CURRENT_SYMBOL,
} from 'redux/actions';
import { IAction } from 'interfaces/common';
import { ICurrentSymbol } from 'interfaces/market';
import { ISymbolInfoModal } from 'interfaces/actions';

export const setCurrentSymbol = (payload: ICurrentSymbol) => ({
  type: MARKET_SET_CURRENT_SYMBOL,
  payload,
});

export const toggleSymbolInfoModal = (
  payload: ISymbolInfoModal
): IAction<ISymbolInfoModal> => ({
  type: GLOBAL_SYMBOL_INFO_MODAL,
  payload,
});
