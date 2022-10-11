import { GLOBAL_SYMBOL_INFO_MODAL } from 'redux/actions';
import { IRequest } from 'interfaces/common';
import { ISymbolInfoModal } from 'interfaces/actions';
import { put, takeLatest } from 'redux-saga/effects';
import { setCurrentSymbol } from 'redux/global-actions';

function* doToggleSymbolInfoModal(request: IRequest<ISymbolInfoModal>) {
  if (request.payload.show && request.payload.symbol) {
    yield put(setCurrentSymbol(request.payload.symbol));
  }
}

export default function* watchToggleSymbolInfoModal() {
  yield takeLatest(GLOBAL_SYMBOL_INFO_MODAL, doToggleSymbolInfoModal);
}
