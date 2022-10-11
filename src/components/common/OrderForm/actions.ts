import {
  ACCOUNT_QUERY_DERIVATIVES_PORTFOLIO,
  ACCOUNT_QUERY_DERIVATIVES_PORTFOLIO_FAILED,
  ACCOUNT_QUERY_DERIVATIVES_PORTFOLIO_SUCCESS,
  ACCOUNT_QUERY_EQUITY_PORTFOLIO,
  ACCOUNT_QUERY_EQUITY_PORTFOLIO_FAILED,
  ACCOUNT_QUERY_EQUITY_PORTFOLIO_SUCCESS,
  ACCOUNT_QUERY_PORTFOLIOS,
  ACCOUNT_QUERY_PORTFOLIOS_FAILED,
  ACCOUNT_QUERY_PORTFOLIOS_SUCCESS,
  ORDER_CANCEL_ORDER,
  ORDER_CANCEL_ORDER_FAILED,
  ORDER_CANCEL_ORDER_SUCCESS,
  ORDER_CANCEL_STOP_ORDER,
  ORDER_DERIVATIVES_CANCEL_ORDER,
  ORDER_DERIVATIVES_MODIFY_ORDER,
  ORDER_DERIVATIVES_PLACE_ORDER,
  ORDER_MODIFY_ORDER,
  ORDER_MODIFY_ORDER_FAILED,
  ORDER_MODIFY_ORDER_SUCCESS,
  ORDER_MODIFY_STOP_ORDER,
  ORDER_PLACE_ORDER,
  ORDER_PLACE_ORDER_FAILED,
  ORDER_PLACE_ORDER_SUCCESS,
} from 'redux/actions';
import { IAction } from 'interfaces/common';
import {
  ICancelStopOrderMultiParams,
  IDerivativesCancelOrderParams,
  IDerivativesModifyOrderParams,
  IDerivativesPlaceOrderParams,
  IEquityCancelOrderParams,
  IEquityModifyOrderParams,
  IEquityPlaceOrderParams,
  IModifyStopOrderParams,
  IPlaceStopOrderParams,
} from 'interfaces/api';
import {
  IChangeOrderFormHeight,
  IDerivativesPlaceOrderAction,
  IEquityOrderStockInfoAction,
  IEquityPlaceOrderAction,
} from 'interfaces/actions';
import { OrderKind, SystemType } from 'constants/enum';

// get stock info
export const ORDER_QUERY_STOCK_INFO = 'order/QUERY_STOCK_INFO';
export const ORDER_QUERY_STOCK_INFO_SUCCEEDED =
  'order/QUERY_STOCK_INFO_SUCCEEDED';
export const ORDER_QUERY_STOCK_INFO_FAILED = 'order/QUERY_STOCK_INFO_FAILED';
export const ORDER_QUERY_STOCK_INFO_MAX_QTY = 'order/QUERY_STOCK_INFO_MAX_QTY';
export const ORDER_QUERY_STOCK_INFO_MAX_QTY_SUCCESS =
  'order/QUERY_STOCK_INFO_MAX_QTY_SUCCESS';
export const ORDER_QUERY_STOCK_INFO_MAX_QTY_FAILED =
  'order/QUERY_STOCK_INFO_MAX_QTY_FAILED';

export const ORDER_QUERY_STOCK_INFO_MODAL = 'order/QUERY_STOCK_INFO_MODAL';
export const ORDER_QUERY_STOCK_INFO_MODAL_SUCCEEDED =
  'order/QUERY_STOCK_INFO_MODAL_SUCCEEDED';
export const ORDER_QUERY_STOCK_INFO_MODAL_FAILED =
  'order/QUERY_STOCK_INFO_MODAL_FAILED';
export const ORDER_QUERY_STOCK_INFO_MODAL_MAX_QTY =
  'order/QUERY_STOCK_INFO_MODAL_MAX_QTY';
export const ORDER_QUERY_STOCK_INFO_MODAL_MAX_QTY_SUCCESS =
  'order/QUERY_STOCK_INFO_MODAL_MAX_QTY_SUCCESS';
export const ORDER_QUERY_STOCK_INFO_MODAL_MAX_QTY_FAILED =
  'order/QUERY_STOCK_INFO_MODAL_MAX_QTY_FAILED';
export const CHANGE_ORDER_FORM_HEIGHT = 'order/CHANGE_ORDER_FORM_HEIGHT';
export const CHANGE_ORDER_FORM_HEIGHT_FAILED =
  'order/CHANGE_ORDER_FORM_HEIGHT_FAILED';
export const CHANGE_ORDER_FORM_HEIGHT_SUCCESS =
  'order/CHANGE_ORDER_FORM_HEIGHT_SUCCESS';

export const placeOrder = (
  data: IEquityPlaceOrderParams,
  orderKind: OrderKind
): IAction<IEquityPlaceOrderAction> => ({
  type: ORDER_PLACE_ORDER,
  response: {
    success: ORDER_PLACE_ORDER_SUCCESS,
    failed: ORDER_PLACE_ORDER_FAILED,
  },
  payload: { data, orderKind },
});

export const placeStopOrder = (data: IPlaceStopOrderParams) => ({
  type: ORDER_PLACE_ORDER,
  response: {
    success: ORDER_PLACE_ORDER_SUCCESS,
    failed: ORDER_PLACE_ORDER_FAILED,
  },
  payload: { data, orderKind: OrderKind.STOP_LIMIT_ORDER },
});

