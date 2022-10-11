import {
  GLOBAL_SELECT_ACCOUNT,
  MARKET_SET_CURRENT_SYMBOL,
} from 'redux/actions';
import { IAccount, IAction } from 'interfaces/common';
import { ICurrentSymbol } from 'interfaces/market';
import { IState } from 'redux/global-reducers';
import { SymbolType, SystemType } from 'constants/enum';
import { put, select, takeLatest } from 'redux-saga/effects';

function* doChangeAccount(request: IAction<IAccount>) {
  const store: IState = yield select((state: IState) => ({
    currentSymbol: state.currentSymbol,
    futuresList: state.futuresList,
    config: state.config,
  }));

  if (
    request.payload.type === SystemType.DERIVATIVES &&
    store.currentSymbol.symbolType !== SymbolType.FUTURES
  ) {
    const futuresStock = store.futuresList[0];
    if (futuresStock != null) {
      yield put<IAction<ICurrentSymbol>>({
        type: MARKET_SET_CURRENT_SYMBOL,
        payload: {
          code: futuresStock.s,
          symbolType: futuresStock.t,
          forceUpdate: true,
          resetData: true,
        },
      });
    }
  }

  if (
    request.payload.type === SystemType.EQUITY &&
    store.currentSymbol.symbolType === SymbolType.FUTURES
  ) {
    yield put<IAction<ICurrentSymbol>>({
      type: MARKET_SET_CURRENT_SYMBOL,
      payload: {
        code: store.config.defaultSymbol.code,
        forceUpdate: true,
        resetData: true,
      },
    });
  }
}

export default function* watchChangeAccount() {
  yield takeLatest(GLOBAL_SELECT_ACCOUNT, doChangeAccount);
}
