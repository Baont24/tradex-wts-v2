import { IAction } from 'interfaces/common';
import {
  IMarketPutthroughAdvertiseRequest,
  IMarketPutthroughDealRequest,
} from 'interfaces/api';
import { SellBuyType } from 'constants/enum';

export const MARKET_GET_PUTTHROUGH_ADVERTISE_BID =
  'market/GET_PUTTHROUGH_ADVERTISE_BID';
export const MARKET_LOAD_MORE_PUTTHROUGH_ADVERTISE_BID =
  'market/LOAD_MORE_PUTTHROUGH_ADVERTISE_BID';
export const MARKET_GET_PUTTHROUGH_ADVERTISE_BID_SUCCESS =
  'market/GET_PUTTHROUGH_ADVERTISE_BID_SUCCESS';
export const MARKET_GET_PUTTHROUGH_ADVERTISE_BID_FAILED =
  'market/GET_PUTTHROUGH_ADVERTISE_BID_FAILED';
export const MARKET_PUTTHROUGH_ADVERTISE_BID_SUBSCRIBE_DATA =
  'market/PUTTHROUGH_ADVERTISE_BID_SUBSCRIBE_DATA';

export const MARKET_GET_PUTTHROUGH_ADVERTISE_ASK =
  'market/GET_PUTTHROUGH_ADVERTISE_ASK';
export const MARKET_LOAD_MORE_PUTTHROUGH_ADVERTISE_ASK =
  'market/LOAD_MORE_PUTTHROUGH_ADVERTISE_ASK';
export const MARKET_GET_PUTTHROUGH_ADVERTISE_ASK_SUCCESS =
  'market/GET_PUTTHROUGH_ADVERTISE_ASK_SUCCESS';
export const MARKET_GET_PUTTHROUGH_ADVERTISE_ASK_FAILED =
  'market/GET_PUTTHROUGH_ADVERTISE_ASK_FAILED';
export const MARKET_PUTTHROUGH_ADVERTISE_ASK_SUBSCRIBE_DATA =
  'market/PUTTHROUGH_ADVERTISE_ASK_SUBSCRIBE_DATA';

export const MARKET_GET_PUTTHROUGH_DEAL = 'market/GET_PUTTHROUGH_DEAL';
export const MARKET_LOAD_MORE_PUTTHROUGH_DEAL =
  'market/LOAD_MORE_PUTTHROUGH_DEAL';
export const MARKET_GET_PUTTHROUGH_DEAL_SUCCESS =
  'market/GET_PUTTHROUGH_DEAL_SUCCESS';
export const MARKET_GET_PUTTHROUGH_DEAL_FAILED =
  'market/GET_PUTTHROUGH_DEAL_FAILED';
export const MARKET_PUTTHROUGH_DEAL_SUBSCRIBE_DATA =
  'market/PUTTHROUGH_DEAL_SUBSCRIBE_DATA';

export const MARKET_UPDATE_PUTTHROUGH_DEAL_TOTAL =
  'market/UPDATE_PUTTHROUGH_DEAL_TOTAL';

export const SUBSCRIBE_PUTTHROUGH_DEAL = 'subscribe/PUTTHROUGH_DEAL';
export const SUBSCRIBE_PUTTHROUGH_ADVERTISE = 'subscribe/PUTTHROUGH_ADVERTISE';

export const UNSUBSCRIBE_PUTTHROUGH_DEAL = 'unsubscribe/PUTTHROUGH_DEAL';
export const UNSUBSCRIBE_PUTTHROUGH_ADVERTISE =
  'unsubscribe/PUTTHROUGH_ADVERTISE';

export const getMarketPutthroughAdvertise = (
  payload: IMarketPutthroughAdvertiseRequest
): IAction<IMarketPutthroughAdvertiseRequest> => ({
  type:
    payload.sellBuyType === SellBuyType.BUY
      ? payload.offset != null && payload.offset > 0
        ? MARKET_LOAD_MORE_PUTTHROUGH_ADVERTISE_BID
        : MARKET_GET_PUTTHROUGH_ADVERTISE_BID
      : payload.offset != null && payload.offset > 0
      ? MARKET_LOAD_MORE_PUTTHROUGH_ADVERTISE_ASK
      : MARKET_GET_PUTTHROUGH_ADVERTISE_ASK,
  payload,
  response: {
    success:
      payload.sellBuyType === SellBuyType.BUY
        ? MARKET_GET_PUTTHROUGH_ADVERTISE_BID_SUCCESS
        : MARKET_GET_PUTTHROUGH_ADVERTISE_ASK_SUCCESS,
    failed:
      payload.sellBuyType === SellBuyType.BUY
        ? MARKET_GET_PUTTHROUGH_ADVERTISE_BID_FAILED
        : MARKET_GET_PUTTHROUGH_ADVERTISE_ASK_FAILED,
  },
});

export const getMarketPutthroughDeal = (
  payload: IMarketPutthroughDealRequest
): IAction<IMarketPutthroughDealRequest> => ({
  type:
    payload.offset != null && payload.offset > 0
      ? MARKET_LOAD_MORE_PUTTHROUGH_DEAL
      : MARKET_GET_PUTTHROUGH_DEAL,
  payload,
  response: {
    success: MARKET_GET_PUTTHROUGH_DEAL_SUCCESS,
    failed: MARKET_GET_PUTTHROUGH_DEAL_FAILED,
  },
});

export const subscribeMarketPutthroughAdvertise = (
  payload: IMarketPutthroughAdvertiseRequest
): IAction<IMarketPutthroughAdvertiseRequest> => ({
  type: SUBSCRIBE_PUTTHROUGH_ADVERTISE,
  payload,
});

export const unsubscribeMarketPutthroughAdvertise = (): IAction<undefined> => ({
  type: UNSUBSCRIBE_PUTTHROUGH_ADVERTISE,
  payload: undefined,
});

export const subscribeMarketPutthroughDeal = (
  payload: IMarketPutthroughDealRequest
): IAction<IMarketPutthroughDealRequest> => ({
  type: SUBSCRIBE_PUTTHROUGH_DEAL,
  payload,
});

export const unsubscribeMarketPutthroughDeal = (): IAction<undefined> => ({
  type: UNSUBSCRIBE_PUTTHROUGH_DEAL,
  payload: undefined,
});
