import 'whatwg-fetch';
import * as _ from 'lodash';
import * as publicIp from 'react-public-ip';
import * as socketCluster from 'socketcluster-client';
import {
  AUTHENTICATION_STATE_CHANGE,
  GLOBAL_CONFIG,
  GLOBAL_PRICE_BOARD_SOCKET,
  GLOBAL_WTS_SOCKET,
  LOCALIZATION_INIT_I18N,
  MARKET_INIT,
  MARKET_STATUS_INIT,
  SOCKET_AUTHENTICATED,
  SOCKET_INIT_SOCKET,
  SOCKET_STATUS_CHANGE,
  SOCKET_UNAUTHENTICATED,
  SOCKET_WTS_STATUS_CHANGE,
} from 'redux/actions';
import { Global } from 'constants/main';
import { IAction, IError, ILocale, ISelf, ISocket } from 'interfaces/common';
import { IConfig } from 'interfaces/config';
import { SocketAuthState, SocketStatus, WS } from 'constants/enum';
import { setBaseUri } from 'utils/socketApi';
import { takeLatest } from 'redux-saga/effects';
import config, { env, htsEnv, loadConfig, loadWsConfig } from 'config';
import store from 'redux/store';

declare var self: ISelf;

self.init = true;

let priceBoardSocket: ISocket;
let wtsSocket: ISocket;
let mobileServerSocket: ISocket;

const onLoggedIn = () => {
  console.log('Logged in');

  store.dispatch<IAction<ISocket>>({
    type: SOCKET_AUTHENTICATED,
    payload: wtsSocket,
  });
};

const onLoggedOut = (timeout?: boolean) => {
  console.log('Logged out');

  store.dispatch<
    IAction<{ readonly socket: ISocket; readonly isSessionTimeout?: boolean }>
  >({
    type: SOCKET_UNAUTHENTICATED,
    payload: { socket: wtsSocket, isSessionTimeout: timeout },
  });
};

let startInteruptingTime: number | null = null;

