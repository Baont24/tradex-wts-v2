import { ACCOUNT_ASSET_INFORMATION_DERIVATIVES } from './actions';
import { COMMON_SHOW_NOTIFICATION } from 'redux/actions';
import { IAction, INotification } from 'interfaces/common';
import {
  IAssetInformationDerivativesParams,
  IEquityAssetInformationResponse,
} from 'interfaces/api';
import { ToastType } from 'react-toastify';
import { call, put, takeLatest } from 'redux-saga/effects';
import { query } from 'utils/socketApi';
import config from 'config';

const getAssetInformationDerivatives = (
  params: IAssetInformationDerivativesParams
) => {
  return query(config.apis.queryDerivativesSummary, params);
};

function* doGetAssetInformationDerivatives(
  request: IAction<IAssetInformationDerivativesParams>
) {
  try {
    let response: { data?: IEquityAssetInformationResponse } | null = null;
    response = yield call(getAssetInformationDerivatives, request.payload);
    yield put({
      type: request.response?.success,
      payload: response?.data,
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
        title: 'Asset information Derivatives',
        content: error.code || error.message,
        contentParams: error.messageParams,
        time: new Date(),
      },
    });
  }
}

export function* watchGetAssetInformationDerivatives() {
  yield takeLatest(
    ACCOUNT_ASSET_INFORMATION_DERIVATIVES,
    doGetAssetInformationDerivatives
  );
}
