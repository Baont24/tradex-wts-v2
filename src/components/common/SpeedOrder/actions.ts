import { IAction } from 'interfaces/common';
import {
  ISpeedOrderCancelOrderParams,
  ISpeedOrderCancelStopOrderParams,
  ISpeedOrderModifyOrderParams,
  ISpeedOrderModifyStopOrderParams,
} from 'interfaces/api';
import { OrderKind } from 'constants/enum';

export const SPEED_ORDER_GET_PRICE_LIST = 'speed-order/GET_PRICE_LIST';
export const SPEED_ORDER_UPDATE_PRICE_LIST = 'speed-order/UPDATE_PRICE_LIST';
export const SPEED_ORDER_GET_PRICE_LIST_SUCCESS =
  'speed-order/GET_PRICE_LIST_SUCCESS';
export const SPEED_ORDER_GET_PRICE_LIST_FAILED =
  'speed-order/GET_PRICE_LIST_FAILED';

export const SPEED_ORDER_MODIFY_ORDER = 'speed-order/MODIFY_ORDER';
export const SPEED_ORDER_MODIFY_ORDER_SUCCESS =
  'speed-order/MODIFY_ORDER_SUCCESS';
export const SPEED_ORDER_MODIFY_ORDER_FAILED =
  'speed-order/MODIFY_ORDER_FAILED';

export const SPEED_ORDER_MODIFY_STOP_ORDER = 'speed-order/MODIFY_STOP_ORDER';
export const SPEED_ORDER_MODIFY_STOP_ORDER_SUCCESS =
  'speed-order/MODIFY_STOP_ORDER_SUCCESS';
export const SPEED_ORDER_MODIFY_STOP_ORDER_FAILED =
  'speed-order/MODIFY_STOP_ORDER_FAILED';

export const SPEED_ORDER_CANCEL_ORDER = 'speed-order/CANCEL_ORDER';
export const SPEED_ORDER_CANCEL_ORDER_SUCCESS =
  'speed-order/CANCEL_ORDER_SUCCESS';
export const SPEED_ORDER_CANCEL_ORDER_FAILED =
  'speed-order/CANCEL_ORDER_FAILED';

export const SPEED_ORDER_CANCEL_STOP_ORDER = 'speed-order/CANCEL_STOP_ORDER';
export const SPEED_ORDER_CANCEL_STOP_ORDER_SUCCESS =
  'speed-order/CANCEL_STOP_ORDER_SUCCESS';
export const SPEED_ORDER_CANCEL_STOP_ORDER_FAILED =
  'speed-order/CANCEL_STOP_ORDER_FAILED';

export const SPEED_ORDER_ON_ONE_CLICK_ORDER = 'speed-order/ON_ONE_CLICK_ORDER';
export const SPEED_ORDER_ON_WITH_PROMPT_ORDER =
  'speed-order/ON_WITH_PROMPT_ORDER';

export const getSpeedOrderPriceList = (
  payload?: OrderKind
): IAction<OrderKind | undefined> => ({
  type: SPEED_ORDER_GET_PRICE_LIST,
  payload,
  response: {
    success: SPEED_ORDER_GET_PRICE_LIST_SUCCESS,
    failed: SPEED_ORDER_GET_PRICE_LIST_FAILED,
  },
});

export const speedOrderModifyOrder = (
  payload: ISpeedOrderModifyOrderParams
): IAction<ISpeedOrderModifyOrderParams> => ({
  type: SPEED_ORDER_MODIFY_ORDER,
  payload,
  response: {
    success: SPEED_ORDER_MODIFY_ORDER_SUCCESS,
    failed: SPEED_ORDER_MODIFY_ORDER_FAILED,
  },
});

export const speedOrderCancelOrder = (
  payload: ISpeedOrderCancelOrderParams
): IAction<ISpeedOrderCancelOrderParams> => ({
  type: SPEED_ORDER_CANCEL_ORDER,
  payload,
  response: {
    success: SPEED_ORDER_CANCEL_ORDER_SUCCESS,
    failed: SPEED_ORDER_CANCEL_ORDER_FAILED,
  },
});

export const speedOrderModifyStopOrder = (
  payload: ISpeedOrderModifyStopOrderParams
): IAction<ISpeedOrderModifyStopOrderParams> => ({
  type: SPEED_ORDER_MODIFY_STOP_ORDER,
  payload,
  response: {
    success: SPEED_ORDER_MODIFY_STOP_ORDER_SUCCESS,
    failed: SPEED_ORDER_MODIFY_STOP_ORDER_FAILED,
  },
});

export const speedOrderCancelStopOrder = (
  payload: ISpeedOrderCancelStopOrderParams
): IAction<ISpeedOrderCancelStopOrderParams> => ({
  type: SPEED_ORDER_CANCEL_STOP_ORDER,
  payload,
  response: {
    success: SPEED_ORDER_CANCEL_STOP_ORDER_SUCCESS,
    failed: SPEED_ORDER_CANCEL_STOP_ORDER_FAILED,
  },
});

export const onSingleClickSpeedOrderTrigger = (): IAction<boolean> => ({
  type: SPEED_ORDER_ON_ONE_CLICK_ORDER,
  payload: true,
});

export const onWithPromptSpeedOrderTrigger = (): IAction<boolean> => ({
  type: SPEED_ORDER_ON_WITH_PROMPT_ORDER,
  payload: true,
});
