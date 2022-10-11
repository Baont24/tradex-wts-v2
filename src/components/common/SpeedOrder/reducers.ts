import { IAction, IQueryReducer } from 'interfaces/common';
import { INewSymbolData } from 'interfaces/market';
import {
  ISpeedOrderCancelOrderResponse,
  ISpeedOrderModifyOrderResponse,
  ISpeedOrderModifyStopOrderResponse,
  ISpeedOrderState,
} from 'interfaces/api';
import { ISpeedOrderRowData, ISummaryRowData } from './utils';
import {
  SPEED_ORDER_CANCEL_ORDER,
  SPEED_ORDER_CANCEL_ORDER_FAILED,
  SPEED_ORDER_CANCEL_ORDER_SUCCESS,
  SPEED_ORDER_CANCEL_STOP_ORDER,
  SPEED_ORDER_CANCEL_STOP_ORDER_FAILED,
  SPEED_ORDER_CANCEL_STOP_ORDER_SUCCESS,
  SPEED_ORDER_GET_PRICE_LIST,
  SPEED_ORDER_GET_PRICE_LIST_FAILED,
  SPEED_ORDER_GET_PRICE_LIST_SUCCESS,
  SPEED_ORDER_MODIFY_ORDER,
  SPEED_ORDER_MODIFY_ORDER_FAILED,
  SPEED_ORDER_MODIFY_ORDER_SUCCESS,
  SPEED_ORDER_MODIFY_STOP_ORDER,
  SPEED_ORDER_MODIFY_STOP_ORDER_FAILED,
  SPEED_ORDER_MODIFY_STOP_ORDER_SUCCESS,
  SPEED_ORDER_ON_ONE_CLICK_ORDER,
  SPEED_ORDER_ON_WITH_PROMPT_ORDER,
  SPEED_ORDER_UPDATE_PRICE_LIST,
} from './actions';

export interface ISpeedOrderReducer {
  readonly priceList: ISpeedOrderRowData[];
  readonly total: ISummaryRowData;
  readonly symbolData?: INewSymbolData;
}

export const SpeedOrder: IQueryReducer<
  ISpeedOrderReducer,
  Partial<ISpeedOrderReducer> | ISpeedOrderRowData[] | ISummaryRowData | string
> = (state = { data: { priceList: [], total: {} }, status: {} }, action) => {
  switch (action.type) {
    case SPEED_ORDER_GET_PRICE_LIST:
      return {
        ...state,
        status: {
          isLoading: true,
        },
      };
    case SPEED_ORDER_GET_PRICE_LIST_SUCCESS:
      return {
        data: action.payload as ISpeedOrderReducer,
        status: {
          isSucceeded: true,
        },
      };
    case SPEED_ORDER_UPDATE_PRICE_LIST:
      return {
        ...state,
        data: {
          ...state.data,
          ...(action.payload as Partial<ISpeedOrderReducer>),
        },
      };
    case SPEED_ORDER_GET_PRICE_LIST_FAILED:
      return {
        data: {
          priceList: [],
          total: {},
        },
        status: {
          isFailed: true,
          errorMessage: action.payload as string,
        },
      };
    default:
      return state;
  }
};

export const ModifySpeedOrderResult: IQueryReducer<
  ISpeedOrderModifyOrderResponse[] | ISpeedOrderModifyStopOrderResponse[],
  string
> = (state = { data: [], status: {} }, action) => {
  switch (action.type) {
    case SPEED_ORDER_MODIFY_ORDER:
    case SPEED_ORDER_MODIFY_STOP_ORDER:
      return {
        data: [],
        status: {
          isLoading: true,
        },
      };
    case SPEED_ORDER_MODIFY_ORDER_SUCCESS:
    case SPEED_ORDER_MODIFY_STOP_ORDER_SUCCESS:
      return {
        data: action.payload as ISpeedOrderModifyOrderResponse[],
        status: {
          isSucceeded: true,
        },
      };
    case SPEED_ORDER_MODIFY_ORDER_FAILED:
    case SPEED_ORDER_MODIFY_STOP_ORDER_FAILED:
      return {
        data: [],
        status: {
          isFailed: true,
          errorMessage: action.payload as string,
        },
      };
    default:
      return state;
  }
};

export const CancelSpeedOrderResult: IQueryReducer<
  ISpeedOrderCancelOrderResponse[],
  string
> = (state = { data: [], status: {} }, action) => {
  switch (action.type) {
    case SPEED_ORDER_CANCEL_ORDER:
    case SPEED_ORDER_CANCEL_STOP_ORDER:
      return {
        data: [],
        status: {
          isLoading: true,
        },
      };
    case SPEED_ORDER_CANCEL_ORDER_SUCCESS:
    case SPEED_ORDER_CANCEL_STOP_ORDER_SUCCESS:
      return {
        data: action.payload as ISpeedOrderCancelOrderResponse[],
        status: {
          isSucceeded: true,
        },
      };
    case SPEED_ORDER_CANCEL_ORDER_FAILED:
    case SPEED_ORDER_CANCEL_STOP_ORDER_FAILED:
      return {
        data: [],
        status: {
          isFailed: true,
          errorMessage: action.payload as string,
        },
      };
    default:
      return state;
  }
};

export function IsSingleClickSpeedOrder(
  state = {
    isOneClick: false,
    isWithPrompt: false,
  },
  action: IAction<ISpeedOrderState>
) {
  switch (action.type) {
    case SPEED_ORDER_ON_ONE_CLICK_ORDER:
      return {
        ...state,
        isOneClick: !state.isOneClick,
      };
    case SPEED_ORDER_ON_WITH_PROMPT_ORDER:
      return {
        ...state,
        isWithPrompt: !state.isWithPrompt,
      };
    default:
      return state;
  }
}
