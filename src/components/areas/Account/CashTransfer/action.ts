import {
  CASH_TRANSFER,
  CASH_TRANSFER_FAILED,
  CASH_TRANSFER_SHOW_NOTIFICATION,
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
import { IAction } from 'interfaces/common';
import {
  IDerCashTransferParams,
  IParamsDoInternalTransfer,
  IVSDCashTransferParams,
} from 'interfaces/api';

export const doCashTransfer = (
  payload: IParamsDoInternalTransfer
): IAction<IParamsDoInternalTransfer> => ({
  type: CASH_TRANSFER,
  response: {
    success: CASH_TRANSFER_SUCCESS,
    failed: CASH_TRANSFER_FAILED,
  },
  payload,
});

export const doVSDCashTransfer = (
  payload: IVSDCashTransferParams
): IAction<IVSDCashTransferParams> => ({
  type: VSD_CASH_TRANSFER,
  response: {
    success: VSD_CASH_TRANSFER_SUCCESS,
    failed: VSD_CASH_TRANSFER_FAILED,
  },
  payload,
});

export const doDerivativeInternalCashTransfer = (
  payload: IDerCashTransferParams
): IAction<IDerCashTransferParams> => ({
  type: DERIVATIVE_INTERNAL_CASH_TRANSFER,
  response: {
    success: DERIVATIVE_INTERNAL_CASH_TRANSFER_SUCCESS,
    failed: DERIVATIVE_INTERNAL_CASH_TRANSFER_FAILED,
  },
  payload,
});

export const doDerivativeBankCashTransfer = (
  payload: IParamsDoInternalTransfer
): IAction<IParamsDoInternalTransfer> => ({
  type: DERIVATIVE_BANK_CASH_TRANSFER,
  response: {
    success: DERIVATIVE_BANK_CASH_TRANSFER_SUCCESS,
    failed: DERIVATIVE_BANK_CASH_TRANSFER_FAILED,
  },
  payload,
});

export const showNotification = (payload: string): IAction<string> => ({
  type: CASH_TRANSFER_SHOW_NOTIFICATION,
  payload,
});
