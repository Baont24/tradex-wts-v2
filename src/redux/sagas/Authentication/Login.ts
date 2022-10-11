import {
  ACCOUNT_OTP_GET_TYPE,
  ACCOUNT_OTP_RESET,
  ACCOUNT_OTP_SHOW_MODAL,
  AUTHENTICATION_LOGIN_DOMAIN,
  LOCALIZATION_CHANGE_LANGUAGE,
  ROUTER_RESET,
  WATCHLIST_SERVER_GET_LIST,
} from 'redux/actions';
import {
  IAction,
  IRememberUsername,
  IRequest,
  ISocket,
} from 'interfaces/common';
import { IConfig } from 'interfaces/config';
import { ILoginDomainInfo } from 'interfaces/reducers';
import { IParamsLogin } from 'interfaces/api';
import { IQueryLogin } from 'interfaces/actions';
import { IState } from 'redux/global-reducers';
import { call, put, select, takeLeading } from 'redux-saga/effects';
import { detectPlatform } from 'utils/detectPlatform';
import { loadClientData, login } from 'utils/socketApi';
import { setKey } from 'utils/localStorage';
import i18n from 'i18next';
import store from 'redux/store';

const loginDomain = async (
  param: IQueryLogin,
  wtsSocket: ISocket | null,
  cfg: IConfig
) => {
  const clientData = await loadClientData(wtsSocket, cfg.serviceName);
  const params: IParamsLogin = {
    grant_type: cfg.domainGrantType,
    client_id: clientData.data.clientId,
    client_secret: clientData.data.clientSecret,
    username: param.username,
    password: param.password,
    session_time_in_minute: param.session_time_in_minute,
    platform: detectPlatform(),
  };
  return login(wtsSocket, params);
};

let isLoginDomain = false;

function* doLoginDomain(request: IRequest<IQueryLogin>) {
  if (isLoginDomain) {
    return;
  }

  const st: IState = yield select((state: IState) => ({
    wtsSocket: state.wtsSocket,
    config: state.config,
    otpToken: state.otpToken,
  }));
  const wtsSocket = st.wtsSocket;
  const cfg = st.config;

  if (wtsSocket?.state === 'open') {
    try {
      isLoginDomain = true;
      const response = yield call(loginDomain, request.payload, wtsSocket, cfg);

      if (request.payload.rememberUsername === true) {
        if (request.payload.username) {
          setKey<IRememberUsername>('rememberUsername', {
            isStored: true,
            username: request.payload.username as string,
          });
        }
      } else {
        setKey<IRememberUsername>('rememberUsername', {
          isStored: false,
          username: '',
        });
      }

      if (cfg.domainGrantType === 'password_otp') {
        if (
          response.data.userLevel === 'CUSTOMER' ||
          response.data.userLevel === 'BROKER'
        ) {
          yield put<IAction<ILoginDomainInfo>>({
            type: request.response.success,
            payload: {
              showOTP: true,
              otpIndex: response.data.otpIndex,
              registerMobileOtp: response.data.registerMobileOtp,
            },
          });
        }
      }

      if (response.data.accessToken && response.data.refreshToken) {
        yield put<IAction<ILoginDomainInfo>>({
          type: request.response.success,
          payload: {
            showOTP: false,
          },
        });
      }

      yield put({
        type: WATCHLIST_SERVER_GET_LIST,
      });

      yield put({
        type: ACCOUNT_OTP_GET_TYPE,
      });

      if (st.otpToken != null) {
        yield put({
          type: ACCOUNT_OTP_RESET,
        });
      }

      yield put({
        type: ACCOUNT_OTP_SHOW_MODAL,
      });

      yield put({
        type: ROUTER_RESET,
      });

      yield put({
        type: LOCALIZATION_CHANGE_LANGUAGE,
        data: request.payload.lang,
      });

      isLoginDomain = false;
    } catch (error) {
      console.error('login error', error);
      isLoginDomain = false;
      if (error.code != null || error.name === 'TimeoutError') {
        yield put({
          type: request.response.failed,
          payload: {
            message: error.message,
          },
        });
      } else {
        yield put({
          type: request.response.failed,
          payload: {
            message: i18n.t('TIMEOUT_ERROR'),
          },
        });
      }

      console.error('Login', error.code, error.message);
    }
  } else {
    setTimeout(() => {
      store.dispatch<IAction<IQueryLogin>>({
        type: request.type,
        payload: request.payload,
        response: request.response,
      });
    }, 500);
  }
}

export default function* watchLoginDomain() {
  yield takeLeading(AUTHENTICATION_LOGIN_DOMAIN, doLoginDomain);
}
