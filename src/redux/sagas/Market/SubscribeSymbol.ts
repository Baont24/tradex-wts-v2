import { Global } from 'constants/main';
import { IAction, ISubscribeChannel } from 'interfaces/common';
import { IMatchingDataRecord } from 'interfaces/apiTTL';
import {
  INewSubscribeSymbol,
  INewSymbolData,
  ISymbolList,
  ISymbolQuote,
} from 'interfaces/market';
import { IState } from 'redux/global-reducers';
import {
  MARKET_INDEX_SUBSCRIBE_DATA,
  MARKET_SYMBOL_MOBILE_SERVER_SUBSCRIBE_DATA,
  MARKET_SYMBOL_ODDLOT_SUBSCRIBE_DATA,
  MARKET_SYMBOL_SUBSCRIBE_DATA,
  SUBSCRIBE_SYMBOL,
  SUBSCRIBE_SYMBOL_MOBILE_SERVER,
} from 'redux/actions';
import { RealtimeChannelDataType, SymbolType, WS } from 'constants/enum';
import { formatTimeToDisplay } from 'utils/datetime';
import { mapMatchingDataToQuote } from 'utils/map';
import { select, takeEvery } from 'redux-saga/effects';
import store from 'redux/store';

const subscribeSymbol = (
  data: INewSubscribeSymbol,
  symbolList: ISymbolList
) => {
  if (data && data.symbolList) {
    const socket = Global.sockets[WS.PRICE_BOARD];
    const localLog: Record<string, string> = {};
    if (socket != null) {
      data.symbolList.forEach((element) => {
        if (element != null) {
          if (data.types.includes(RealtimeChannelDataType.QUOTE)) {
            let mutableSubscribeData: ISubscribeChannel =
              Global.quoteChannels[element.s];
            if (mutableSubscribeData == null) {
              const channelName = `market.quote.${element.s}`;
              mutableSubscribeData = {
                code: element.s,
                symbolType: element.t,
                channel: socket.subscribe(channelName, { batch: true }),
                channelType: RealtimeChannelDataType.QUOTE,
                count: 1,
              };
              Global.quoteChannels[element.s] = mutableSubscribeData;
              mutableSubscribeData.channel?.watch<INewSymbolData>((res) => {
                receiveData(
                  symbolList,
                  RealtimeChannelDataType.QUOTE,
                  mutableSubscribeData,
                  res,
                  data.symbolType,
                  data.isOddlot
                );
              });
            } else {
              mutableSubscribeData.count += 1;
            }
            if (data.cbKey != null && data.cb != null) {
              if (mutableSubscribeData.callbacks == null) {
                mutableSubscribeData.callbacks = { [data.cbKey]: data.cb };
              } else {
                mutableSubscribeData.callbacks[data.cbKey] = data.cb;
              }
            }
          }

          if (data.types.includes(RealtimeChannelDataType.BID_OFFER)) {
            let mutableSubscribeData: ISubscribeChannel =
              Global.bidOfferChannels[element.s];
            if (mutableSubscribeData == null) {
              const channelName = data.isOddlot
                ? `market.bidofferOddLot.${element.s}`
                : `market.bidoffer.${element.s}`;

              mutableSubscribeData = {
                code: element.s,
                symbolType: element.t,
                channel: socket.subscribe(channelName, { batch: true }),
                channelType: RealtimeChannelDataType.BID_OFFER,
                count: 1,
              };
              Global.bidOfferChannels[element.s] = mutableSubscribeData;
              mutableSubscribeData.channel?.watch<INewSymbolData>((res) => {
                receiveData(
                  symbolList,
                  RealtimeChannelDataType.BID_OFFER,
                  mutableSubscribeData,
                  res,
                  data.symbolType,
                  data.isOddlot
                );
              });
            } else {
              mutableSubscribeData.count += 1;
            }
            if (data.cbKey != null && data.cb != null) {
              if (mutableSubscribeData.callbacks == null) {
                mutableSubscribeData.callbacks = { [data.cbKey]: data.cb };
              } else {
                mutableSubscribeData.callbacks[data.cbKey] = data.cb;
              }
            }
          }

          if (data.types.includes(RealtimeChannelDataType.EXTRA)) {
            let mutableSubscribeData: ISubscribeChannel =
              Global.extraChannels[element.s];
            if (mutableSubscribeData == null) {
              const channelName = `market.extra.${element.s}`;

              mutableSubscribeData = {
                code: element.s,
                symbolType: element.t,
                channel: socket.subscribe(channelName, { batch: true }),
                channelType: RealtimeChannelDataType.EXTRA,
                count: 1,
              };
              Global.extraChannels[element.s] = mutableSubscribeData;
              mutableSubscribeData.channel?.watch<INewSymbolData>((res) => {
                receiveData(
                  symbolList,
                  RealtimeChannelDataType.EXTRA,
                  mutableSubscribeData,
                  res,
                  data.symbolType,
                  data.isOddlot
                );
              });
            } else {
              mutableSubscribeData.count += 1;
            }
            if (data.cbKey != null && data.cb != null) {
              if (mutableSubscribeData.callbacks == null) {
                mutableSubscribeData.callbacks = { [data.cbKey]: data.cb };
              } else {
                mutableSubscribeData.callbacks[data.cbKey] = data.cb;
              }
            }
          }

          if (localLog[element.s] == null) {
            localLog[element.s] = `${
              Global.quoteChannels[element.s]?.count || 0
            } ${Global.bidOfferChannels[element.s]?.count || 0} ${
              Global.extraChannels[element.s]?.count || 0
            }`;
          } else {
            localLog[element.s] = `${
              Global.quoteChannels[element.s]?.count || 0
            } ${Global.bidOfferChannels[element.s]?.count || 0} ${
              Global.extraChannels[element.s]?.count || 0
            } Duplicated`;
          }
        }
      });
      console.groupCollapsed('Subscribe Symbols');
      console.log(localLog);
      console.groupEnd();
    }
  }
};

