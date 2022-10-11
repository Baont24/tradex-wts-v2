import { INewSubscribeSymbol } from 'interfaces/market';
import {
  SUBSCRIBE_SYMBOL,
  SUBSCRIBE_SYMBOL_MOBILE_SERVER,
  UNSUBSCRIBE_SYMBOL,
  UNSUBSCRIBE_SYMBOL_MOBILE_SERVER,
} from 'redux/actions';

export const subscribe = (payload: INewSubscribeSymbol) => ({
  type: SUBSCRIBE_SYMBOL,
  payload,
});

export const unsubscribe = (payload: INewSubscribeSymbol) => ({
  type: UNSUBSCRIBE_SYMBOL,
  payload,
});

export const subscribeSymbolMobileServer = (payload: INewSubscribeSymbol) => ({
  type: SUBSCRIBE_SYMBOL_MOBILE_SERVER,
  payload,
});

export const unsubscribeSymbolMobileServer = (
  payload: INewSubscribeSymbol
) => ({
  type: UNSUBSCRIBE_SYMBOL_MOBILE_SERVER,
  payload,
});