const connect = async () => {
  try {
    self.sourceIp = '';

    publicIp
      .v4()
      .then((result: string) => {
        self.sourceIp = result;
        console.log(result);
      })
      .catch((e: Error) => {
        console.error(e);
      });

    const systemConfig = loadConfig(env, htsEnv);
    loadWsConfig(config);
    document.body.classList.add(systemConfig.domain);

    Global.config = systemConfig;

    self.domain = systemConfig.domain;

    setBaseUri(systemConfig.apiUrl.baseURI);

    store.dispatch<IAction<IConfig>>({
      type: GLOBAL_CONFIG,
      payload: systemConfig,
    });

    priceBoardSocket = socketCluster.create(
      systemConfig.apiUrl.sockets[WS.PRICE_BOARD]
    );
    Global.sockets[WS.PRICE_BOARD] = priceBoardSocket;
    priceBoardSocket.on('error', (err: IError) => {
      console.error('Socket error:', err.code, err.message);

      store.dispatch<IAction<SocketStatus>>({
        type: SOCKET_STATUS_CHANGE,
        payload: SocketStatus.CONNECTING,
      });
    });

    priceBoardSocket.on('connect', () => {
      console.log('Connected');
      if (startInteruptingTime != null) {
        if (new Date().getTime() - startInteruptingTime >= 300000) {
          if (window.location.pathname.includes('/board')) {
            console.log('detect disconnect for long time. will refresh');
            window.location.reload();
          }
        }
        startInteruptingTime = null;
      }
      store.dispatch<IAction<ISocket>>({
        type: GLOBAL_PRICE_BOARD_SOCKET,
        payload: priceBoardSocket,
      });

      store.dispatch({
        type: MARKET_INIT,
      });

      if (self.init) {
        store.dispatch<IAction<ILocale[] | undefined>>({
          type: LOCALIZATION_INIT_I18N,
          payload: env.languages,
        });
        self.init = false;
      }

      store.dispatch({
        type: MARKET_STATUS_INIT,
      });

      store.dispatch<IAction<SocketStatus>>({
        type: SOCKET_STATUS_CHANGE,
        payload: SocketStatus.CONNECTED,
      });
    });

    priceBoardSocket.on('close', () => {
      console.warn('Disconnected');
      if (startInteruptingTime == null) {
        startInteruptingTime = new Date().getTime();
      }
      priceBoardSocket.connect();
      store.dispatch<IAction<SocketStatus>>({
        type: SOCKET_STATUS_CHANGE,
        payload: SocketStatus.DISCONNECTED,
      });
    });

    if (systemConfig.apiUrl.sockets[WS.WTS] != null) {
      wtsSocket = socketCluster.create(systemConfig.apiUrl.sockets[WS.WTS]);

      Global.sockets[WS.WTS] = wtsSocket;
      wtsSocket.on('error', (err: any) => {
        console.error('Socket error:', err.code, err.message);

        store.dispatch<IAction<SocketStatus>>({
          type: SOCKET_WTS_STATUS_CHANGE,
          payload: SocketStatus.CONNECTING,
        });
      });

      wtsSocket.on('connect', () => {
        store.dispatch<IAction<ISocket>>({
          type: GLOBAL_WTS_SOCKET,
          payload: wtsSocket,
        });

        if (wtsSocket.authState === SocketAuthState.AUTHENTICATED) {
          onLoggedIn();
        }

        store.dispatch<IAction<SocketStatus>>({
          type: SOCKET_WTS_STATUS_CHANGE,
          payload: SocketStatus.CONNECTED,
        });
      });

      wtsSocket.on('close', () => {
        console.warn('wts disconnected');
        store.dispatch<IAction<SocketStatus>>({
          type: SOCKET_WTS_STATUS_CHANGE,
          payload: SocketStatus.DISCONNECTED,
        });
      });

      wtsSocket.on('connecting', () => {
        console.warn('Connecting to socket...');

        store.dispatch<IAction<ISocket>>({
          type: GLOBAL_WTS_SOCKET,
          payload: wtsSocket,
        });

        store.dispatch<IAction<SocketStatus>>({
          type: SOCKET_WTS_STATUS_CHANGE,
          payload: SocketStatus.CONNECTING,
        });
      });

      wtsSocket.on('loggedIn', () => {
        onLoggedIn();
      });

      wtsSocket.on(
        'authStateChange',
        ({
          oldState,
          newState,
        }: {
          readonly oldState: SocketAuthState;
          readonly newState: SocketAuthState;
        }) => {
          console.log('authStateChange', oldState, newState);
          store.dispatch({
            type: AUTHENTICATION_STATE_CHANGE,
            payload: newState === SocketAuthState.AUTHENTICATED,
          });
          if (
            oldState === SocketAuthState.AUTHENTICATED &&
            newState === SocketAuthState.UNAUTHENTICATED
          ) {
            if (store.getState().logoutDomainInfo.force) {
              onLoggedOut();
            } else {
              onLoggedOut(true);
            }
          }
        }
      );
    }

    if (systemConfig.apiUrl.sockets[WS.MOBILE_SERVER] != null) {
      mobileServerSocket = socketCluster.create(
        systemConfig.apiUrl.sockets[WS.MOBILE_SERVER]
      );
      Global.sockets[WS.MOBILE_SERVER] = mobileServerSocket;
      mobileServerSocket.on('connect', () => {
        console.log(`mobileServerSocket`, mobileServerSocket);
      });
    }
  } catch (error) {
    console.error('Init socket', error);
    if (self.init) {
      store.dispatch<IAction<ILocale[] | undefined>>({
        type: LOCALIZATION_INIT_I18N,
        payload: env.languages,
      });
      self.init = false;
    }
  }
};

function* doInitSocket() {
  yield connect();
}

export default function* watchInitSocket() {
  yield takeLatest(SOCKET_INIT_SOCKET, doInitSocket);
}
