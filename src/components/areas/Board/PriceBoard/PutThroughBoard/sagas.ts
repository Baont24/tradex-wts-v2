import { Global, QUERY_FETCH_COUNT } from 'constants/main';
import { IAction, IChannel, IResponse } from 'interfaces/common';
import {
  IMarketPutthroughAdvertiseRequest,
  IMarketPutthroughAdvertiseResponse,
  IMarketPutthroughDealRequest,
  IMarketPutthroughDealResponse,
  IMarketPutthroughDealTotalResponse,
} from 'interfaces/api';
import { IState } from 'redux/global-reducers';
import {
  MARKET_GET_PUTTHROUGH_ADVERTISE_ASK,
  MARKET_GET_PUTTHROUGH_ADVERTISE_BID,
  MARKET_GET_PUTTHROUGH_DEAL,
  MARKET_LOAD_MORE_PUTTHROUGH_ADVERTISE_ASK,
  MARKET_LOAD_MORE_PUTTHROUGH_ADVERTISE_BID,
  MARKET_LOAD_MORE_PUTTHROUGH_DEAL,
  MARKET_PUTTHROUGH_ADVERTISE_ASK_SUBSCRIBE_DATA,
  MARKET_PUTTHROUGH_ADVERTISE_BID_SUBSCRIBE_DATA,
  MARKET_PUTTHROUGH_DEAL_SUBSCRIBE_DATA,
  MARKET_UPDATE_PUTTHROUGH_DEAL_TOTAL,
  SUBSCRIBE_PUTTHROUGH_ADVERTISE,
  SUBSCRIBE_PUTTHROUGH_DEAL,
  UNSUBSCRIBE_PUTTHROUGH_ADVERTISE,
  UNSUBSCRIBE_PUTTHROUGH_DEAL,
} from './actions';
import { SellBuyType, WS } from 'constants/enum';
import { call, put, select, takeEvery, takeLatest } from 'redux-saga/effects';
import { query } from 'utils/socketApi';
import config from 'config';
import store from 'redux/store';

let putthroughDealChannel: IChannel;
let putthroughAdvertiseChannel: IChannel;

const queryMarketPutthroughDeal = (params: IMarketPutthroughDealRequest) => {
  return query(config.apis.putthroughDeal, params);
};

const queryMarketPutthroughDealTotal = (
  params: IMarketPutthroughDealRequest
) => {
  return query(config.apis.putthroughDealTotal, params);
};

const queryMarketPutthroughAdvertise = (
  params: IMarketPutthroughAdvertiseRequest
) => {
  return query(config.apis.putthroughAdvertise, params);
};

function* doQueryMarketPutthroughDeal(
  action: IAction<IMarketPutthroughDealRequest>
) {
  try {
    const state: IState = yield select((s: IState) => ({
      symbolList: s.symbolList,
    }));
    const response: IResponse<IMarketPutthroughDealResponse[]> = yield call(
      queryMarketPutthroughDeal,
      {
        ...action.payload,
        offset: action.payload.offset || 0,
        fetchCount: action.payload.fetchCount || QUERY_FETCH_COUNT,
      }
    );
    const data = response.data.map((val) => {
      const symbol = state.symbolList.map?.[val.s];
      return { ...val, re: symbol?.re, ce: symbol?.ce, fl: symbol?.fl };
    });
    if (action.response) {
      yield put<IAction<IMarketPutthroughDealResponse[]>>({
        type: action.response.success,
        payload: data,
      });
    }
  } catch (error) {
    console.error('Query Putthrough Deal', error);
    if (action.response) {
      yield put<IAction<string>>({
        type: action.response.failed,
        payload: error.code || error.message,
      });
    }
  }
}

function* doQueryMarketPutthroughDealTotal(
  action: IAction<IMarketPutthroughDealRequest>
) {
  try {
    const response: IResponse<IMarketPutthroughDealTotalResponse> = yield call(
      queryMarketPutthroughDealTotal,
      {
        marketType: action.payload.marketType,
      }
    );

    yield put<IAction<IMarketPutthroughDealTotalResponse>>({
      type: MARKET_UPDATE_PUTTHROUGH_DEAL_TOTAL,
      payload: {
        tva: response.data.tva || 0,
        tvo: response.data.tvo || 0,
      },
    });
  } catch (error) {
    console.error('Query Putthrough Deal Total', error);
  }
}

function* doQueryMarketPutthroughAdvertise(
  action: IAction<IMarketPutthroughAdvertiseRequest>
) {
  try {
    const state: IState = yield select((s: IState) => ({
      symbolList: s.symbolList,
    }));
    const response: { data: IMarketPutthroughAdvertiseResponse[] } = yield call(
      queryMarketPutthroughAdvertise,
      {
        ...action.payload,
        offset: action.payload.offset || 0,
        fetchCount: action.payload.fetchCount || QUERY_FETCH_COUNT,
      }
    );
    const data: IMarketPutthroughAdvertiseResponse[] = response.data.map(
      (val) => {
        const symbol = state.symbolList.map?.[val.s];
        return { ...val, re: symbol?.re, ce: symbol?.ce, fl: symbol?.fl };
      }
    );
    if (action.response) {
      yield put<IAction<IMarketPutthroughAdvertiseResponse[]>>({
        type: action.response.success,
        payload: data,
      });
    }
  } catch (error) {
    console.error(
      'Query Putthrough Advertise ' + action.payload.sellBuyType,
      error
    );
    if (action.response) {
      yield put<IAction<string>>({
        type: action.response.failed,
        payload: error.code || error.message,
      });
    }
  }
}

