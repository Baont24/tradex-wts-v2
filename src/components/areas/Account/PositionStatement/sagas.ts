import { ACCOUNT_QUERY_POSITION_STATEMENT } from './actions';
import { COMMON_SHOW_NOTIFICATION } from 'redux/actions';
import { IAction, INotification } from 'interfaces/common';
import {
  IPositionStatementParams,
  IPositionStatementResponse,
} from 'interfaces/api';
import { ToastType } from 'react-toastify';
import { call, put, takeLatest } from 'redux-saga/effects';
import { query } from 'utils/socketApi';
import config from 'config';

const queryPositionStatement = (params: IPositionStatementParams) => {
  return query(config.apis.queryPositionStatement, params);
};

function* doQueryPositionStatement(request: IAction<IPositionStatementParams>) {
  try {
    const response: { data: IPositionStatementResponse[] } = yield call(
      queryPositionStatement,
      request.payload
    );

    if (request.response) {
      yield put<IAction<IPositionStatementResponse[]>>({
        type: request.response.success,
        payload: response.data,
      });
    }
  } catch (error) {
    console.error('Query position statement', error);

    if (request.response) {
      yield put<IAction<string>>({
        type: request.response.failed,
        payload: error.code || error.message,
      });
    }

    yield put<IAction<INotification>>({
      type: COMMON_SHOW_NOTIFICATION,
      payload: {
        type: ToastType.ERROR,
        title: 'Position Statement',
        content: error.code || error.message,
        contentParams: error.messageParams,
        time: new Date(),
      },
    });
  }
}

export function* watchQueryPositionStatement() {
  yield takeLatest(ACCOUNT_QUERY_POSITION_STATEMENT, doQueryPositionStatement);
}
