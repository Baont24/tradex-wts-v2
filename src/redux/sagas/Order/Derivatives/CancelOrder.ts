import {
  COMMON_SHOW_NOTIFICATION,
  ORDER_DERIVATIVES_CANCEL_ORDER,
} from 'redux/actions';
import { IAction, INotification } from 'interfaces/common';
import { ICancelOrderReducer } from 'interfaces/reducers';
import {
  IDerivativesCancelOrderParams,
  IDerivativesCancelOrderResponse,
} from 'interfaces/api';
import { OrderKind } from 'constants/enum';
import { ToastType } from 'react-toastify';
import { call, put, takeLatest } from 'redux-saga/effects';
import { query } from 'utils/socketApi';
import config from 'config';

function cancelOrder(params: IDerivativesCancelOrderParams) {
  return query(config.apis.derivativesCancelOrder, params);
}

function* doCancelOrder(request: IAction<IDerivativesCancelOrderParams>) {
  try {
    const response: { data?: IDerivativesCancelOrderResponse[] } = yield call(
      cancelOrder,
      request.payload
    );

    if (response?.data != null && request.response != null) {
      const successOrders = response.data.filter((val) => val.success);
      const failedOrders = response.data.filter((val) => !val.success);
      yield put<IAction<ICancelOrderReducer>>({
        type: request.response.success,
        payload: { orderKind: OrderKind.NORMAL_ORDER, result: response.data },
      });
      if (successOrders.length > 0) {
        if (successOrders.length === 1) {
          yield put<IAction<INotification>>({
            type: COMMON_SHOW_NOTIFICATION,
            payload: {
              type: ToastType.SUCCESS,
              title: 'Cancel Order',
              content: 'CANCEL_ORDER_SUCCESS',
              contentParams: { orderNumber: successOrders[0].orderNo },
              time: new Date(),
            },
          });
        } else {
          yield put<IAction<INotification>>({
            type: COMMON_SHOW_NOTIFICATION,
            payload: {
              type: ToastType.SUCCESS,
              title: 'Cancel Order',
              content: 'CANCEL_ORDERS_SUCCESS',
              time: new Date(),
            },
          });
        }
      }

      if (failedOrders.length > 0) {
        if (failedOrders.length === 1) {
          yield put<IAction<INotification>>({
            type: COMMON_SHOW_NOTIFICATION,
            payload: {
              type: ToastType.ERROR,
              title: 'Cancel Order',
              content: failedOrders[0].rejectCause,
              time: new Date(),
            },
          });
        } else {
          yield put<IAction<INotification>>({
            type: COMMON_SHOW_NOTIFICATION,
            payload: {
              type: ToastType.ERROR,
              title: 'Cancel Order',
              content: 'CANCEL_ORDERS_FAILED',
              time: new Date(),
            },
          });
        }
      }
    }
  } catch (error) {
    console.error('Cancel order error', error);
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
        title: 'Cancel Order',
        content: error.code || error.message,
        contentParams: error.messageParams,
        time: new Date(),
      },
    });
  }
}

export default function* watchCancelOrder() {
  yield takeLatest(ORDER_DERIVATIVES_CANCEL_ORDER, doCancelOrder);
}