function* doSubscribePutthroughDeal(
  action: IAction<IMarketPutthroughDealRequest>
) {
  const channelName = `market.putthrough.deal.${action.payload.marketType}`;
  const socket = Global.sockets[WS.PRICE_BOARD];
  const state: IState = yield select((s: IState) => ({
    symbolList: s.symbolList,
  }));

  if (putthroughDealChannel != null) {
    putthroughDealChannel.unwatch();
    putthroughDealChannel.unsubscribe();
  }

  if (socket != null) {
    putthroughDealChannel = socket.subscribe(channelName, { batch: true });

    putthroughDealChannel.watch((res: IMarketPutthroughDealResponse) => {
      if (res.m === action.payload.marketType) {
        const symbol = state.symbolList.map?.[res.s];
        store.dispatch<IAction<IMarketPutthroughDealResponse>>({
          type: MARKET_PUTTHROUGH_DEAL_SUBSCRIBE_DATA,
          payload: { ...res, re: symbol?.re, ce: symbol?.ce, fl: symbol?.fl },
        });
      }
    });
  }
}

function* doUnsubscribePutthroughDeal() {
  if (putthroughDealChannel != null) {
    putthroughDealChannel.unwatch();
    putthroughDealChannel.unsubscribe();
  }
}

function* doSubscribePutthroughAdvertise(
  action: IAction<IMarketPutthroughAdvertiseRequest>
) {
  const channelName = `market.putthrough.advertise.${action.payload.marketType}`;
  const socket = Global.sockets[WS.PRICE_BOARD];
  const state: IState = yield select((s: IState) => ({
    symbolList: s.symbolList,
  }));

  if (putthroughAdvertiseChannel != null) {
    putthroughAdvertiseChannel.unwatch();
    putthroughAdvertiseChannel.unsubscribe();
  }

  if (socket != null) {
    putthroughAdvertiseChannel = socket.subscribe(channelName, { batch: true });

    putthroughAdvertiseChannel.watch(
      (res: IMarketPutthroughAdvertiseResponse) => {
        if (res.m === action.payload.marketType) {
          const symbol = state.symbolList.map?.[res.s];
          store.dispatch<IAction<IMarketPutthroughAdvertiseResponse>>({
            type:
              res.sb === SellBuyType.BUY
                ? MARKET_PUTTHROUGH_ADVERTISE_BID_SUBSCRIBE_DATA
                : MARKET_PUTTHROUGH_ADVERTISE_ASK_SUBSCRIBE_DATA,
            payload: { ...res, re: symbol?.re, ce: symbol?.ce, fl: symbol?.fl },
          });
        }
      }
    );
  }
}

function* doUnsubscribePutthroughAdvertise() {
  if (putthroughAdvertiseChannel != null) {
    putthroughAdvertiseChannel.unwatch();
    putthroughAdvertiseChannel.unsubscribe();
  }
}

export function* watchQueryMarketPutthrough() {
  yield takeLatest(MARKET_GET_PUTTHROUGH_DEAL, doQueryMarketPutthroughDeal);
  yield takeLatest(
    MARKET_GET_PUTTHROUGH_DEAL,
    doQueryMarketPutthroughDealTotal
  );
  yield takeLatest(
    MARKET_LOAD_MORE_PUTTHROUGH_DEAL,
    doQueryMarketPutthroughDeal
  );
  yield takeLatest(
    MARKET_GET_PUTTHROUGH_ADVERTISE_BID,
    doQueryMarketPutthroughAdvertise
  );
  yield takeLatest(
    MARKET_LOAD_MORE_PUTTHROUGH_ADVERTISE_BID,
    doQueryMarketPutthroughAdvertise
  );
  yield takeLatest(
    MARKET_GET_PUTTHROUGH_ADVERTISE_ASK,
    doQueryMarketPutthroughAdvertise
  );
  yield takeLatest(
    MARKET_LOAD_MORE_PUTTHROUGH_ADVERTISE_ASK,
    doQueryMarketPutthroughAdvertise
  );
  yield takeEvery(SUBSCRIBE_PUTTHROUGH_DEAL, doSubscribePutthroughDeal);
  yield takeEvery(UNSUBSCRIBE_PUTTHROUGH_DEAL, doUnsubscribePutthroughDeal);
  yield takeEvery(
    SUBSCRIBE_PUTTHROUGH_ADVERTISE,
    doSubscribePutthroughAdvertise
  );
  yield takeEvery(
    UNSUBSCRIBE_PUTTHROUGH_ADVERTISE,
    doUnsubscribePutthroughAdvertise
  );
}
