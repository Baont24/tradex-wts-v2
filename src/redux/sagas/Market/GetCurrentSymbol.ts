import {
  GLOBAL_SELECT_ACCOUNT,
  MARKET_SET_CURRENT_SYMBOL,
  MARKET_SET_CURRENT_SYMBOL_DATA,
  MARKET_SET_CURRENT_SYMBOL_INFO_DATA,
} from 'redux/actions';
import { IAccount, IAction, IRequest, IResponse } from 'interfaces/common';
import { ICurrentSymbol, INewSymbolData } from 'interfaces/market';
import { IState } from 'redux/global-reducers';
import { SymbolType, SystemType } from 'constants/enum';
import { call, put, select, takeLatest } from 'redux-saga/effects';
import { query } from 'utils/socketApi';
import config from 'config';

const querySymbolData = (params: { readonly symbolList: string[] }) => {
  return query<INewSymbolData[]>(config.apis.symbolInfoLatest, params);
};

function* doGetCurrentSymbolData(request: IRequest<ICurrentSymbol>) {
  const store: IState = yield select((state: IState) => ({
    selectedAccount: state.selectedAccount,
    accountList: state.accountList,
    symbolList: state.symbolList,
  }));

  const symbolData = store.symbolList.map?.[request.payload.code];

  yield put<IAction<INewSymbolData | null>>({
    type: MARKET_SET_CURRENT_SYMBOL_DATA,
    payload: { s: request.payload.code, ...symbolData },
  });

  let payload: ICurrentSymbol = {
    ...request.payload,
    symbolType: symbolData?.t,
    infoData: {
      s: request.payload.code,
      ...symbolData,
      ...request.payload.infoData,
    },
  };

  try {
    if (request.payload.forceUpdate) {
      const response: IResponse<INewSymbolData[]> = yield call(
        querySymbolData,
        { symbolList: [request.payload.code] }
      );
      if (response.data.length > 0) {
        payload = {
          ...request.payload,
          code: response.data[0].s || symbolData?.s || '',
          symbolType: response.data[0].t || symbolData?.t,
          infoData: { ...symbolData, ...response.data[0] },
        };
      } else {
        payload = {
          ...request.payload,
          symbolType: symbolData?.t,
          infoData: { s: request.payload.code, ...symbolData },
        };
      }
    }
  } catch (err) {
    console.error('Get current symbol data', err);
  }

  yield put<IAction<ICurrentSymbol>>({
    type: MARKET_SET_CURRENT_SYMBOL_INFO_DATA,
    payload,
  });

  if (
    symbolData?.t === SymbolType.FUTURES &&
    store.selectedAccount?.type !== SystemType.DERIVATIVES
  ) {
    const account = store.accountList.find(
      (val) => val.type === SystemType.DERIVATIVES
    );
    if (account != null) {
      yield put<IAction<IAccount>>({
        type: GLOBAL_SELECT_ACCOUNT,
        payload: account,
      });
    }
  }

  if (
    symbolData?.t !== SymbolType.FUTURES &&
    store.selectedAccount?.type === SystemType.DERIVATIVES
  ) {
    const account = store.accountList.find(
      (val) => val.type === SystemType.EQUITY
    );
    if (account != null) {
      yield put<IAction<IAccount>>({
        type: GLOBAL_SELECT_ACCOUNT,
        payload: account,
      });
    }
  }
}

export default function* watchGetCurrentSymbolData() {
  yield takeLatest(MARKET_SET_CURRENT_SYMBOL, doGetCurrentSymbolData);
}
