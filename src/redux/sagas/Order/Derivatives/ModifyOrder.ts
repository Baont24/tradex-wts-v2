import {
  COMMON_SHOW_NOTIFICATION,
  ORDER_DERIVATIVES_MODIFY_ORDER,
} from 'redux/actions';
import { IAction, INotification, IResponse } from 'interfaces/common';
import {
  IDerivativesModifyOrderParams,
  IDerivativesModifyOrderResponse,
} from 'interfaces/api';
import { IModifyOrderReducer } from 'interfaces/reducers';
import { OrderKind } from 'constants/enum';
import { ToastType } from 'react-toastify';
import { call, put, takeLatest } from 'redux-saga/effects';
import { query } from 'utils/socketApi';
import config from 'config';

function modifyOrder(params: IDerivativesModifyOrderParams) {
  return query(config.apis.derivativesModifyOrder, params);
}

function* doModifyOrder(request: IAction<IDerivativesModifyOrderParams>) {
  try {
    const response: IResponse<IDerivativesModifyOrderResponse> = yield call(
      modifyOrder,
      request.payload
    );

    if (request.response != null) {
      yield put<IAction<IModifyOrderReducer>>({
        type: request.response.success,
        payload: { ...response.data, orderKind: OrderKind.NORMAL_ORDER },
      });
    }

    yield put<IAction<INotification>>({
      type: COMMON_SHOW_NOTIFICATION,
      payload: {
        type: ToastType.SUCCESS,
        title: 'Modify Order',
        content: 'MODIFY_ORDER_SUCCESS',
        contentParams: { orderNumber: response?.data?.orderId },
        time: new Date(),
      },
    });
  } catch (error) {
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
        title: 'Modify Order',
        content: error.code || error.message,
        contentParams: error.messageParams,
        time: new Date(),
      },
    });
  }
}

export default function* watchModifyOrder() {
  yield takeLatest(ORDER_DERIVATIVES_MODIFY_ORDER, doModifyOrder);
}
