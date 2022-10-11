import { IAction, IIndexMinutesData, IRequest } from 'interfaces/common';
import { IParamsQueryIndexMinutes } from 'interfaces/api';
import { MARKET_GET_INDEX_MINUTES } from 'redux/actions';
import { call, put, takeEvery } from 'redux-saga/effects';
import { query } from 'utils/socketApi';
import config from '../../../config';

function getIndexMinutesData(data: IParamsQueryIndexMinutes) {
  return query<IIndexMinutesData[]>(config.apis.symbolMinutes, data);
}

function* doGetIndexMinutes(request: IRequest<IParamsQueryIndexMinutes>) {
  try {
    const response = yield call(getIndexMinutesData, request.payload);
    if (response.data) {
      yield put<IAction<IIndexMinutesData>>({
        type: request.response.success,
        payload: { name: request.payload.symbol, data: response.data },
      });
    }
  } catch (error) {
    console.error('Init chart slider', error);
    yield put<IAction<IIndexMinutesData>>({
      type: request.response.failed,
      payload: {},
    });
  }
}

export default function* watchGetIndexMinutes() {
  yield takeEvery(MARKET_GET_INDEX_MINUTES, doGetIndexMinutes);
}
