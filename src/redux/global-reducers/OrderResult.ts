import {
  ICancelOrderReducer,
  IModifyOrderReducer,
  IPlaceOrderReducer,
} from 'interfaces/reducers';
import { IQueryReducer } from 'interfaces/common';
import {
  ORDER_CANCEL_ORDER,
  ORDER_CANCEL_ORDER_FAILED,
  ORDER_CANCEL_ORDER_SUCCESS,
  ORDER_DERIVATIVES_CANCEL_ORDER,
  ORDER_DERIVATIVES_MODIFY_ORDER,
  ORDER_DERIVATIVES_PLACE_ORDER,
  ORDER_MODIFY_ORDER,
  ORDER_MODIFY_ORDER_FAILED,
  ORDER_MODIFY_ORDER_SUCCESS,
  ORDER_PLACE_ORDER,
  ORDER_PLACE_ORDER_FAILED,
  ORDER_PLACE_ORDER_SUCCESS,
} from 'redux/actions';

export const PlaceOrderResult: IQueryReducer<
  IPlaceOrderReducer | null,
  string
> = (state = { data: null, status: {} }, action) => {
  switch (action.type) {
    case ORDER_PLACE_ORDER:
    case ORDER_DERIVATIVES_PLACE_ORDER:
      return { data: null, status: { isLoading: true } };
    case ORDER_PLACE_ORDER_SUCCESS:
      return {
        data: action.payload as IPlaceOrderReducer,
        status: { isSucceeded: true },
      };
    case ORDER_PLACE_ORDER_FAILED:
      return {
        data: null,
        status: { isFailed: true, errorMessage: action.payload as string },
      };
    default:
      return state;
  }
};

export const ModifyOrderResult: IQueryReducer<
  IModifyOrderReducer | null,
  string
> = (state = { data: null, status: {} }, action) => {
  switch (action.type) {
    case ORDER_MODIFY_ORDER:
    case ORDER_DERIVATIVES_MODIFY_ORDER:
      return { data: null, status: { isLoading: true } };
    case ORDER_MODIFY_ORDER_SUCCESS:
      return {
        data: action.payload as IModifyOrderReducer,
        status: { isSucceeded: true },
      };
    case ORDER_MODIFY_ORDER_FAILED:
      return {
        data: null,
        status: { isFailed: true, errorMessage: action.payload as string },
      };
    default:
      return state;
  }
};

export const CancelOrderResult: IQueryReducer<
  ICancelOrderReducer | null,
  string
> = (state = { data: null, status: {} }, action) => {
  switch (action.type) {
    case ORDER_CANCEL_ORDER:
    case ORDER_DERIVATIVES_CANCEL_ORDER:
      return { data: null, status: { isLoading: true } };
    case ORDER_CANCEL_ORDER_SUCCESS:
      return {
        data: action.payload as ICancelOrderReducer,
        status: { isSucceeded: true },
      };
    case ORDER_CANCEL_ORDER_FAILED:
      return {
        data: action.payload as ICancelOrderReducer,
        status: { isFailed: true, errorMessage: action.payload as string },
      };
    default:
      return state;
  }
};
