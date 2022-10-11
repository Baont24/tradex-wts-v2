import { COMMON_SHOW_NOTIFICATION, QUERY_SUB_ACCOUNT } from 'redux/actions';
import { IAction, INotification } from 'interfaces/common';
import { IEquitySubAccountResponse, IParamsSubAccount } from 'interfaces/api';
import { ToastType } from 'react-toastify';
import { call, put, takeLatest } from 'redux-saga/effects';
import { query } from 'utils/socketApi';
import config from 'config';

const queryEquitySubAccount = (params: IParamsSubAccount) => {
  return query(config.apis.equitySubAccount, params);
};

function* doEquitySubAccount(request: IAction<IParamsSubAccount>) {
  try {
    const response: { data: IEquitySubAccountResponse } = yield call(
      queryEquitySubAccount,
      request.payload
    );
    yield put({
      type: request.response?.success,
      payload: response.data,
    });
  } catch (error) {
    yield put<IAction<INotification>>({
      type: COMMON_SHOW_NOTIFICATION,
      payload: {
        type: ToastType.ERROR,
        title: 'Sub Account',
        content: error.code || error.message,
        contentParams: error.messageParams,
        time: new Date(),
      },
    });
    yield put({
      type: request.response?.failed,
      payload: error.code || error.message,
    });
  }
}

export function* watchEquitySubAccount() {
  yield takeLatest(QUERY_SUB_ACCOUNT, doEquitySubAccount);
}
