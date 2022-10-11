import {
  ACCOUNT_EQUITY_CONFIRM_DEBT,
  ACCOUNT_EQUITY_SUBMIT_CONFIRM_DEBT,
  COMMON_SHOW_NOTIFICATION,
} from 'redux/actions';
import { IAction, INotification } from 'interfaces/common';
import {
  IConfirmDebtResponse,
  IEquityConfirmDebtResponse,
  IParamsEquityConfirmDebt,
  ISubmitConfirmDebt,
} from 'interfaces/api';
import { ToastType } from 'react-toastify';
import { call, put, takeLatest } from 'redux-saga/effects';
import { query } from 'utils/socketApi';
import config from 'config';

const queryConfirmDebtt = (params: IParamsEquityConfirmDebt) => {
  return query(config.apis.equityConfirmDebt, params);
};

function* doQueryConfirmDebt(request: IAction<IParamsEquityConfirmDebt>) {
  try {
    const response: { data: IEquityConfirmDebtResponse } = yield call(
      queryConfirmDebtt,
      request.payload
    );
    if (request.response) {
      yield put<
        IAction<{
          readonly resConfirmDebt: IEquityConfirmDebtResponse;
          readonly callAPi:
            | 'Second_Time_Signed_Equal_True'
            | 'First_Time_Signed_Equal_False';
        }>
      >({
        type: request.response.success,
        payload: {
          resConfirmDebt: response.data,
          callAPi: request.payload.signed
            ? 'Second_Time_Signed_Equal_True'
            : 'First_Time_Signed_Equal_False',
        },
      });
    }
  } catch (error) {
    console.error('Query Confirm Debt', error);

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
        title: 'Confirm Debt',
        content: error.code || error.message,
        contentParams: error.messageParams,
        time: new Date(),
      },
    });
  }
}

const submitConfirmDebt = (params: ISubmitConfirmDebt) => {
  return query(config.apis.submitConfirmDebt, params);
};

function* doSubmitConfirmDebt(request: IAction<ISubmitConfirmDebt>) {
  try {
    const response: { data: IConfirmDebtResponse } = yield call(
      submitConfirmDebt,
      request.payload
    );
    if (request.response) {
      yield put<IAction<IConfirmDebtResponse>>({
        type: request.response.success,
        payload: response.data,
      });
    }
    yield put<IAction<INotification>>({
      type: COMMON_SHOW_NOTIFICATION,
      payload: {
        type: ToastType.SUCCESS,
        title: 'Confirm Debt',
        content: response.data.mainResult,
        time: new Date(),
      },
    });
  } catch (error) {
    console.error('Submit Confirm Debt', error);

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
        title: 'Submit Confirm Debt',
        content: error.code || error.message,
        contentParams: error.messageParams,
        time: new Date(),
      },
    });
  }
}

export function* watchConfirmDebt() {
  yield takeLatest(ACCOUNT_EQUITY_CONFIRM_DEBT, doQueryConfirmDebt);
  yield takeLatest(ACCOUNT_EQUITY_SUBMIT_CONFIRM_DEBT, doSubmitConfirmDebt);
}
