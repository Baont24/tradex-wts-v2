import { IAction, ILastTradingDate, IRequest } from 'interfaces/common';
import { IParamsQueryIndexMinutes } from 'interfaces/api';
import { MARKET_GET_LAST_TRADING_DATE } from 'redux/actions';
import { put, retry, takeEvery } from 'redux-saga/effects';
import { query } from 'utils/socketApi';
import config from 'config';

function getLastTradingDate() {
  return query<ILastTradingDate>(config.apis.lastTradingDate);
}

function* doGetIndexMinutes(request: IRequest<IParamsQueryIndexMinutes>) {
  try {
    const response = yield retry(3, 5000, getLastTradingDate);
    if (response.data) {
      yield put<IAction<string | null>>({
        type: request.response.success,
        payload: (response.data as ILastTradingDate).lastTradingDate,
      });
    }
  } catch (error) {
    console.error('Get last trading date', error);
    yield put<IAction<string | null>>({
      type: request.response.failed,
      payload: null,
    });
  }
}

export default function* watchGetIndexMinutes() {
  yield takeEvery(MARKET_GET_LAST_TRADING_DATE, doGetIndexMinutes);
}
