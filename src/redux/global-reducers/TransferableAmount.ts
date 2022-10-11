import { IAction } from 'interfaces/common';
import {
  IEquityTransferableAmountResponse,
  IVSDTransferableAmountResponse,
} from 'interfaces/api';
import {
  QUERY_DERIVATIVE_TRANSFERABLE_AMOUNT_FAILED,
  QUERY_DERIVATIVE_TRANSFERABLE_AMOUNT_SUCCESS,
  QUERY_TRANSFERABLE_AMOUNT_FAILED,
  QUERY_TRANSFERABLE_AMOUNT_SUCCESS,
} from 'redux/actions';

export const EquityTransferableAmount = (
  state: { readonly data?: IEquityTransferableAmountResponse } = {},
  action: IAction<IEquityTransferableAmountResponse>
) => {
  switch (action.type) {
    case QUERY_TRANSFERABLE_AMOUNT_SUCCESS:
      return { data: action.payload };
    case QUERY_TRANSFERABLE_AMOUNT_FAILED:
      return {};
    default:
      return state;
  }
};

export const DerivativeTransferableAmount = (
  state: { readonly data?: IVSDTransferableAmountResponse } = {},
  action: IAction<IVSDTransferableAmountResponse>
) => {
  switch (action.type) {
    case QUERY_DERIVATIVE_TRANSFERABLE_AMOUNT_SUCCESS:
      return { data: action.payload };
    case QUERY_DERIVATIVE_TRANSFERABLE_AMOUNT_FAILED:
      return {};
    default:
      return state;
  }
};
