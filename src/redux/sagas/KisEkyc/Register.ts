import { COMMON_SHOW_NOTIFICATION } from 'redux/actions';
import { IEkycParams } from 'interfaces/ekyc';
import { IRequest } from 'interfaces/common';
import { ToastType as NOTIFICATION_TYPE } from 'react-toastify';
import { REGISTER_EKYC } from 'screens/KisEkyc/action';
import { call, put, takeLatest } from 'redux-saga/effects';
import { query } from 'utils/socketApi';
import config from 'config';

const registerEkyc = (params: IEkycParams) => {
  return query(config.apis.ekycAdminEkyc, params);
};

function* doRegisterEkyc(request: IRequest<IEkycParams>) {
  console.log('registering');
  try {
    yield call(registerEkyc, request.payload);
    yield put({
      type: request.response.success,
    });
  } catch (error) {
    yield put({
      type: request.response.failed,
    });
    yield put({
      type: COMMON_SHOW_NOTIFICATION,
      payload: {
        type: NOTIFICATION_TYPE.ERROR,
        title: 'Register Ekyc',
        content: error.code ? error.code : error.message,
        time: new Date(),
      },
    });
  }
}

export default function* watchRegisterEkyc() {
  yield takeLatest(REGISTER_EKYC, doRegisterEkyc);
}
