import { ACCOUNT_REALIZED_PORTFOLIO } from './action';
import { COMMON_SHOW_NOTIFICATION } from 'redux/actions';
import { IAction, INotification } from 'interfaces/common';
import {
  IDrAccountClosePositionItemParams,
  IDrAccountClosePositionItemResponse,
  IEquityAssetInformationResponse,
} from 'interfaces/api';
import { ToastType } from 'react-toastify';
import { call, put, takeLatest } from 'redux-saga/effects';
import { query } from 'utils/socketApi';
import config from 'config';

const getAccountRealizedPortfolio = (
  params: IDrAccountClosePositionItemParams
) => {
  return query(config.apis.equityAccountRealizedPortfolio, params);
};

const queryDerivativesSummary = (params: { readonly accountNo: string }) => {
  return query(config.apis.queryDerivativesSummary, params);
};

function* doGetAccountRealizedPortfolio(
  request: IAction<IDrAccountClosePositionItemParams>
) {
  try {
    let responseRealized: {
      data?: IDrAccountClosePositionItemResponse;
    } | null = null;
    responseRealized = yield call(getAccountRealizedPortfolio, request.payload);

    let responseSummary: {
      data?: IEquityAssetInformationResponse;
    } | null = null;
    responseSummary = yield call(queryDerivativesSummary, request.payload);

    yield put({
      type: request.response?.success,
      payload: {
        closePositionList: responseRealized?.data?.closePositionList,
        accountSummary: responseSummary?.data?.accountSummary,
      },
    });
  } catch (error) {
    if (request.response) {
      yield put({
        type: request.response.failed,
        payload: error.code || error.message,
      });
    }

    yield put<IAction<INotification>>({
      type: COMMON_SHOW_NOTIFICATION,
      payload: {
        type: ToastType.ERROR,
        title: 'Realized Portfolio',
        content: error.code || error.message,
        contentParams: error.messageParams,
        time: new Date(),
      },
    });
  }
}

export function* watchGetAccountRealizedPortfolio() {
  yield takeLatest(ACCOUNT_REALIZED_PORTFOLIO, doGetAccountRealizedPortfolio);
}
