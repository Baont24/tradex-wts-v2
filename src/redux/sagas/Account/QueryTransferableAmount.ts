import {
  COMMON_SHOW_NOTIFICATION,
  QUERY_TRANSFERABLE_AMOUNT,
} from 'redux/actions';
import { IAction, INotification } from 'interfaces/common';
import {
  IEquityTransferableAmountResponse,
  IParamsTransferableAmount,
} from 'interfaces/api';
import { ToastType } from 'react-toastify';
import { call, put, takeLatest } from 'redux-saga/effects';
import { query } from 'utils/socketApi';
import { roundDown } from 'utils/common';
import config from 'config';

const queryEquityTransferableAmount = (params: IParamsTransferableAmount) => {
  return query(config.apis.equityTransferableAmount, params);
};

function* doEquityTransferableAmount(
  request: IAction<IParamsTransferableAmount>
) {
  try {
    const response: { data: IEquityTransferableAmountResponse } = yield call(
      queryEquityTransferableAmount,
      request.payload
    );

    yield put({
      type: request.response?.success,
      payload: roundDown(['transferableAmount'], response.data),
    });
  } catch (error) {
    yield put<IAction<INotification>>({
      type: COMMON_SHOW_NOTIFICATION,
      payload: {
        type: ToastType.ERROR,
        title: 'Transferable Amount',
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

export function* watchEquityTransferableAmount() {
  yield takeLatest(QUERY_TRANSFERABLE_AMOUNT, doEquityTransferableAmount);
}