export const placeDerivativesOrder = (
  data: IDerivativesPlaceOrderParams,
  orderKind: OrderKind
): IAction<IDerivativesPlaceOrderAction> => ({
  type: ORDER_DERIVATIVES_PLACE_ORDER,
  response: {
    success: ORDER_PLACE_ORDER_SUCCESS,
    failed: ORDER_PLACE_ORDER_FAILED,
  },
  payload: {
    data,
    orderKind,
  },
});

export const cancelOrder = (
  payload: IEquityCancelOrderParams
): IAction<IEquityCancelOrderParams> => ({
  type: ORDER_CANCEL_ORDER,
  response: {
    success: ORDER_CANCEL_ORDER_SUCCESS,
    failed: ORDER_CANCEL_ORDER_FAILED,
  },
  payload,
});

export const cancelStopOrder = (
  payload: ICancelStopOrderMultiParams
): IAction<ICancelStopOrderMultiParams> => ({
  type: ORDER_CANCEL_STOP_ORDER,
  response: {
    success: ORDER_CANCEL_ORDER_SUCCESS,
    failed: ORDER_CANCEL_ORDER_FAILED,
  },
  payload,
});

export const cancelDerivativesOrder = (
  payload: IDerivativesCancelOrderParams
): IAction<IDerivativesCancelOrderParams> => ({
  type: ORDER_DERIVATIVES_CANCEL_ORDER,
  response: {
    success: ORDER_CANCEL_ORDER_SUCCESS,
    failed: ORDER_CANCEL_ORDER_FAILED,
  },
  payload,
});

export const modifyOrder = (
  payload: IEquityModifyOrderParams
): IAction<IEquityModifyOrderParams> => ({
  type: ORDER_MODIFY_ORDER,
  response: {
    success: ORDER_MODIFY_ORDER_SUCCESS,
    failed: ORDER_MODIFY_ORDER_FAILED,
  },
  payload,
});

export const modifyStopOrder = (
  payload: IModifyStopOrderParams
): IAction<IModifyStopOrderParams> => ({
  type: ORDER_MODIFY_STOP_ORDER,
  response: {
    success: ORDER_MODIFY_ORDER_SUCCESS,
    failed: ORDER_MODIFY_ORDER_FAILED,
  },
  payload,
});

export const modifyDerivativesOrder = (
  payload: IDerivativesModifyOrderParams
): IAction<IDerivativesModifyOrderParams> => ({
  type: ORDER_DERIVATIVES_MODIFY_ORDER,
  response: {
    success: ORDER_MODIFY_ORDER_SUCCESS,
    failed: ORDER_MODIFY_ORDER_FAILED,
  },
  payload,
});

export const enquiryPortfolio = (payload: {
  readonly accountNumber: string;
  readonly type?: SystemType;
}): IAction<{
  readonly accountNumber: string;
  readonly type?: SystemType;
}> => ({
  type:
    payload.type === SystemType.DERIVATIVES
      ? ACCOUNT_QUERY_DERIVATIVES_PORTFOLIO
      : ACCOUNT_QUERY_EQUITY_PORTFOLIO,
  payload,
  response: {
    success:
      payload.type === SystemType.DERIVATIVES
        ? ACCOUNT_QUERY_DERIVATIVES_PORTFOLIO_SUCCESS
        : ACCOUNT_QUERY_EQUITY_PORTFOLIO_SUCCESS,
    failed:
      payload.type === SystemType.DERIVATIVES
        ? ACCOUNT_QUERY_DERIVATIVES_PORTFOLIO_FAILED
        : ACCOUNT_QUERY_EQUITY_PORTFOLIO_FAILED,
  },
});

export const enquiryEquityPortfolios = (): IAction<{
  readonly accountNumber: string;
}> => ({
  type: ACCOUNT_QUERY_PORTFOLIOS,
  payload: {
    accountNumber: 'ALL',
  },
  response: {
    success: ACCOUNT_QUERY_PORTFOLIOS_SUCCESS,
    failed: ACCOUNT_QUERY_PORTFOLIOS_FAILED,
  },
});

export const queryOrderStockInfo = (
  payload: IEquityOrderStockInfoAction
): IAction<IEquityOrderStockInfoAction> => ({
  type: payload.isModal
    ? payload.onlyGetMaxQty
      ? ORDER_QUERY_STOCK_INFO_MODAL_MAX_QTY
      : ORDER_QUERY_STOCK_INFO_MODAL
    : payload.onlyGetMaxQty
    ? ORDER_QUERY_STOCK_INFO_MAX_QTY
    : ORDER_QUERY_STOCK_INFO,
  payload,
  response: {
    success: payload.isModal
      ? ORDER_QUERY_STOCK_INFO_MODAL_SUCCEEDED
      : ORDER_QUERY_STOCK_INFO_SUCCEEDED,
    failed: payload.isModal
      ? ORDER_QUERY_STOCK_INFO_MODAL_FAILED
      : ORDER_QUERY_STOCK_INFO_FAILED,
  },
});

export const changeOrderFormHeight = (
  payload: IChangeOrderFormHeight
): IAction<IChangeOrderFormHeight> => ({
  type: CHANGE_ORDER_FORM_HEIGHT,
  payload,
  response: {
    failed: CHANGE_ORDER_FORM_HEIGHT_FAILED,
    success: CHANGE_ORDER_FORM_HEIGHT_SUCCESS,
  },
});
