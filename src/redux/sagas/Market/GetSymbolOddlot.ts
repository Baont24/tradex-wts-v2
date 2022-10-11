import { IAction, IMutableObjectData, IObjectData } from 'interfaces/common';
import { INewSymbolData } from 'interfaces/market';
import { IState } from 'redux/global-reducers';
import { ISymbolLatestParams } from 'interfaces/api';
import {
  MARKET_CACHE_SYMBOL_ODDLOT_DATA,
  MARKET_QUERY_SYMBOL_ODDLOT,
  MARKET_SYMBOL_ODDLOT_SUBSCRIBE_DATA,
} from 'redux/actions';
import { call, put, select, takeLatest } from 'redux-saga/effects';
import { query } from 'utils/socketApi';
import config from 'config';

const FETCH_COUNT = 30;

const querySymbolOddlot = (params: ISymbolLatestParams) => {
  return query(config.apis.symbolOddlotLatest, params);
};

function* doQuerySymbolOddlot(request: IAction<ISymbolLatestParams>) {
  try {
    const symbolList = request.payload?.symbolList;

    const store: IState = yield select((state: IState) => ({
      symbolList: state.symbolList,
      symbolCachedData: state.symbolCachedData,
    }));

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

    const mutableSymbolData: INewSymbolData[] = [];
    const localCachedObject: IMutableObjectData<INewSymbolData> = {};
    let isFirstQuery = true;

    symbolList.forEach((item) => {
      const data: INewSymbolData | undefined = store.symbolList.map?.[item];
      if (!data) {
        return;
      }
      const current: INewSymbolData = { ...data };
      mutableSymbolData.push(current);
      localCachedObject[item] = current;
    });

    while (end <= symbolList.length) {
      const subList = symbolList.slice(start, end);
      const response = yield call(querySymbolOddlot, { symbolList: subList });
      const data: INewSymbolData[] = response.data;
      if (store.isDebugging) {
        console.log('market/oddlotLatest', JSON.stringify(data));
      }
      // mutableData = [...mutableData, ...data];
      for (let i = 0; i < data.length; i++) {
        const val = data[i];
        const localCurrent = localCachedObject[val.s];
        if (localCurrent == null) {
          continue;
        }
        Object.assign(localCurrent, val);
        if (!isFirstQuery) {
          yield put<IAction<INewSymbolData>>({
            type: MARKET_SYMBOL_ODDLOT_SUBSCRIBE_DATA,
            payload: localCurrent,
          });
        }
      }
      if (isFirstQuery) {
        isFirstQuery = false;
        yield put<IAction<IObjectData<INewSymbolData>>>({
          type: MARKET_CACHE_SYMBOL_ODDLOT_DATA,
          payload: localCachedObject,
        });

        if (request.response) {
          yield put<IAction<INewSymbolData[]>>({
            type: request.response.success,
            payload: mutableSymbolData,
          });
        }
      }
      start = end;
      end = Math.min(start + FETCH_COUNT, symbolList.length);

      if (start === end) {
        break;
      }
    }
  } catch (error) {
    console.error('Query symbol oddlot', JSON.stringify(error));
    if (request.response) {
      yield put<IAction<string>>({
        type: request.response.failed,
        payload: JSON.stringify(error),
      });
    }
  }
}

export default function* watchQuerySymbolOddlot() {
  yield takeLatest(MARKET_QUERY_SYMBOL_ODDLOT, doQuerySymbolOddlot);
}
