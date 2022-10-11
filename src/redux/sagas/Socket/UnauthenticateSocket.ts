import {
  AUTHENTICATION_LOGOUT,
  AUTHENTICATION_LOGOUT_SESSION_TIMEOUT,
  GLOBAL_ACCOUNT_LIST,
  GLOBAL_DOMAIN_USERINFO,
  GLOBAL_USERINFO,
  GLOBAL_WTS_SOCKET,
  ROUTER_RESET,
  SOCKET_UNAUTHENTICATED,
} from 'redux/actions';
import { IAction, IRequest, ISocket } from 'interfaces/common';
import { IQueryLogout } from 'interfaces/actions';
import { put, takeLatest } from 'redux-saga/effects';

export function* doUnauthenticateSocket(
  request: IRequest<{
    readonly socket: ISocket;
    readonly isSessionTimeout?: boolean;
  }>
) {
  try {
    yield put({
      type: GLOBAL_USERINFO,
      payload: null,
    });

    yield put({
      type: GLOBAL_DOMAIN_USERINFO,
      payload: null,
    });

    yield put({
      type: GLOBAL_WTS_SOCKET,
      payload: request.payload.socket,
    });

    yield put({
      type: GLOBAL_ACCOUNT_LIST,
      payload: [],
    });

    yield put({
      type: ROUTER_RESET,
    });

    if (request.payload.isSessionTimeout) {
      yield put<IAction<IQueryLogout>>({
        type: AUTHENTICATION_LOGOUT_SESSION_TIMEOUT,
        payload: {
          isSessionTimeout: true,
        },
      });
    } else {
      yield put<IAction<IQueryLogout>>({
        type: AUTHENTICATION_LOGOUT,
        payload: {},
      });
    }
  } catch (error) {
    console.error('Unauthenticate Socket', error);
  }
}

export default function* watchUnauthenticateSocket() {
  yield takeLatest(SOCKET_UNAUTHENTICATED, doUnauthenticateSocket);
}
