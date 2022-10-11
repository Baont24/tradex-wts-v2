import {
  GLOBAL_RESET_MARKET_DATA,
  MARKET_GET_LAST_TRADING_DATE,
  MARKET_GET_LAST_TRADING_DATE_FAILED,
  MARKET_GET_LAST_TRADING_DATE_SUCCESS,
} from 'redux/actions';
import { initData } from './InitMarket';
import { put, takeLatest } from 'redux-saga/effects';

function* doRefreshMarket() {
  console.log('Refresh market data...');
  yield initData(true);

  yield put({
    type: MARKET_GET_LAST_TRADING_DATE,
    response: {
      success: MARKET_GET_LAST_TRADING_DATE_SUCCESS,
      failed: MARKET_GET_LAST_TRADING_DATE_FAILED,
    },
  });
}

export default function* watchInitMarket() {
  yield takeLatest(GLOBAL_RESET_MARKET_DATA, doRefreshMarket);
}
