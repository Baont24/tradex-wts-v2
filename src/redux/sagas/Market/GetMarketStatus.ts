import { GLOBAL_MARKET_STATUS, MARKET_STATUS_INIT } from 'redux/actions';
import { IAction, IResponse } from 'interfaces/common';
import { IMarketStatus } from 'interfaces/market';
import { call, put, takeLatest } from 'redux-saga/effects';
import { query } from 'utils/socketApi';
import config from '../../../config';

const loadMarketStatus = (): Promise<IResponse<IMarketStatus[]>> => {
  return query<IMarketStatus[]>(config.apis.sessionStatus);
};

function* doGetMarketStatus() {
  try {
    const marketStatus = yield call(loadMarketStatus);

    yield put<IAction<IMarketStatus>>({
      type: GLOBAL_MARKET_STATUS,
      payload: marketStatus.data,
    });
  } catch (err) {
    console.error('Get market status', err);
  }
}

export default function* watchInitMarket() {
  yield takeLatest(MARKET_STATUS_INIT, doGetMarketStatus);
}
