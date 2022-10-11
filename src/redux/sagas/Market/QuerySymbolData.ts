import { IAction, IMutableObjectData, IObjectData } from 'interfaces/common';
import { IIndexBoardData, INewSymbolData } from 'interfaces/market';
import { IQuerySymbolData } from 'interfaces/actions';
import { IState } from 'redux/global-reducers';
import { ISymbolLatestParams } from 'interfaces/api';
import {
  MARKET_CACHE_SYMBOL_DATA,
  MARKET_QUERY_INDEX_DATA,
  MARKET_QUERY_INDEX_STOCK_LIST_SUCCESS,
  MARKET_QUERY_SYMBOL_DATA,
  MARKET_SYMBOL_SUBSCRIBE_DATA,
  WATCHLIST_GET_SYMBOL_DATA,
} from 'redux/actions';
import { SymbolType } from 'constants/enum';
import { call, put, select, takeEvery, takeLatest } from 'redux-saga/effects';
import { getIndexStockList } from './GetIndexStockList';
import { query } from 'utils/socketApi';
import config from 'config';

const FETCH_COUNT = 30;

const querySymbolData = (params?: ISymbolLatestParams) => {
  return query<INewSymbolData[], ISymbolLatestParams>(
    config.apis.symbolLatest,
    params
  );
};

function* doQuerySymbolData(request: IAction<IQuerySymbolData>) {
  try {
    let symbolList = request.payload?.symbolList;

    const store: IState = yield select((state: IState) => ({
      symbolList: state.symbolList,
      symbolCachedData: state.symbolCachedData,
      selectedWatchlist: state.selectedWatchlist,
    }));

    if (
      request.payload.indexStock != null &&
      request.payload.indexStock.length > 0
    ) {
      const indexStockList = yield call(getIndexStockList, {
        indexCode: request.payload.indexStock,
      });
      yield put<IAction<string[]>>({
        type: MARKET_QUERY_INDEX_STOCK_LIST_SUCCESS,
        payload: indexStockList.data || [],
      });
      symbolList = indexStockList.data;
    }

    if (symbolList.length === 0) {
      if (request.response) {
        yield put<IAction<INewSymbolData[]>>({
          type: request.response.success,
          payload: [],
        });
      }
      return;
    }

    let start = 0;
    let end = Math.min(start + FETCH_COUNT, symbolList.length);

    // let mutableData: INewSymbolData[] = [];
    const mutableSymbolData: INewSymbolData[] = [];
    const localCachedObject: IMutableObjectData<INewSymbolData> = {};
    let isFirstQuery = true;

    symbolList.forEach((item) => {
      const data: INewSymbolData | undefined = store.symbolList.map?.[item];
      const current: INewSymbolData = { s: item, ...data };
      mutableSymbolData.push(current);
      localCachedObject[item] = current;
    });

    while (end <= symbolList.length) {
      const subList = symbolList.slice(start, end);
      const response = yield call(querySymbolData, { symbolList: subList });
      const data: INewSymbolData[] = response.data;
      for (let i = 0; i < data.length; i++) {
        const val = data[i];
        const localCurrent = localCachedObject[val.s];
        if (localCurrent == null) {
          continue;
        }
        Object.assign(localCurrent, val);
        if (!isFirstQuery) {
          yield put<IAction<INewSymbolData>>({
            type: MARKET_SYMBOL_SUBSCRIBE_DATA,
            payload: localCurrent,
          });
        }
      }
      if (isFirstQuery) {
        isFirstQuery = false;
        yield put<IAction<IObjectData<INewSymbolData>>>({
          type: MARKET_CACHE_SYMBOL_DATA,
          payload: localCachedObject,
        });

        if (request.response) {
          if (
            request.payload.indexType &&
            request.payload.symbolType === SymbolType.INDEX
          ) {
            yield put<IAction<IIndexBoardData>>({
              type: request.response.success,
              payload: {
                type: request.payload.indexType,
                array: mutableSymbolData,
              },
            });
          } else {
            yield put<IAction<INewSymbolData[]>>({
              type: request.response.success,
              payload: mutableSymbolData,
            });
          }
        }
      }
      start = end;
      end = Math.min(start + FETCH_COUNT, symbolList.length);

      if (start === end) {
        break;
      }
    }
  } catch (error) {
    console.error('Query symbol data', error);
    if (request.response) {
      yield put<IAction<INewSymbolData[]>>({
        type: request.response.failed,
        payload: error.code || error.message,
      });
    }
  }
}

export function* watchQuerySymbolData() {
  yield takeLatest(MARKET_QUERY_SYMBOL_DATA, doQuerySymbolData);
}

export function* watchQueryIndexData() {
  yield takeEvery(MARKET_QUERY_INDEX_DATA, doQuerySymbolData);
}

export function* watchQueryWatchlistData() {
  yield takeLatest(WATCHLIST_GET_SYMBOL_DATA, doQuerySymbolData);
}
