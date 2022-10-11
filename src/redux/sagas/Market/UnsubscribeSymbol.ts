import { Global } from 'constants/main';
import { INewSubscribeSymbol } from 'interfaces/market';
import { IRequest } from 'interfaces/common';
import { RealtimeChannelDataType } from 'constants/enum';
import {
  UNSUBSCRIBE_SYMBOL,
  UNSUBSCRIBE_SYMBOL_MOBILE_SERVER,
} from 'redux/actions';
import { takeEvery } from 'redux-saga/effects';

const unsubscribeSymbol = (data?: INewSubscribeSymbol) => {
  if (data && data.symbolList) {
    const localLog: Record<string, string> = {};
    data.symbolList.forEach((element) => {
      if (element != null) {
        if (data.types.includes(RealtimeChannelDataType.QUOTE)) {
          const {
            [element.s]: mutableSubscribeData,
            ...rest
          } = Global.quoteChannels;
          if (mutableSubscribeData != null) {
            mutableSubscribeData.count = mutableSubscribeData.count - 1;
            if (data.cbKey != null && mutableSubscribeData.callbacks != null) {
              const {
                [data.cbKey]: cbData,
                ...restCBs
              } = mutableSubscribeData.callbacks;
              mutableSubscribeData.callbacks = restCBs;
            }
            if (
              mutableSubscribeData.count === 0 &&
              mutableSubscribeData.channel
            ) {
              mutableSubscribeData.channel?.unwatch();
              mutableSubscribeData.channel?.unsubscribe();
              Global.quoteChannels = rest;
            }
          }
        }

        if (data.types.includes(RealtimeChannelDataType.BID_OFFER)) {
          const {
            [element.s]: mutableSubscribeData,
            ...rest
          } = Global.bidOfferChannels;
          if (mutableSubscribeData != null) {
            mutableSubscribeData.count = mutableSubscribeData.count - 1;
            if (data.cbKey != null && mutableSubscribeData.callbacks != null) {
              const {
                [data.cbKey]: cbData,
                ...restCBs
              } = mutableSubscribeData.callbacks;
              mutableSubscribeData.callbacks = restCBs;
            }
            if (
              mutableSubscribeData.count === 0 &&
              mutableSubscribeData.channel
            ) {
              mutableSubscribeData.channel?.unwatch();
              mutableSubscribeData.channel?.unsubscribe();
              Global.bidOfferChannels = rest;
            }
          }
        }

        if (data.types.includes(RealtimeChannelDataType.EXTRA)) {
          const {
            [element.s]: mutableSubscribeData,
            ...rest
          } = Global.extraChannels;
          if (mutableSubscribeData != null) {
            mutableSubscribeData.count = mutableSubscribeData.count - 1;
            if (data.cbKey != null && mutableSubscribeData.callbacks != null) {
              const {
                [data.cbKey]: cbData,
                ...restCBs
              } = mutableSubscribeData.callbacks;
              mutableSubscribeData.callbacks = restCBs;
            }
            if (
              mutableSubscribeData.count === 0 &&
              mutableSubscribeData.channel
            ) {
              mutableSubscribeData.channel?.unwatch();
              mutableSubscribeData.channel?.unsubscribe();
              Global.extraChannels = rest;
            }
          }
        }
      }

      if (localLog[element.s] == null) {
        localLog[element.s] = `${Global.quoteChannels[element.s]?.count || 0} ${
          Global.bidOfferChannels[element.s]?.count || 0
        } ${Global.extraChannels[element.s]?.count || 0}`;
      } else {
        localLog[element.s] = `${Global.quoteChannels[element.s]?.count || 0} ${
          Global.bidOfferChannels[element.s]?.count || 0
        } ${Global.extraChannels[element.s]?.count || 0} Duplicated`;
      }
    });

    console.groupCollapsed('Unsubscribe Symbols');
    console.log(localLog);
    console.groupEnd();
  }
};

function* doUnsubscribeSymbol(request: IRequest<INewSubscribeSymbol>) {
  yield unsubscribeSymbol(request.payload);
}

function* doUnsubscribeSymbolMobileServer(
  request: IRequest<INewSubscribeSymbol>
) {
  request.payload.symbolList.forEach((symbol) => {
    const {
      [symbol.s]: mutableSubscribeData,
      ...rest
    } = Global.mobileServerQuoteChannels;
    if (mutableSubscribeData != null) {
      mutableSubscribeData.count = mutableSubscribeData.count ?? 0 - 1;
      if (mutableSubscribeData.count === 0 && mutableSubscribeData.channel) {
        mutableSubscribeData.channel?.unwatch();
        mutableSubscribeData.channel?.unsubscribe();
        Global.mobileServerQuoteChannels = rest;
      }
    }
  });
}

export default function* watchUnsubscribeSymbol() {
  yield takeEvery(UNSUBSCRIBE_SYMBOL, doUnsubscribeSymbol);
  yield takeEvery(
    UNSUBSCRIBE_SYMBOL_MOBILE_SERVER,
    doUnsubscribeSymbolMobileServer
  );
}
