import {
  ACCOUNT_ORDER_CONFIRMATION,
  ACCOUNT_ORDER_CONFIRMATION_FAILED,
  ACCOUNT_ORDER_CONFIRMATION_LOAD_MORE,
  ACCOUNT_ORDER_CONFIRMATION_SUBMIT,
  ACCOUNT_ORDER_CONFIRMATION_SUBMIT_FAILED,
  ACCOUNT_ORDER_CONFIRMATION_SUBMIT_SUCCESS,
  ACCOUNT_ORDER_CONFIRMATION_SUCCESS,
} from './actions';
import { AUTHENTICATION_LOGOUT } from 'redux/actions';
import { IOrderConfirmationResponse } from 'interfaces/api';
import { IOrderConfirmationSubmitReducer } from 'interfaces/reducers';
import { IQueryReducer } from 'interfaces/common';

export const OrderConfirmation: IQueryReducer<
  IOrderConfirmationResponse[],
  string
> = (state = { data: [], status: {} }, action) => {
  switch (action.type) {
    case ACCOUNT_ORDER_CONFIRMATION:
      return {
        data: [],
        status: {
          isLoading: true,
        },
      };
    case ACCOUNT_ORDER_CONFIRMATION_LOAD_MORE:
      return {
        data: state.data,
        status: {
          isLoading: true,
        },
      };
    case ACCOUNT_ORDER_CONFIRMATION_SUCCESS:
      return {
        data: [
          ...state.data,
          ...(action.payload as IOrderConfirmationResponse[]),
        ],
        status: {
          isSucceeded: true,
          loadMore: (action.payload as IOrderConfirmationResponse[]).length > 0,
        },
      };
    case ACCOUNT_ORDER_CONFIRMATION_FAILED:
      return {
        data: [],
        status: {
          isFailed: true,
          errorMessage: action.payload as string,
        },
      };
    case AUTHENTICATION_LOGOUT:
      return {
        data: [],
        status: {},
      };
    default:
      return state;
  }
};

export const OrderConfirmationSubmit: IQueryReducer<
  IOrderConfirmationSubmitReducer | null,
  string
> = (state = { data: null, status: {} }, action) => {
  switch (action.type) {
    case ACCOUNT_ORDER_CONFIRMATION_SUBMIT:
      return {
        data: null,
        status: {
          isLoading: true,
        },
      };
    case ACCOUNT_ORDER_CONFIRMATION_SUBMIT_SUCCESS:
      return {
        data: action.payload as IOrderConfirmationSubmitReducer,
        status: {
          isSucceeded: true,
        },
      };
    case ACCOUNT_ORDER_CONFIRMATION_SUBMIT_FAILED:
      return {
        data: null,
        status: {
          isFailed: true,
          errorMessage: action.payload as string,
        },
      };
    case AUTHENTICATION_LOGOUT:
      return {
        data: null,
        status: {},
      };
    default:
      return state;
  }
};
