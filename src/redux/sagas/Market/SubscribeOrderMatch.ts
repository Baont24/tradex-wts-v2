import { Global } from 'constants/main';
import { IAction, IChannel } from 'interfaces/common';
import { IDerivativesOrderBookResponse } from 'interfaces/api';
import { IOrderBookReducer } from 'interfaces/reducers';
import { IState } from 'redux/global-reducers';
import {
  MARKET_ORDER_MATCH_SUBSCRIBE_DATA,
  SUBSCRIBE_ORDER_MATCH,
  UNSUBSCRIBE_ORDER_MATCH,
} from 'redux/actions';
import { WS } from 'constants/enum';
import { mapOrderBookData } from 'utils/map';
import { select, takeEvery } from 'redux-saga/effects';
import store from 'redux/store';

let socket: IChannel | undefined;
let subscribeCount: number = 0;

function* doSubscribeOrderMatch() {
  const state: IState = yield select((s: IState) => ({
    selectedAccount: s.selectedAccount,
  }));

  if (state.selectedAccount == null) {
    throw Error('No Account Selected');
  }

  if (subscribeCount === 0 && socket != null) {
    socket.unsubscribe();
    socket.unwatch();
  }

  subscribeCount += 1;

  socket = Global.sockets[WS.WTS]?.subscribe(
    `orderMatch.${state.selectedAccount.username}`,
    {
      batch: true,
    }
  );

  socket?.watch((res) => {
    const payload = mapOrderBookData(res as IDerivativesOrderBookResponse);
    if (
      store.getState().selectedAccount?.accountNumber === payload.accountNumber
    ) {
      store.dispatch<IAction<IOrderBookReducer>>({
        type: MARKET_ORDER_MATCH_SUBSCRIBE_DATA,
        payload,
      });
    }
  });
}

function* doUnsubscribeOrderMatch() {
  subscribeCount -= 1;
  if (subscribeCount === 0) {
    socket?.unsubscribe();
    socket?.unwatch();
  }
}

export default function* watchSubscribeOrderMatch() {
  yield takeEvery(SUBSCRIBE_ORDER_MATCH, doSubscribeOrderMatch);
  yield takeEvery(UNSUBSCRIBE_ORDER_MATCH, doUnsubscribeOrderMatch);
}
