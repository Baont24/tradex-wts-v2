import {
  ACCOUNT_RIGHT_EXERCISE_SUBSCRIPTIONS,
  ACCOUNT_RIGHT_EXERCISE_SUBSCRIPTIONS_LOAD_MORE,
  COMMON_SHOW_NOTIFICATION,
} from 'redux/actions';
import { IAction, INotification } from 'interfaces/common';
import {
  IEquityRightSubscriptionsParams,
  IEquityRightSubscriptionsResponse,
} from 'interfaces/api';
import { ToastType } from 'react-toastify';
import { call, put, takeLatest } from 'redux-saga/effects';
import { query } from 'utils/socketApi';
import config from 'config';

const getRightSubscriptions = (params: IEquityRightSubscriptionsParams) => {
  return query(config.apis.equityRightSubscriptions, params);
};

function* doGetRightSubscriptions(
  request: IAction<IEquityRightSubscriptionsParams>
) {
  try {
    let response: { data?: IEquityRightSubscriptionsResponse } | null = null;
    response = yield call(getRightSubscriptions, request.payload);
    yield put({
      type: request.response?.success,
      payload: response?.data,
    });
  } catch (error) {
    if (request.response) {
      yield put({
        type: request.response.failed,
        payload: error.code || error.message,
      });
    }

    yield put<IAction<INotification>>({
      type: COMMON_SHOW_NOTIFICATION,
      payload: {
        type: ToastType.ERROR,
        title: 'Right Subscriptions',
        content: error.code || error.message,
        contentParams: error.messageParams,
        time: new Date(),
      },
    });
  }
}

export function* watchGetEquityRightSubscriptions() {
  yield takeLatest(
    ACCOUNT_RIGHT_EXERCISE_SUBSCRIPTIONS,
    doGetRightSubscriptions
  );
  yield takeLatest(
    ACCOUNT_RIGHT_EXERCISE_SUBSCRIPTIONS_LOAD_MORE,
    doGetRightSubscriptions
  );
}
