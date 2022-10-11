import { IAction } from 'interfaces/common';
import { IParamsTransferableAmount } from 'interfaces/api';
import {
  QUERY_DERIVATIVE_TRANSFERABLE_AMOUNT,
  QUERY_DERIVATIVE_TRANSFERABLE_AMOUNT_FAILED,
  QUERY_DERIVATIVE_TRANSFERABLE_AMOUNT_SUCCESS,
  QUERY_TRANSFERABLE_AMOUNT,
  QUERY_TRANSFERABLE_AMOUNT_FAILED,
  QUERY_TRANSFERABLE_AMOUNT_SUCCESS,
} from 'redux/actions';

export const queryTransferableAmount = (
  payload: IParamsTransferableAmount
): IAction<IParamsTransferableAmount> => ({
  type: QUERY_TRANSFERABLE_AMOUNT,
  response: {
    success: QUERY_TRANSFERABLE_AMOUNT_SUCCESS,
    failed: QUERY_TRANSFERABLE_AMOUNT_FAILED,
  },
  payload,
});

export const queryDerivativeTransferableAmount = (
  payload: IParamsTransferableAmount
): IAction<IParamsTransferableAmount> => ({
  type: QUERY_DERIVATIVE_TRANSFERABLE_AMOUNT,
  response: {
    success: QUERY_DERIVATIVE_TRANSFERABLE_AMOUNT_SUCCESS,
    failed: QUERY_DERIVATIVE_TRANSFERABLE_AMOUNT_FAILED,
  },
  payload,
});