const receiveData = (
  symbolList: ISymbolList,
  channelType: RealtimeChannelDataType,
  subscribeData: ISubscribeChannel,
  symbolData?: INewSymbolData,
  type?: SymbolType,
  isOddlot?: boolean
) => {
  if (symbolData == null) {
    return;
  }

  if (store.getState().isDebugging) {
    console.log(channelType, JSON.stringify(symbolData));
  }

  const time = formatTimeToDisplay(
    symbolData?.ti,
    'HHmmss',
    'yyyyMMddHHmmss',
    true
  );

  const current: INewSymbolData = {
    ...symbolList.map?.[symbolData.s],
    ...symbolData,
    channelType,
    t: symbolList.map?.[symbolData.s].t,
    ...(time && { ti: time }),
  };

  // Chart data is Symbol type INDEX, Board data is others
  if (isOddlot) {
    store.dispatch({
      type: MARKET_SYMBOL_ODDLOT_SUBSCRIBE_DATA,
      payload: current,
    });
  } else {
    if (type === SymbolType.INDEX) {
      store.dispatch({
        type: MARKET_INDEX_SUBSCRIBE_DATA,
        payload: current,
      });
    } else {
      if (symbolData.t === SymbolType.INDEX) {
        store.dispatch({
          type: MARKET_INDEX_SUBSCRIBE_DATA,
          payload: current,
        });
      }
      store.dispatch({
        type: MARKET_SYMBOL_SUBSCRIBE_DATA,
        payload: current,
      });
    }
  }

  if (subscribeData.callbacks != null) {
    Object.keys(subscribeData.callbacks).forEach((cbKey) => {
      subscribeData.callbacks?.[cbKey](current);
    });
  }
};

function* doSubscribeSymbol(request: IAction<INewSubscribeSymbol>) {
  const state: IState = yield select((s: IState) => ({
    symbolList: s.symbolList,
  }));
  yield subscribeSymbol(request.payload, state.symbolList);
}

function* doSubscribeSymbolMobileServer(request: IAction<INewSubscribeSymbol>) {
  const socket = Global.sockets[WS.MOBILE_SERVER];

  if (socket == null) {
    return;
  }

  request.payload.symbolList.forEach((symbol) => {
    let mutableSubscribeData: ISubscribeChannel =
      Global.mobileServerQuoteChannels[symbol.s];
    if (mutableSubscribeData == null) {
      const channel = socket.subscribe(`market.quote.${symbol.s}`);
      mutableSubscribeData = {
        code: symbol.s,
        channel,
        channelType: RealtimeChannelDataType.QUOTE,
        count: 1,
      };
      Global.mobileServerQuoteChannels[symbol.s] = mutableSubscribeData;
      channel.watch((res: IMatchingDataRecord) => {
        store.dispatch<IAction<Record<string, ISymbolQuote>>>({
          type: MARKET_SYMBOL_MOBILE_SERVER_SUBSCRIBE_DATA,
          payload: {
            [symbol.s]: mapMatchingDataToQuote(res),
          },
        });
      });
    } else {
      if (mutableSubscribeData.count != null) {
        mutableSubscribeData.count += 1;
      }
    }
  });
}

export default function* watchSubscribeSymbol() {
  yield takeEvery(SUBSCRIBE_SYMBOL, doSubscribeSymbol);
  yield takeEvery(
    SUBSCRIBE_SYMBOL_MOBILE_SERVER,
    doSubscribeSymbolMobileServer
  );
}
