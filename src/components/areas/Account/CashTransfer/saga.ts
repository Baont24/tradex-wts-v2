import {
  CASH_TRANSFER,
  CASH_TRANSFER_SHOW_NOTIFICATION,
  COMMON_SHOW_NOTIFICATION,
  DERIVATIVE_BANK_CASH_TRANSFER,
  DERIVATIVE_INTERNAL_CASH_TRANSFER,
  QUERY_DERIVATIVE_TRANSFERABLE_AMOUNT,
  VSD_CASH_TRANSFER,
} from 'redux/actions';
import { DATE_TIME_FORMAT_INPUT } from 'constants/main';
import { Domain, TransferType } from 'constants/enum';
import { IAction, INotification, IResponse } from 'interfaces/common';
import {
  ICashTransferResult,
  IParamsDoInternalTransfer,
  IParamsQueryBankInfo,
  IServerTimeResponse,
  IVSDCashTransferParams,
  IVSDCashTransferResponse,
  IVSDTransferableAmountResponse,
} from 'interfaces/api';
import { ToastType } from 'react-toastify';
import { call, put, takeLatest } from 'redux-saga/effects';
import { formatStringToDate, formatTimeToUTC } from 'utils/datetime';
import { query } from 'utils/socketApi';
import { roundDown } from 'utils/common';
import config from 'config';

function* checkTransferTime(transferType?: TransferType) {
  let offsetTimeZone = 0;
  let response: IResponse<IServerTimeResponse>;
  if (config.domain === Domain.KIS) {
    response = yield query(config.apis.queryServerTimeForKis);
    offsetTimeZone = 7;
  } else {
    response = yield query(config.apis.queryServerTime);
  }
  const weekDay = +response.data.weekDay;
  const date = new Date(
    formatTimeToUTC(
      formatStringToDate(response.data.datetime, DATE_TIME_FORMAT_INPUT)
    ),
    offsetTimeZone
  );
  const time = date.getTime();

  const [
    transferHourStart,
    transferMinuteStart,
  ] = config.schedules.transferTimeStart;
  const [
    transferHourToSubEnd,
    transferMinuteToSubEnd,
  ] = config.schedules.transferToSubEnd;
  const [
    transferHourToBankEnd,
    transferMinuteToBankEnd,
  ] = config.schedules.transferToBankEnd;

  const timeOpenUTC = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    transferHourStart,
    transferMinuteStart
  );
  const timeCloseBankUTC = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    transferHourToBankEnd,
    transferMinuteToBankEnd
  );
  const timeCloseVSDUTC = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    transferHourToSubEnd,
    transferMinuteToSubEnd
  );

  const timeOpen = new Date(timeOpenUTC);
  const timeCloseBank = new Date(timeCloseBankUTC);
  const timeCloseVSD = new Date(timeCloseVSDUTC);

  const timeOpenText = `${timeOpen.getHours()}:${timeOpen.getMinutes()}`;
  const timeCloseBankText = `${timeCloseBank.getHours()}:${timeCloseBank.getMinutes()}`;
  const timeCloseVSDText = `${timeCloseVSD.getHours()}:${timeCloseVSD.getMinutes()}`;

  if (weekDay === 0) {
    if (transferType === TransferType.TO_BANK) {
      throw new Error(
        `All requests for Cash Transfer are only available from ${timeOpenText} to ${timeCloseBankText}`
      );
    } else if (
      transferType === TransferType.VSD_DEPOSIT ||
      transferType === TransferType.VSD_WITHDRAW
    ) {
      throw new Error(
        `All requests for Cash Transfer are only available from ${timeOpenText} to ${timeCloseVSDText}`
      );
    }
  } else {
    if (transferType === TransferType.TO_BANK) {
      if (time < timeOpenUTC || time > timeCloseBankUTC) {
        throw new Error(
          `All requests for Cash Transfer are only available from ${timeOpenText} to ${timeCloseBankText}`
        );
      }
    } else if (
      transferType === TransferType.VSD_DEPOSIT ||
      transferType === TransferType.VSD_WITHDRAW
    ) {
      if (time < timeOpenUTC || time > timeCloseVSDUTC) {
        throw new Error(
          `All requests for Cash Transfer are only available from ${timeOpenText} to ${timeCloseVSDText}`
        );
      }
    }
  }
}

