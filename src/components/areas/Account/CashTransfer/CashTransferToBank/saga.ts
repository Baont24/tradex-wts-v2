import { COMMON_SHOW_NOTIFICATION, QUERY_BANK_INFO } from 'redux/actions';
import { Domain, SystemType } from 'constants/enum';
import { IAction, INotification, IResponse } from 'interfaces/common';
import {
  IBankInfoForKisResponse,
  IEquityBankInfoResponse,
  IParamsQueryBankInfo,
} from 'interfaces/api';
import { ToastType } from 'react-toastify';
import { call, put, takeLatest } from 'redux-saga/effects';
import { query } from 'utils/socketApi';
import config from 'config';

const queryEquityBankInfo = (params: IParamsQueryBankInfo) => {
  return query(config.apis.equityBankInfo);
};

const queryEquityOrDerBankInfoForKis = (params: IParamsQueryBankInfo) => {
  const { accountNo, systemType } = params;
  if (systemType === SystemType.DERIVATIVES) {
    return query(config.apis.derivativesBankInfoForKis, {
      accountNo,
    });
  } else {
    return query(config.apis.equityBankInfoForKis, {
      accountNo,
    });
  }
};

function* doEquityBankInfo(request: IAction<IParamsQueryBankInfo>) {
  try {
    if (config.domain === Domain.KIS) {
      const response: IResponse<IBankInfoForKisResponse[]> = yield call(
        queryEquityOrDerBankInfoForKis,
        request.payload
      );
      yield put({
        type: request.response?.success,
        payload: response.data.map((ele) => {
          return {
            bankId: ele.bankAccNo,
            bankName: ele.bankID,
            ...ele,
          };
        }),
      });
    } else {
      const response: IResponse<IEquityBankInfoResponse> = yield call(
        queryEquityBankInfo,
        request.payload
      );
      yield put({
        type: request.response?.success,
        payload: response.data,
      });
    }
  } catch (error) {
    yield put<IAction<INotification>>({
      type: COMMON_SHOW_NOTIFICATION,
      payload: {
        type: ToastType.ERROR,
        title: 'Bank Info',
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

export function* watchEquityBankInfo() {
  yield takeLatest(QUERY_BANK_INFO, doEquityBankInfo);
}
