import { GLOBAL_BANK_INFO } from 'redux/actions';
import { IAction } from 'interfaces/common';
import { IBankInfo } from 'interfaces/api';
import { call, put, takeLatest } from 'redux-saga/effects';
import config from 'config';

const loadBankInfo = (): Promise<Response> | null => {
  const headers = new Headers();

  headers.append('pragma', 'no-cache');
  headers.append('cache-control', 'no-cache');

  return fetch(config.bankInfoURL, {
    method: 'GET',
    headers,
  })
    .then((res) => {
      if (res.status === 304) {
        return [];
      }
      return res.json();
    })
    .catch((err) => console.error('loadBankInfo', err));
};

function* doLoadBankInfo(request: IAction<undefined>) {
  let bankInfo: IBankInfo[] = [];
  try {
    bankInfo = yield call(loadBankInfo);
    yield put({
      type: request.response?.success,
      payload: bankInfo,
    });
  } catch {
    yield put({
      type: request.response?.failed,
      payload: [],
    });
  }
}

export function* watchLoadBankInfo() {
  yield takeLatest(GLOBAL_BANK_INFO, doLoadBankInfo);
}