// Query VSD transferable amount
const queryVSDTransferableAmount = (params: IParamsQueryBankInfo) => {
  return query(config.apis.VSDTransferableAmount, params);
};

function* doQueryVSDTransferableAmount(request: IAction<IParamsQueryBankInfo>) {
  try {
    const response: IResponse<IVSDTransferableAmountResponse> = yield call(
      queryVSDTransferableAmount,
      request.payload
    );

    yield put({
      type: request.response?.success,
      payload: roundDown(
        [
          'transferableAmountToInternalSubsOrToBank',
          'transferableAmountToVSDAccount',
          'transferableAmountOfVSDAccount',
        ],
        response.data
      ),
    });
  } catch (error) {
    yield put<IAction<INotification>>({
      type: COMMON_SHOW_NOTIFICATION,
      payload: {
        type: ToastType.ERROR,
        title: 'Query VSD Transferable Amount',
        content: error.code || error.message,
        contentParams: error.messageParams,
        time: new Date(),
      },
    });
    yield put({
      type: request.response?.failed,
      payload: error.code || error.message,
    });
  }
}

export function* watchDodoQueryVSDTransferableAmount() {
  yield takeLatest(
    QUERY_DERIVATIVE_TRANSFERABLE_AMOUNT,
    doQueryVSDTransferableAmount
  );
}

// Equity Cash Transfer
const cashTransfer = (params: IParamsDoInternalTransfer) => {
  const { otpToken, ...param } = params;
  return query(
    config.apis.equityCashTransferInternal,
    param,
    undefined,
    undefined,
    undefined,
    undefined,
    otpToken
  );
};

function* doCashTransfer(request: IAction<IParamsDoInternalTransfer>) {
  try {
    yield checkTransferTime(request.payload.transferType);

    const response: IResponse<ICashTransferResult> = yield call(
      cashTransfer,
      request.payload
    );

    yield put({
      type: request.response?.success,
      payload: response.data,
    });
    if (response.data.result === 'success') {
      yield put<IAction<INotification>>({
        type: COMMON_SHOW_NOTIFICATION,
        payload: {
          type: ToastType.SUCCESS,
          title: 'Cash Transfer ',
          content: 'Cash Transfer Success',
          time: new Date(),
        },
      });
    } else {
      yield put<IAction<INotification>>({
        type: COMMON_SHOW_NOTIFICATION,
        payload: {
          type: ToastType.SUCCESS,
          title: 'Cash Transfer ',
          content: 'Cash Transfer Failed',
          time: new Date(),
        },
      });
    }
  } catch (error) {
    yield put<IAction<INotification>>({
      type: COMMON_SHOW_NOTIFICATION,
      payload: {
        type: ToastType.ERROR,
        title: 'Cash Transfer',
        content: error.code || error.message,
        contentParams: error.messageParams,
        time: new Date(),
      },
    });
    yield put({
      type: request.response?.failed,
      payload: error.code || error.message,
    });
  }
}

export function* watchDoCashTransfer() {
  yield takeLatest(CASH_TRANSFER, doCashTransfer);
}

// VSD Cash Transfer
const VSDCashTransfer = (params: IVSDCashTransferParams) => {
  return query(config.apis.VSDCashTransfer, params);
};

function* doVSDCashTransfer(request: IAction<IVSDCashTransferParams>) {
  try {
    yield checkTransferTime(request.payload.transferType);

    const response: IResponse<IVSDCashTransferResponse> = yield call(
      VSDCashTransfer,
      request.payload
    );

    yield put({
      type: request.response?.success,
      payload: response.data,
    });
    yield put<IAction<INotification>>({
      type: COMMON_SHOW_NOTIFICATION,
      payload: {
        type: ToastType.SUCCESS,
        title: 'VSD Cash Transfer ',
        content: 'VSD Cash Transfer Success',
        time: new Date(),
      },
    });
  } catch (error) {
    yield put<IAction<INotification>>({
      type: COMMON_SHOW_NOTIFICATION,
      payload: {
        type: ToastType.ERROR,
        title: 'VSD Cash Transfer',
        content: error.code || error.message,
        contentParams: error.messageParams,
        time: new Date(),
      },
    });
    yield put({
      type: request.response?.failed,
      payload: error.code || error.message,
    });
  }
}

