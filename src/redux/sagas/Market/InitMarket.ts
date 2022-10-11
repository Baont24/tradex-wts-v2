import {
  GLOBAL_MARKET_STATUS_CHANGE_DATA,
  GLOBAL_RESET_MARKET_DATA,
  GLOBAL_SYMBOL_LIST_UPDATE,
  MARKET_GET_LAST_TRADING_DATE,
  MARKET_GET_LAST_TRADING_DATE_FAILED,
  MARKET_GET_LAST_TRADING_DATE_SUCCESS,
  MARKET_INIT,
  MARKET_SYMBOL_INIT,
  SUBSCRIBE_MARKET_REFRESH_DATA,
  SUBSCRIBE_MARKET_STATUS,
} from 'redux/actions';
import { Global } from 'constants/main';
import { IAction, IChannel, IResponse } from 'interfaces/common';
import { IMarketStatus, INewSymbolData, ISymbolList } from 'interfaces/market';
import { IState } from 'redux/global-reducers';
import { SymbolType, WS } from 'constants/enum';
import { SymbolsStorage } from 'components/common/TVChart/datafeeds/symbols-storage';
import { call, put, select, takeLatest } from 'redux-saga/effects';
import { getMap } from 'utils/common';
import { isStockSymbol } from 'utils/market';
import { query } from 'utils/socketApi';
import config from 'config';
import store from 'redux/store';

let lastestModified: string | null;
let marketRefreshChannel: IChannel;
let marketStatusChannel: IChannel;

const loadSymbolListFromServer = (): Promise<IResponse<INewSymbolData[]>> => {
  console.log('Market data static info...');
  return query<INewSymbolData[]>(config.apis.symbolList);
};

const loadSymbolList = (refreshData?: boolean): Promise<Response> | null => {
  const headers = new Headers();

  headers.append('pragma', 'no-cache');
  headers.append('cache-control', 'no-cache');

  if (lastestModified && !refreshData) {
    headers.append('If-Modified-Since', lastestModified);
  }
  return fetch(config.symbolURL, {
    method: 'GET',
    headers,
  })
    .then((res) => {
      lastestModified = res.headers.get('Last-Modified');
      console.log(
        'Market data last modified:',
        res.headers.get('Last-Modified')
      );
      if (res.status === 304) {
        return [];
      }
      return res.json();
    })
    .catch((err) => console.error('loadSymbolList', err));
};

const subscribeMarketStatus = () => {
  const channelName = 'market.status';
  const socket = Global.sockets[WS.PRICE_BOARD];

  if (marketStatusChannel != null) {
    marketStatusChannel.unwatch();
    marketStatusChannel.unsubscribe();
  }

  if (socket != null) {
    marketStatusChannel = socket.subscribe(channelName, { batch: true });
    marketStatusChannel.watch((res: IMarketStatus) => {
      store.dispatch<IAction<IMarketStatus>>({
        type: GLOBAL_MARKET_STATUS_CHANGE_DATA,
        payload: res,
      });
    });
  }
};

const subscribeMarketRefresh = () => {
  const channelName = 'market.refreshData';
  const socket = Global.sockets[WS.PRICE_BOARD];

  if (marketRefreshChannel != null) {
    marketRefreshChannel.unwatch();
    marketRefreshChannel.unsubscribe();
  }

  if (socket != null) {
    marketRefreshChannel = socket.subscribe(channelName, { batch: true });
    marketRefreshChannel.watch<{ type: string }>((res) => {
      store.dispatch({
        type: GLOBAL_RESET_MARKET_DATA,
        payload: res,
      });
    });
  }
};

export function* initData(refreshData?: boolean) {
  const marketData: IState = yield select((state: IState) => ({
    symbolList: state.symbolList,
  }));

  try {
    let payload: INewSymbolData[] = [];

    lastestModified = marketData.symbolList.lastestModified || null;

    payload = yield call(loadSymbolList, refreshData);

    if (payload == null) {
      const response: IResponse<INewSymbolData[]> = yield call(
        loadSymbolListFromServer
      );
      if (response) {
        payload = response.data;
      }
    }

    if (payload != null && payload.length > 0) {
      const symbolList = {
        array: payload,
        map: getMap(payload),
        latest: true,
        lastestModified: lastestModified || undefined,
      };
      const stockList = payload.filter((val) => isStockSymbol(val.t));
      const cwList = payload.filter((val) => val.t === SymbolType.CW);
      const futuresList = payload.filter((val) => val.t === SymbolType.FUTURES);
      const indexList = payload.filter((val) => val.t === SymbolType.INDEX);

      yield put({
        type: MARKET_SYMBOL_INIT,
        payload: {
          symbolList,
          stockList,
          cwList,
          futuresList,
          indexList,
        },
      });
      if (Global.tvSymbolStorage == null) {
        Global.tvSymbolStorage = new SymbolsStorage(config.tvResolutions);
      }
      Global.tvSymbolStorage
        .init(stockList, cwList, indexList, futuresList)
        .then(console.log)
        .catch(console.error);
    } else {
      if (Global.tvSymbolStorage == null) {
        Global.tvSymbolStorage = new SymbolsStorage(config.tvResolutions);
      }
      Global.tvSymbolStorage
        .init(
          store.getState().stockList,
          store.getState().cwList,
          store.getState().indexList,
          store.getState().futuresList
        )
        .then(console.log)
        .catch(console.error);
    }
  } catch (error) {
    yield put<IAction<ISymbolList>>({
      type: GLOBAL_SYMBOL_LIST_UPDATE,
      payload: marketData.symbolList,
    });
    console.error('getSymbolList', error);
  }
}

function* doInitMarket() {
  try {
    yield initData();

    yield put({
      type: MARKET_GET_LAST_TRADING_DATE,
      response: {
        success: MARKET_GET_LAST_TRADING_DATE_SUCCESS,
        failed: MARKET_GET_LAST_TRADING_DATE_FAILED,
      },
    });

    subscribeMarketStatus();

    yield put({
      type: SUBSCRIBE_MARKET_STATUS,
    });

    subscribeMarketRefresh();

    yield put({
      type: SUBSCRIBE_MARKET_REFRESH_DATA,
    });
  } catch (err) {
    console.error('initMarket', err);
  }
}

export default function* watchInitMarket() {
  yield takeLatest(MARKET_INIT, doInitMarket);
}
