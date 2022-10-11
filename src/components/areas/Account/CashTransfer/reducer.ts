import {
  CASH_TRANSFER,
  CASH_TRANSFER_FAILED,
  CASH_TRANSFER_SUCCESS,
  DERIVATIVE_BANK_CASH_TRANSFER,
  DERIVATIVE_BANK_CASH_TRANSFER_FAILED,
  DERIVATIVE_BANK_CASH_TRANSFER_SUCCESS,
  DERIVATIVE_INTERNAL_CASH_TRANSFER,
  DERIVATIVE_INTERNAL_CASH_TRANSFER_FAILED,
  DERIVATIVE_INTERNAL_CASH_TRANSFER_SUCCESS,
  VSD_CASH_TRANSFER,
  VSD_CASH_TRANSFER_FAILED,
  VSD_CASH_TRANSFER_SUCCESS,
} from 'redux/actions';
import { IAction, IQueryReducer } from 'interfaces/common';
import {
  ICashTransferResult,
  IDerivativeTransferResult,
  IVSDCashTransferResult,
} from 'interfaces/api';

export const CashTransferResult: IQueryReducer<ICashTransferResult | null> = (
  state = { data: null, status: {} },
  action: IAction<ICashTransferResult>
) => {
  switch (action.type) {
    case CASH_TRANSFER:
      return { data: null, status: { isLoading: true } };
    case CASH_TRANSFER_SUCCESS:
      return { data: action.payload, status: { isSucceeded: true } };
    case CASH_TRANSFER_FAILED:
      return { data: null, status: { isFailed: true } };
    default:
      return state;
  }
};

export const VSDCashTransferResult: IQueryReducer<IVSDCashTransferResult | null> = (
  state = { data: null, status: {} },
  action: IAction<IVSDCashTransferResult>
) => {
  switch (action.type) {
    case VSD_CASH_TRANSFER:
      return { data: null, status: { isLoading: true } };
    case VSD_CASH_TRANSFER_SUCCESS:
      return { data: action.payload, status: { isSucceeded: true } };
    case VSD_CASH_TRANSFER_FAILED:
      return { data: null, status: { isFailed: true } };
    default:
      return state;
  }
};

export const DerivativeInternalCashTransferResult: IQueryReducer<IDerivativeTransferResult | null> = (
  state = { data: null, status: {} },
  action: IAction<IDerivativeTransferResult>
) => {
  switch (action.type) {
    case DERIVATIVE_INTERNAL_CASH_TRANSFER:
      return { data: null, status: { isLoading: true } };
    case DERIVATIVE_INTERNAL_CASH_TRANSFER_SUCCESS:
      return { data: action.payload, status: { isSucceeded: true } };
    case DERIVATIVE_INTERNAL_CASH_TRANSFER_FAILED:
      return { data: null, status: { isFailed: true } };
    default:
      return state;
  }
};

export const DerivativeBankCashTransferResult: IQueryReducer<IDerivativeTransferResult | null> = (
  state = { data: null, status: {} },
  action: IAction<IDerivativeTransferResult>
) => {
  switch (action.type) {
    case DERIVATIVE_BANK_CASH_TRANSFER:
      return { data: null, status: { isLoading: true } };
    case DERIVATIVE_BANK_CASH_TRANSFER_SUCCESS:
      return { data: action.payload, status: { isSucceeded: true } };
    case DERIVATIVE_BANK_CASH_TRANSFER_FAILED:
      return { data: null, status: { isFailed: true } };
    default:
      return state;
  }
};