export function* watchDoVSDCashTransfer() {
  yield takeLatest(VSD_CASH_TRANSFER, doVSDCashTransfer);
}

// Derivative Internal Cash Transfer
const derivativeInternalCashTransfer = (params: IVSDCashTransferParams) => {
  return query(config.apis.derivativeInternalTransfer, params);
};

function* doDerivativeInternalCashTransfer(
  request: IAction<IVSDCashTransferParams>
) {
  try {
    const response: IResponse<IVSDCashTransferResponse> = yield call(
      derivativeInternalCashTransfer,
      request.payload
    );

    yield put({
      type: request.response?.success,
      payload: response.data,
    });
    yield put<IAction<INotification>>({
      type: COMMON_SHOW_NOTIFICATION,
      payload: {
        type: ToastType.SUCCESS,
        title: 'Derivative Internal Cash Transfer ',
        content: 'Derivative Internal Cash Transfer Success',
        time: new Date(),
      },
    });
  } catch (error) {
    yield put<IAction<INotification>>({
      type: COMMON_SHOW_NOTIFICATION,
      payload: {
        type: ToastType.ERROR,
        title: 'Derivative Internal Cash Transfer',
        content: error.code || error.message,
        contentParams: error.messageParams,
        time: new Date(),
      },
    });
    yield put({
      type: request.response?.failed,
      payload: error.code || error.message,
    });
  }
}

export function* watchDoDerivativeInternalCashTransfer() {
  yield takeLatest(
    DERIVATIVE_INTERNAL_CASH_TRANSFER,
    doDerivativeInternalCashTransfer
  );
}

// Derivative Bank Cash Transfer
const derivativeBankCashTransfer = (params: IVSDCashTransferParams) => {
  const { otpToken, ...param } = params;
  return query(
    config.apis.derivativeBankTransfer,
    param,
    undefined,
    undefined,
    undefined,
    undefined,
    otpToken
  );
};

function* doDerivativeBankCashTransfer(
  request: IAction<IVSDCashTransferParams>
) {
  try {
    yield checkTransferTime(request.payload.transferType);

    const response: IResponse<IVSDCashTransferResponse> = yield call(
      derivativeBankCashTransfer,
      request.payload
    );

    yield put({
      type: request.response?.success,
      payload: response.data,
    });
    yield put<IAction<INotification>>({
      type: COMMON_SHOW_NOTIFICATION,
      payload: {
        type: ToastType.SUCCESS,
        title: 'Derivative Bank Cash Transfer ',
        content: 'Derivative Bank Cash Transfer Success',
        time: new Date(),
      },
    });
  } catch (error) {
    yield put<IAction<INotification>>({
      type: COMMON_SHOW_NOTIFICATION,
      payload: {
        type: ToastType.ERROR,
        title: 'Derivative Bank Cash Transfer',
        content: error.code || error.message,
        contentParams: error.messageParams,
        time: new Date(),
      },
    });
    yield put({
      type: request.response?.failed,
      payload: error.code || error.message,
    });
  }
}

export function* watchDoDerivativeBankCashTransfer() {
  yield takeLatest(DERIVATIVE_BANK_CASH_TRANSFER, doDerivativeBankCashTransfer);
}

// Notification
function* doCashTransferNotification(request: IAction<string>) {
  yield put<IAction<INotification>>({
    type: COMMON_SHOW_NOTIFICATION,
    payload: {
      type: ToastType.INFO,
      title: 'Cash Transfer',
      content: request.payload,
      time: new Date(),
    },
  });
}

export function* watchShowCashTransferNotification() {
  yield takeLatest(CASH_TRANSFER_SHOW_NOTIFICATION, doCashTransferNotification);
}
