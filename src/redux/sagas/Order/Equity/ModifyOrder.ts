import {
  COMMON_SHOW_NOTIFICATION,
  ORDER_MODIFY_ORDER,
  ORDER_MODIFY_STOP_ORDER,
} from 'redux/actions';
import { IAction, INotification, IResponse } from 'interfaces/common';
import {
  IEquityModifyOrderParams,
  IEquityModifyOrderResponse,
  IModifyStopOrderParams,
  IModifyStopOrderResponse,
} from 'interfaces/api';
import { IModifyOrderReducer } from 'interfaces/reducers';
import { OrderKind } from 'constants/enum';
import { ToastType } from 'react-toastify';
import { call, put, takeLatest } from 'redux-saga/effects';
import { query } from 'utils/socketApi';
import config from 'config';

function modifyOrder(params: IEquityModifyOrderParams) {
  return query(config.apis.equityModifyOrder, params);
}

function modifyStopOrder(params: IModifyStopOrderParams) {
  return query(config.apis.modifyStopOrder, params);
}

function* doModifyOrder(request: IAction<IEquityModifyOrderParams>) {
  try {
    const response: IResponse<IEquityModifyOrderResponse> = yield call(
      modifyOrder,
      request.payload
    );

    if (response.data != null && request.response != null) {
      if (response.data.success) {
        yield put<IAction<IModifyOrderReducer>>({
          type: request.response.success,
          payload: { ...response.data, orderKind: OrderKind.NORMAL_ORDER },
        });

        yield put<IAction<INotification>>({
          type: COMMON_SHOW_NOTIFICATION,
          payload: {
            type: ToastType.SUCCESS,
            title: 'Modify Order',
            content: 'MODIFY_ORDER_SUCCESS',
            contentParams: { orderNumber: response?.data?.orderNo },
            time: new Date(),
          },
        });
      } else {
        yield put<IAction<string>>({
          type: request.response.failed,
          payload: 'Modify Order Failed',
        });
      }
    }
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

function* doModifyStopOrder(request: IAction<IModifyStopOrderParams>) {
  try {
    const response: IResponse<IModifyStopOrderResponse> = yield call(
      modifyStopOrder,
      request.payload
    );

    if (response?.data != null && request.response != null) {
      if (response.data.success) {
        yield put<IAction<IModifyOrderReducer>>({
          type: request.response.success,
          payload: { ...response.data, orderKind: OrderKind.STOP_LIMIT_ORDER },
        });

        yield put<IAction<INotification>>({
          type: COMMON_SHOW_NOTIFICATION,
          payload: {
            type: ToastType.SUCCESS,
            title: 'Modify Order',
            content: 'MODIFY_ORDER_SUCCESS',
            time: new Date(),
          },
        });
      } else {
        yield put<IAction<string>>({
          type: request.response.failed,
          payload: '',
        });
      }
    }
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
  yield takeLatest(ORDER_MODIFY_ORDER, doModifyOrder);
  yield takeLatest(ORDER_MODIFY_STOP_ORDER, doModifyStopOrder);
}
