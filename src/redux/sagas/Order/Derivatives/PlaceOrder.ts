import {
  COMMON_SHOW_NOTIFICATION,
  ORDER_DERIVATIVES_PLACE_ORDER,
} from 'redux/actions';
import { IAction, INotification, IRequest, IResponse } from 'interfaces/common';
import { IDerivativesPlaceOrderAction } from 'interfaces/actions';
import {
  IDerivativesPlaceOrderParams,
  IDerivativesPlaceOrderResponse,
  IPlaceStopOrderParams,
  IPlaceStopOrderResponse,
} from 'interfaces/api';
import { IPlaceOrderReducer } from 'interfaces/reducers';
import { OrderKind } from 'constants/enum';
import { ToastType } from 'react-toastify';
import { call, put, takeLeading } from 'redux-saga/effects';
import { query } from 'utils/socketApi';
import config from 'config';

const placeNormalOrder = (params: IDerivativesPlaceOrderParams) => {
  return query(config.apis.derivativesPlaceOrder, params);
};

const placeStopOrder = (params: IPlaceStopOrderParams) => {
  return query(config.apis.placeStopOrder, params);
};

function* doPlaceOrder(request: IRequest<IDerivativesPlaceOrderAction>) {
  try {
    console.warn('Place order derivativesOrder', request);

    if (request.payload.orderKind === OrderKind.NORMAL_ORDER) {
      const response: IResponse<IDerivativesPlaceOrderResponse> = yield call(
        placeNormalOrder,
        request.payload.data
      );

      yield put<IAction<IPlaceOrderReducer>>({
        type: request.response.success,
        payload: {
          ...response.data,
          orderKind: request.orderKind,
          sellBuyType: request.payload.data.sellBuyType,
        },
      });

      yield put<IAction<INotification>>({
        type: COMMON_SHOW_NOTIFICATION,
        payload: {
          type: ToastType.SUCCESS,
          title: 'Derivatives Order',
          content: 'PLACE_ORDER_SUCCESS',
          contentParams: { orderNumber: response?.data.orderNumber },
          time: new Date(),
        },
      });
    } else if (request.payload.orderKind === OrderKind.STOP_LIMIT_ORDER) {
      const params = request.payload.data as IPlaceStopOrderParams;
      const response: IResponse<IPlaceStopOrderResponse> = yield call(
        placeStopOrder,
        {
          accountNumber: params.accountNumber,
          code: params.code,
          orderPrice: params.orderPrice,
          orderQuantity: params.orderQuantity,
          sellBuyType: params.sellBuyType,
          orderType: params.orderType,
          stopPrice: params.stopPrice,
          fromDate: params.fromDate,
          toDate: params.toDate,
        }
      );

      if (request.response) {
        yield put<IAction<IPlaceOrderReducer>>({
          type: request.response.success,
          payload: {
            ...response.data,
            orderKind: request.orderKind,
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
          contentParams: { orderNumber: response.data?.id },
          time: new Date(),
        },
      });
    }
  } catch (error) {
    yield put<IAction<string>>({
      type: request.response.failed,
      payload: error.code || error.message,
    });

    yield put<IAction<INotification>>({
      type: COMMON_SHOW_NOTIFICATION,
      payload: {
        type: ToastType.ERROR,
        title: request.orderKind,
        content: error.code || error.message,
        contentParams: error.messageParams,
        time: new Date(),
      },
    });
  }
}

export default function* watchPlaceOrder() {
  yield takeLeading(ORDER_DERIVATIVES_PLACE_ORDER, doPlaceOrder);
}
