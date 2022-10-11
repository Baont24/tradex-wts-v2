import { AUTHENTICATION_LOGOUT, ROUTER_RESET } from 'redux/actions';
import {
  IChannel,
  IParams,
  IRequest,
  ISocket,
  IWindow,
} from 'interfaces/common';
import { IState } from 'redux/global-reducers';
import { call, put, select, takeLeading } from 'redux-saga/effects';
import { deAuthenticate, logout } from 'utils/socketApi';
import { toast } from 'react-toastify';

declare var window: IWindow;

const revokeDomainToken = (wtsSocket: ISocket | null) => {
  return logout(wtsSocket, {});
};

function* doLogout(request: IRequest<IParams>) {
  toast.dismiss();
  const wtsSocket: ISocket | null = yield select(
    (state: IState) => state.wtsSocket
  );

  try {
    yield call(revokeDomainToken, wtsSocket);
  } catch (err) {
    console.error('Logout', err);
  } finally {
    if (wtsSocket?.userChannel) {
      wtsSocket.userChannel.unwatch();
      wtsSocket.userChannel.unsubscribe();
      // eslint-disable-next-line functional/immutable-data
      wtsSocket.userChannel = undefined;
    }

    if (wtsSocket?.domainChannels) {
      wtsSocket.domainChannels.forEach((channel: IChannel) => {
        channel.unwatch();
        channel.unsubscribe();
      });
      // eslint-disable-next-line functional/immutable-data
      wtsSocket.domainChannels = undefined;
    }

    if (wtsSocket != null) {
      yield deAuthenticate(wtsSocket);
    }

    if (request.payload && request.payload.force === true) {
      if (window.OneSignal) {
        window.OneSignal.sendTags({
          userId: null,
          username: null,
          deviceType: 'web',
        });
      }
    }

    yield put({
      type: ROUTER_RESET,
    });
  }
}

export default function* watchLogout() {
  yield takeLeading(AUTHENTICATION_LOGOUT, doLogout);
}
