import {
  ACCOUNT_ORDER_CONFIRMATION,
  ACCOUNT_ORDER_CONFIRMATION_LOAD_MORE,
  ACCOUNT_ORDER_CONFIRMATION_SUBMIT,
} from './actions';
import { COMMON_SHOW_NOTIFICATION } from 'redux/actions';
import { IAction, INotification, IResponse } from 'interfaces/common';
import {
  IDerivativesOrderConfirmationResponse,
  IDerivativesOrderConfirmationSubmitParams,
  IDerivativesOrderConfirmationSubmitResponse,
  IEquityOrderConfirmationSubmitParams,
  IEquityOrderConfirmationSubmitResponse,
  IOrderConfirmationParams,
  IOrderConfirmationResponse,
} from 'interfaces/api';
import {
  IOrderConfirmationAction,
  IOrderConfirmationSubmitAction,
} from 'interfaces/actions';
import { IOrderConfirmationSubmitReducer } from 'interfaces/reducers';
import { IState } from 'redux/global-reducers';
import { SystemType } from 'constants/enum';
import { ToastType } from 'react-toastify';
import { call, put, select, takeLatest } from 'redux-saga/effects';
import { query } from 'utils/socketApi';
import config from 'config';

const queryEquityOrderConfirmation = (params: IOrderConfirmationParams) => {
  return query(config.apis.equityOrderConfirmation, params);
};

const queryEquityOrderConfirmationSubmit = (
  params: IEquityOrderConfirmationSubmitParams
) => {
  return query(config.apis.equityOrderConfirmationSubmit, params);
};

const queryDerivativesOrderConfirmation = (
  params: IOrderConfirmationParams
) => {
  return query(config.apis.derivativesOrderConfirmation, params);
};

const queryDerivativesOrderConfirmationSubmit = (
  params: IDerivativesOrderConfirmationSubmitParams
) => {
  return query(config.apis.derivativesOrderConfirmationSubmit, params);
};

function* doQueryOrderConfirmation(request: IAction<IOrderConfirmationAction>) {
  try {
    let responseData: IOrderConfirmationResponse[] | undefined;
    if (request.payload.systemType === SystemType.DERIVATIVES) {
      const response: IResponse<IDerivativesOrderConfirmationResponse> = yield call(
        queryDerivativesOrderConfirmation,
        request.payload
      );

      responseData = response.data.list;
    } else {
      const response: IResponse<IOrderConfirmationResponse[]> = yield call(
        queryEquityOrderConfirmation,
        request.payload
      );
      responseData = response.data;
    }

    if (request.response) {
      yield put<IAction<IOrderConfirmationResponse[]>>({
        type: request.response.success,
        payload: responseData,
      });
    }
  } catch (error) {
    console.error('Order Confirmation', error);
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
        title: 'Order Confirmation',
        content: error.code || error.message,
        contentParams: error.messageParams,
        time: new Date(),
      },
    });
  }
}

function* doQueryOrderConfirmationSubmit(
  request: IAction<IOrderConfirmationSubmitAction>
) {
  try {
    const store: IState = yield select((state: IState) => ({
      lang: state.lang,
    }));
    let responseData: IOrderConfirmationSubmitReducer | undefined;
    if (request.payload.systemType === SystemType.DERIVATIVES) {
      const response: IResponse<IDerivativesOrderConfirmationSubmitResponse> = yield call(
        queryDerivativesOrderConfirmationSubmit,
        {
          accountNo: request.payload.accountNumber,
          language: store.lang,
          details: request.payload.details.map((val) => ({
            isHistory: val.isHistory,
            orderGroupId: val.orderGroupId ?? '',
            refId: val.refId ?? '',
          })),
        }
      );
      responseData = response.data;
    } else {
      const response: IResponse<IEquityOrderConfirmationSubmitResponse> = yield call(
        queryEquityOrderConfirmationSubmit,
        {
          accountNo: request.payload.accountNumber,
          mvOrderList: request.payload.details.map((val) => [
            val.orderGroupId ?? '',
            val.isHistory,
            val.refId ?? '',
          ]),
        }
      );

      responseData = response.data;
    }

    yield put<IAction<INotification>>({
      type: COMMON_SHOW_NOTIFICATION,
      payload: {
        type: ToastType.SUCCESS,
        title: 'Order Confirmation',
        content: responseData?.message,
        time: new Date(),
      },
    });

    if (request.response) {
      yield put<IAction<IOrderConfirmationSubmitReducer>>({
        type: request.response.success,
        payload: responseData,
      });
    }
  } catch (error) {
    console.error('Order Confirmation submit', error);
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
        title: 'Order Confirmation',
        content: error.code || error.message,
        contentParams: error.messageParams,
        time: new Date(),
      },
    });
  }
}

export function* watchQueryOrderConfirmation() {
  yield takeLatest(ACCOUNT_ORDER_CONFIRMATION, doQueryOrderConfirmation);
  yield takeLatest(
    ACCOUNT_ORDER_CONFIRMATION_LOAD_MORE,
    doQueryOrderConfirmation
  );
  yield takeLatest(
    ACCOUNT_ORDER_CONFIRMATION_SUBMIT,
    doQueryOrderConfirmationSubmit
  );
}
