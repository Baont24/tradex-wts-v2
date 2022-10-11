import { IAction, IResponse } from 'interfaces/common';
import { IMatchingDataResponse } from 'interfaces/apiTTL';
import { ISymbolQuote } from 'interfaces/market';
import { ISymbolQuoteParams } from 'interfaces/api';
import {
  MARKET_QUERY_SYMBOL_QUOTE,
  MARKET_QUERY_SYMBOL_QUOTE_CHART,
} from 'redux/actions';
import { call, put, takeEvery, takeLatest } from 'redux-saga/effects';
import { mapMatchingDataToQuote } from 'utils/map';
import { query } from 'utils/socketApi';
import config from 'config';

function getSymbolQuoteData(params: ISymbolQuoteParams) {
  return query<IResponse<ISymbolQuote[]>>(config.apis.symbolQuote, params);
}

function getSymbolQuote(symb: string, key?: string) {
  return query<IResponse<IMatchingDataResponse>>(config.apis.matchingData, {
    symb,
    key,
  });
}

function* doSymbolQuoteData(request: IAction<ISymbolQuoteParams>) {
  try {
    const response: IResponse<ISymbolQuote[]> = yield call(
      getSymbolQuoteData,
      request.payload
    );
    if (response.data && request.response) {
      yield put<IAction<ISymbolQuote[]>>({
        type: request.response.success,
        payload: response.data,
      });
    }
  } catch (error) {
    console.error('Query symbol quote data', error);
    if (request.response) {
      yield put<IAction<ISymbolQuote[]>>({
        type: request.response.failed,
        payload: error.code || error.message,
      });
    }
  }
}

function* doSymbolQuoteAllData(request: IAction<{ readonly symbol: string }>) {
  let quotes: ISymbolQuote[] = [];
  try {
    let response: IResponse<IMatchingDataResponse> | undefined;
    let nextKey = 'none';
    let isNext = true;

    while (response == null || isNext) {
      response = yield call(getSymbolQuote, request.payload.symbol, nextKey);

      if (response != null) {
        isNext = response.data.next === 'Y';
        nextKey = response.data.skey;
        const responseQuotes: ISymbolQuote[] = response.data.rec.map((val) =>
          mapMatchingDataToQuote(val)
        );
        quotes = [...quotes, ...responseQuotes];
      }
    }

    console.log(`quotes`, quotes);
    if (request.response) {
      yield put<IAction<Record<string, ISymbolQuote[]>>>({
        type: request.response.success,
        payload: {
          [request.payload.symbol]: quotes,
        },
      });
    }
  } catch (error) {
    console.error('Query symbol quote chart', error);
    if (request.response) {
      yield put<IAction<Record<string, ISymbolQuote[]>>>({
        type: request.response.failed,
        payload: {
          [request.payload.symbol]: quotes,
        },
      });
    }
  }
}

export default function* watchSymbolQuoteData() {
  yield takeEvery(MARKET_QUERY_SYMBOL_QUOTE, doSymbolQuoteData);
  yield takeLatest(MARKET_QUERY_SYMBOL_QUOTE_CHART, doSymbolQuoteAllData);
}
