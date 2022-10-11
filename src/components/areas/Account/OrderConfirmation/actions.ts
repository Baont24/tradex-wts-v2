import { IAction } from 'interfaces/common';
import {
  IOrderConfirmationAction,
  IOrderConfirmationSubmitAction,
} from 'interfaces/actions';

export const ACCOUNT_ORDER_CONFIRMATION = 'account/ORDER_CONFIRMATION';
export const ACCOUNT_ORDER_CONFIRMATION_LOAD_MORE =
  'account/ORDER_CONFIRMATION_LOAD_MORE';
export const ACCOUNT_ORDER_CONFIRMATION_SUCCESS =
  'account/ORDER_CONFIRMATION_SUCCESS';
export const ACCOUNT_ORDER_CONFIRMATION_FAILED =
  'account/ORDER_CONFIRMATION_FAILED';

export const ACCOUNT_ORDER_CONFIRMATION_SUBMIT =
  'account/ORDER_CONFIRMATION_SUBMIT';
export const ACCOUNT_ORDER_CONFIRMATION_SUBMIT_SUCCESS =
  'account/ORDER_CONFIRMATION_SUBMIT_SUCCESS';
export const ACCOUNT_ORDER_CONFIRMATION_SUBMIT_FAILED =
  'account/ORDER_CONFIRMATION_SUBMIT_FAILED';

export const queryOrderConfirmation = (
  payload: IOrderConfirmationAction
): IAction<IOrderConfirmationAction> => ({
  type:
    payload.offset != null && payload.offset > 0
      ? ACCOUNT_ORDER_CONFIRMATION_LOAD_MORE
      : ACCOUNT_ORDER_CONFIRMATION,
  payload,
  response: {
    success: ACCOUNT_ORDER_CONFIRMATION_SUCCESS,
    failed: ACCOUNT_ORDER_CONFIRMATION_FAILED,
  },
});

export const queryOrderConfirmationSubmit = (
  payload: IOrderConfirmationSubmitAction
): IAction<IOrderConfirmationSubmitAction> => ({
  type: ACCOUNT_ORDER_CONFIRMATION_SUBMIT,
  payload,
  response: {
    success: ACCOUNT_ORDER_CONFIRMATION_SUBMIT_SUCCESS,
    failed: ACCOUNT_ORDER_CONFIRMATION_SUBMIT_FAILED,
  },
});
