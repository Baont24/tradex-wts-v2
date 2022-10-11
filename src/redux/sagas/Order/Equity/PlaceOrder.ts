import { COMMON_SHOW_NOTIFICATION, ORDER_PLACE_ORDER } from 'redux/actions';
import { IAction, INotification, IResponse } from 'interfaces/common';
import { IEquityPlaceOrderAction } from 'interfaces/actions';
import {
  IEquityPlaceOrderParams,
  IEquityPlaceOrderResponse,
  IPlaceStopOrderParams,
  IPlaceStopOrderResponse,
} from 'interfaces/api';
import { IPlaceOrderReducer } from 'interfaces/reducers';
import { OrderKind } from 'constants/enum';
import { ToastType } from 'react-toastify';
import { call, put, takeLeading } from 'redux-saga/effects';
import { query } from 'utils/socketApi';
import config from 'config';

const placeNormalOrder = (params: IEquityPlaceOrderParams) => {
  return query(config.apis.equityPlaceOrder, params);
};

const placeStopOrder = (params: IPlaceStopOrderParams) => {
  return query(config.apis.placeStopOrder, params);
};

function* doPlaceOrder(request: IAction<IEquityPlaceOrderAction>) {
  try {
    let response: IResponse<
      IEquityPlaceOrderResponse | IPlaceStopOrderResponse
    > | null = null;
    if (request.payload.orderKind === OrderKind.NORMAL_ORDER) {
      const params = request.payload.data as IEquityPlaceOrderParams;
      response = yield call(placeNormalOrder, {
        accountNumber: params.accountNumber,
        code: params.code,
        marketType: params.marketType,
        orderPrice: params.orderPrice,
        orderQuantity: params.orderQuantity,
        orderType: params.orderType,
        sellBuyType: params.sellBuyType,
        expiryDate: params.expiryDate,
      });
      const responseData = response?.data as IEquityPlaceOrderResponse;

      if (request.response) {
        yield put<IAction<IPlaceOrderReducer | null>>({
          type: request.response.success,
          payload: {
            ...responseData,
            orderKind: request.payload.orderKind,
            sellBuyType: request.payload.data.sellBuyType,
          },
        });
      }

      if (responseData?.success) {
        yield put<IAction<INotification>>({
          type: COMMON_SHOW_NOTIFICATION,
          payload: {
            type: ToastType.SUCCESS,
            title: 'Order',
            content: 'PLACE_ORDER_SUCCESS',
            contentParams: { orderNumber: responseData?.orderNumber },
            time: new Date(),
          },
        });
      } else {
        yield put<IAction<INotification>>({
          type: COMMON_SHOW_NOTIFICATION,
          payload: {
            type: ToastType.ERROR,
            title: 'Order',
            content: 'PLACE_ORDER_FAILED',
            contentParams: { orderNumber: responseData?.orderNumber },
            time: new Date(),
          },
        });
      }
    } else if (request.payload.orderKind === OrderKind.STOP_LIMIT_ORDER) {
      const params = request.payload.data as IPlaceStopOrderParams;
      response = yield call(placeStopOrder, {
        accountNumber: params.accountNumber,
        code: params.code,
        orderPrice: params.orderPrice,
        orderQuantity: params.orderQuantity,
        sellBuyType: params.sellBuyType,
        orderType: params.orderType,
        stopPrice: params.stopPrice,
        fromDate: params.fromDate,
        toDate: params.toDate,
      });

      const responseData = response?.data as IPlaceStopOrderResponse;

      if (request.response) {
        yield put<IAction<IPlaceOrderReducer | null>>({
          type: request.response.success,
          payload: {
            ...responseData,
            orderKind: request.payload.orderKind,
            sellBuyType: request.payload.data.sellBuyType,
          },
        });
      }

      yield put<IAction<INotification>>({
        type: COMMON_SHOW_NOTIFICATION,
        payload: {
          type: ToastType.SUCCESS,
          title: 'Order',
          content: 'PLACE_ORDER_SUCCESS',
          contentParams: { orderNumber: responseData?.id },
          time: new Date(),
        },
      });
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
        title: request.payload.orderKind,
        content: error.code || error.message,
        contentParams: error.messageParams,
        time: new Date(),
      },
    });
  }
}

export default function* watchPlaceOrder() {
  yield takeLeading(ORDER_PLACE_ORDER, doPlaceOrder);
}
