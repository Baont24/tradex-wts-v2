import { BoardRoutes } from 'constants/routes';
import {
  COMMON_SHOW_NOTIFICATION,
  MARKET_ORDER_MATCH_SUBSCRIBE_DATA,
  MARKET_SYMBOL_SUBSCRIBE_DATA,
} from 'redux/actions';
import {
  FunctionKey,
  OrderKind,
  OrderStatus,
  OrderStatusResponse,
  StopOrderStatus,
  StopOrderType,
  SymbolType,
} from 'constants/enum';
import { IAction, INotification, IResponse } from 'interfaces/common';
import {
  IDerivativesOrderBookParams,
  IDerivativesOrderBookResponse,
  IEquityOrderBookListResponse,
  IEquityOrderBookParams,
  ISpeedOrderCancelOrderParams,
  ISpeedOrderCancelOrderResponse,
  ISpeedOrderCancelStopOrderParams,
  ISpeedOrderModifyOrderParams,
  ISpeedOrderModifyOrderResponse,
  ISpeedOrderModifyStopOrderParams,
  ISpeedOrderModifyStopOrderResponse,
  IStopOrderHistoryParams,
  IStopOrderHistoryResponse,
} from 'interfaces/api';
import { INewSymbolData } from 'interfaces/market';
import { IOrderBookReducer } from 'interfaces/reducers';
import { ISpeedOrderReducer } from './reducers';
import { IState } from 'redux/global-reducers';
import {
  SPEED_ORDER_CANCEL_ORDER,
  SPEED_ORDER_CANCEL_STOP_ORDER,
  SPEED_ORDER_GET_PRICE_LIST,
  SPEED_ORDER_MODIFY_ORDER,
  SPEED_ORDER_MODIFY_STOP_ORDER,
  SPEED_ORDER_UPDATE_PRICE_LIST,
} from './actions';
import { ToastType } from 'react-toastify';
import {
  all,
  call,
  put,
  select,
  takeEvery,
  takeLatest,
  takeLeading,
} from 'redux-saga/effects';
import { formatDateToString } from 'utils/datetime';
import { getPriceList } from './utils';
import { mapOrderBookData } from 'utils/map';
import { query } from 'utils/socketApi';
import config from 'config';

let symbolData: INewSymbolData;
let orderBook: IOrderBookReducer[] = [];
let stopOrderHistory: IStopOrderHistoryResponse[] = [];

const ACCEPTED_ORDER_BOOK_STATUS = [
  OrderStatusResponse.READY_TO_SEND,
  OrderStatusResponse.SENDING,
  OrderStatusResponse.QUEUE,
  OrderStatusResponse.PENDINGAPPROVAL,
  OrderStatusResponse.INACTIVE_ORDER,
  OrderStatusResponse.INACTIVE,
  OrderStatusResponse.PARTIALLY_FILLED,
  OrderStatusResponse.FILLED_PARTLY,
];

const querySymbolData = (params?: { readonly symbolList: string[] }) => {
  return query<INewSymbolData[]>(config.apis.symbolInfoLatest, params);
};

const queryStopOrderHistory = (params: IStopOrderHistoryParams) => {
  return query(config.apis.stopOrderHistory, params);
};

function queryEquityOrderBook(params: IEquityOrderBookParams) {
  return query(config.apis.equityOrderBook, params);
}

function queryDerivativesOrderBook(params: IDerivativesOrderBookParams) {
  return query(config.apis.derivativesOrderBook, params);
}

function modifySpeedOrder(params: ISpeedOrderModifyOrderParams) {
  return query(config.apis.speedOrderModifyOrder, params);
}

function cancelSpeedOrder(params: ISpeedOrderCancelOrderParams) {
  return query(config.apis.speedOrderCancelOrder, params);
}

function modifySpeedStopOrder(params: ISpeedOrderModifyStopOrderParams) {
  return query(config.apis.speedOrderModifySpeedOrder, params);
}

function cancelSpeedStopOrder(params: ISpeedOrderCancelStopOrderParams) {
  return query(config.apis.speedOrderCancelSpeedOrder, params);
}

function* doGetSpeedOrderOrderBookData() {
  const store: IState = yield select((state: IState) => ({
    selectedAccount: state.selectedAccount,
    currentSymbol: state.currentSymbol,
    config: state.config,
  }));

  if (store.selectedAccount == null) {
    throw Error('No account selected');
  }

  let orderBookData: IOrderBookReducer[] = [];

  try {
    const fetchCount = store.config.fetchCount;
    let offset = 0;
    let count = fetchCount;
    if (store.currentSymbol.symbolType === SymbolType.FUTURES) {
      while (count === fetchCount) {
        const response: IResponse<IDerivativesOrderBookResponse[]> = yield call(
          queryDerivativesOrderBook,
          {
            accountNumber: store.selectedAccount.accountNumber,
            sellBuyType: 'ALL',
            stockSymbol: store.currentSymbol.code,
            status: OrderStatus.All,
            validity: '',
            offset,
            fetchCount,
          }
        );

        offset += response.data.length;
        count = response.data.length;
        const responseData = response.data.map((val) => mapOrderBookData(val));
        orderBookData = [...orderBookData, ...responseData];
      }
    } else {
      while (count === fetchCount) {
        const response: IResponse<IEquityOrderBookListResponse> = yield call(
          queryEquityOrderBook,
          {
            accountNo: store.selectedAccount.accountNumber,
            sellBuyType: 'ALL',
            stockSymbol: store.currentSymbol.code,
            status: OrderStatus.All,
            offset,
            fetchCount,
          }
        );

        offset += response.data.beanList.length;
        count = response.data.beanList.length;
        const responseData = response.data.beanList.map((val) =>
          mapOrderBookData(val)
        );
        orderBookData = [...orderBookData, ...responseData];
      }
    }
  } catch (error) {
    console.error('Speed Order Order Book Error', error);
  } finally {
    orderBookData =
      orderBookData?.filter(
        (val) =>
          ACCEPTED_ORDER_BOOK_STATUS.includes(val.orderStatus) &&
          val.accountNumber === store.selectedAccount?.accountNumber
      ) || [];

    orderBook = orderBookData;
    const priceList = getPriceList(symbolData, orderBook, stopOrderHistory);
    yield put<IAction<Partial<ISpeedOrderReducer>>>({
      type: SPEED_ORDER_UPDATE_PRICE_LIST,
      payload: {
        priceList: priceList.list,
        total: priceList.total,
        symbolData,
      },
    });
  }
}

function* doGetSpeedOrderStopOrderHistoryData() {
  const store: IState = yield select((state: IState) => ({
    selectedAccount: state.selectedAccount,
    currentSymbol: state.currentSymbol,
    config: state.config,
  }));

  if (store.selectedAccount == null) {
    throw Error('No account selected');
  }

  let stopOrderHistoryData: IStopOrderHistoryResponse[] = [];

  try {
    const fetchCount = store.config.fetchCount;
    let offset = 0;
    let count = fetchCount;
    while (count === fetchCount) {
      const response: IResponse<IStopOrderHistoryResponse[]> = yield call(
        queryStopOrderHistory,
        {
          accountNumber: store.selectedAccount.accountNumber,
          code: store.currentSymbol.code,
          orderType: StopOrderType.STOP,
          status: StopOrderStatus.PENDING,
          fromDate: formatDateToString(new Date()),
          toDate: formatDateToString(new Date()),
          offset,
          fetchCount,
        }
      );

      offset += response.data.length;
      count = response.data.length;
      stopOrderHistoryData = [...stopOrderHistoryData, ...response.data];
    }
  } catch (error) {
    console.error('Speed Order Stop Order History Error', error);
  } finally {
    stopOrderHistory = stopOrderHistoryData;
    const priceList = getPriceList(symbolData, orderBook, stopOrderHistory);
    yield put<IAction<Partial<ISpeedOrderReducer>>>({
      type: SPEED_ORDER_UPDATE_PRICE_LIST,
      payload: {
        priceList: priceList.list,
        total: priceList.total,
        symbolData,
      },
    });
  }
}

function* doGetSpeedOrderSymbolData() {
  const store: IState = yield select((state: IState) => ({
    currentSymbol: state.currentSymbol,
    symbolList: state.symbolList,
  }));

  let responseSymbolData: IResponse<INewSymbolData[]> | null = null;
  try {
    responseSymbolData = yield call(querySymbolData, {
      symbolList: [store.currentSymbol.code],
    });
  } catch (error) {
    console.error('Speed Order Symbol Data Error', error);
  } finally {
    symbolData =
      {
        s: store.currentSymbol.code,
        ...store.symbolList.map?.[store.currentSymbol.code],
        ...responseSymbolData?.data[0],
      } || store.currentSymbol.infoData;
    const priceList = getPriceList(symbolData, orderBook, stopOrderHistory);
    yield put<IAction<Partial<ISpeedOrderReducer>>>({
      type: SPEED_ORDER_UPDATE_PRICE_LIST,
      payload: { priceList: priceList.list, symbolData },
    });
  }
}

function* doGetSpeedOrderData(request: IAction<OrderKind | undefined>) {
  const store: IState = yield select((state: IState) => ({
    selectedAccount: state.selectedAccount,
    currentSymbol: state.currentSymbol,
    symbolList: state.symbolList,
  }));
  symbolData = {
    ...symbolData,
    s: store.currentSymbol.code,
    ...store.symbolList.map?.[store.currentSymbol.code],
  };
  const priceList = getPriceList(symbolData, orderBook, stopOrderHistory);

  if (request.response) {
    yield put<IAction<ISpeedOrderReducer>>({
      type: request.response.success,
      payload: {
        priceList: priceList.list,
        total: priceList.total,
        symbolData,
      },
    });
  }

  if (request.payload === OrderKind.STOP_LIMIT_ORDER) {
    yield call(doGetSpeedOrderStopOrderHistoryData);
  } else if (request.payload === OrderKind.NORMAL_ORDER) {
    // yield call(doGetSpeedOrderOrderBookData);
  } else {
    yield all([
      call(doGetSpeedOrderSymbolData),
      call(doGetSpeedOrderOrderBookData),
      call(doGetSpeedOrderStopOrderHistoryData),
    ]);
  }
}

function* doUpdateSpeedOrderSymbolData(request: IAction<INewSymbolData>) {
  const store: IState = yield select((state: IState) => ({
    currentSymbol: state.currentSymbol,
    symbolCachedData: state.symbolCachedData,
    sideBarFunction: state.sideBarFunction,
  }));

  if (
    store.sideBarFunction.key === FunctionKey.QUICK_ORDER &&
    store.currentSymbol.code === request.payload.s
  ) {
    symbolData = {
      ...store.currentSymbol.infoData,
      ...store.symbolCachedData[store.currentSymbol.code],
    };
    const priceList = getPriceList(symbolData, orderBook, stopOrderHistory);
    yield put<IAction<Partial<ISpeedOrderReducer>>>({
      type: SPEED_ORDER_UPDATE_PRICE_LIST,
      payload: { priceList: priceList.list, symbolData },
    });
  }
}

function* doModifySpeedOrder(request: IAction<ISpeedOrderModifyOrderParams>) {
  try {
    const response: { data: ISpeedOrderModifyOrderResponse[] } = yield call(
      modifySpeedOrder,
      request.payload
    );

    if (response.data[0]?.result?.success) {
      yield put<IAction<INotification>>({
        type: COMMON_SHOW_NOTIFICATION,
        payload: {
          type: ToastType.SUCCESS,
          title: 'Modify Speed Order',
          content: 'MODIFY_ORDER_SUCCESS',
          contentParams: { orderNumber: response?.data[0]?.result?.orderNo },
          time: new Date(),
        },
      });
    } else if (response.data[0]?.error) {
      yield put<IAction<INotification>>({
        type: COMMON_SHOW_NOTIFICATION,
        payload: {
          type: ToastType.ERROR,
          title: 'Modify Speed Order',
          content: response.data[0].error.code,
          time: new Date(),
        },
      });
    }

    if (request.response) {
      yield put<IAction<ISpeedOrderModifyOrderResponse[]>>({
        type: request.response.success,
        payload: response.data,
      });
    }
  } catch (error) {
    console.error('Modify speed order', error);

    if (request.response) {
      yield put<IAction<string>>({
        type: request.response.failed,
        payload: error.code || error.message,
      });
    }

    yield put<IAction<INotification>>({
      type: COMMON_SHOW_NOTIFICATION,
      payload: {
        type: ToastType.ERROR,
        title: 'Modify Speed Order',
        content: error.code || error.message,
        contentParams: error.messageParams,
        time: new Date(),
      },
    });
  }
}

function* doCancelSpeedOrder(request: IAction<ISpeedOrderCancelOrderParams>) {
  try {
    const response: { data: ISpeedOrderCancelOrderResponse[] } = yield call(
      cancelSpeedOrder,
      request.payload
    );

    if (response.data[0]?.success) {
      yield put<IAction<INotification>>({
        type: COMMON_SHOW_NOTIFICATION,
        payload: {
          type: ToastType.SUCCESS,
          title: 'Cancel Speed Order',
          content: 'CANCEL_ORDER_SUCCESS',
          time: new Date(),
        },
      });
    } else if (response.data[0]?.reject) {
      yield put<IAction<INotification>>({
        type: COMMON_SHOW_NOTIFICATION,
        payload: {
          type: ToastType.ERROR,
          title: 'Cancel Speed Order',
          content: response.data[0]?.errorCode,
          time: new Date(),
        },
      });
    }

    if (request.response) {
      yield put<IAction<ISpeedOrderCancelOrderResponse[]>>({
        type: request.response.success,
        payload: response.data,
      });
    }
  } catch (error) {
    console.error('Cancel speed order', error);

    if (request.response) {
      yield put<IAction<string>>({
        type: request.response.failed,
        payload: error.code || error.message,
      });
    }

    yield put<IAction<INotification>>({
      type: COMMON_SHOW_NOTIFICATION,
      payload: {
        type: ToastType.ERROR,
        title: 'Cancel Speed Order',
        content: error.code || error.message,
        contentParams: error.messageParams,
        time: new Date(),
      },
    });
  }
}

function* doModifySpeedStopOrder(
  request: IAction<ISpeedOrderModifyStopOrderParams>
) {
  try {
    const response: IResponse<ISpeedOrderModifyStopOrderResponse> = yield call(
      modifySpeedStopOrder,
      request.payload
    );

    yield put<IAction<INotification>>({
      type: COMMON_SHOW_NOTIFICATION,
      payload: {
        type: ToastType.SUCCESS,
        title: 'Modify Speed Order',
        content: 'MODIFY_ORDER_SUCCESS',
        time: new Date(),
      },
    });

    if (request.response) {
      yield put<IAction<ISpeedOrderModifyStopOrderResponse>>({
        type: request.response.success,
        payload: response.data,
      });
    }
  } catch (error) {
    console.error('Modify speed order', error);

    if (request.response) {
      yield put<IAction<string>>({
        type: request.response.failed,
        payload: error.code || error.message,
      });
    }

    yield put<IAction<INotification>>({
      type: COMMON_SHOW_NOTIFICATION,
      payload: {
        type: ToastType.ERROR,
        title: 'Modify Speed Order',
        content: error.code || error.message,
        contentParams: error.messageParams,
        time: new Date(),
      },
    });
  }
}

function* doCancelSpeedStopOrder(
  request: IAction<ISpeedOrderCancelStopOrderParams>
) {
  try {
    const response: IResponse<ISpeedOrderCancelOrderResponse> = yield call(
      cancelSpeedStopOrder,
      request.payload
    );

    yield put<IAction<INotification>>({
      type: COMMON_SHOW_NOTIFICATION,
      payload: {
        type: ToastType.SUCCESS,
        title: 'Cancel Speed Order',
        content: 'CANCEL_ORDER_SUCCESS',
        time: new Date(),
      },
    });

    if (request.response) {
      yield put<IAction<ISpeedOrderCancelOrderResponse>>({
        type: request.response.success,
        payload: response.data,
      });
    }
  } catch (error) {
    console.error('Cancel speed order', error);

    if (request.response) {
      yield put<IAction<string>>({
        type: request.response.failed,
        payload: error.code || error.message,
      });
    }

    yield put<IAction<INotification>>({
      type: COMMON_SHOW_NOTIFICATION,
      payload: {
        type: ToastType.ERROR,
        title: 'Cancel Speed Order',
        content: error.code || error.message,
        contentParams: error.messageParams,
        time: new Date(),
      },
    });
  }
}

function* doUpdateSpeedOrderOrderBookData(request: IAction<IOrderBookReducer>) {
  const store: IState = yield select((state: IState) => ({
    currentSymbol: state.currentSymbol,
    sideBarFunction: state.sideBarFunction,
    selectedAccount: state.selectedAccount,
    router: state.router,
  }));

  if (
    store.currentSymbol.code === request.payload.symbol &&
    (store.sideBarFunction.key === FunctionKey.QUICK_ORDER ||
      store.router.includes(BoardRoutes.TRADING_TEMPLATE))
  ) {
    const index = orderBook.findIndex(
      (val) => val.orderNumber === request.payload.orderNumber
    );
    orderBook = (index === -1
      ? [...orderBook, request.payload]
      : orderBook.map((val) =>
          val.orderNumber === request.payload.orderNumber
            ? { ...val, ...request.payload }
            : val
        )
    ).filter(
      (val) =>
        ACCEPTED_ORDER_BOOK_STATUS.includes(val.orderStatus) &&
        val.accountNumber === store.selectedAccount?.accountNumber
    );

    const priceList = getPriceList(symbolData, orderBook, stopOrderHistory);
    yield put<IAction<Partial<ISpeedOrderReducer>>>({
      type: SPEED_ORDER_UPDATE_PRICE_LIST,
      payload: { priceList: priceList.list, total: priceList.total },
    });
  }
}

function* doUpdateSpeedOrderStopOrderHistoryData(
  request: IAction<IOrderBookReducer>
) {
  const store: IState = yield select((state: IState) => ({
    currentSymbol: state.currentSymbol,
    sideBarFunction: state.sideBarFunction,
    selectedAccount: state.selectedAccount,
    router: state.router,
  }));

  if (
    store.sideBarFunction.key !== FunctionKey.QUICK_ORDER &&
    !store.router.includes(BoardRoutes.TRADING_TEMPLATE)
  ) {
    return;
  }

  if (
    store.currentSymbol.code === request.payload.symbol &&
    request.payload.accountNumber === store.selectedAccount?.accountNumber &&
    stopOrderHistory.some(
      (val) =>
        val.code === request.payload.symbol &&
        val.accountNumber === request.payload.accountNumber &&
        request.payload.orderStatus === OrderStatusResponse.SENDING
    )
  ) {
    yield call(doGetSpeedOrderStopOrderHistoryData);
  }
}

export function* watchGetSpeedOrderData() {
  yield takeLatest(SPEED_ORDER_GET_PRICE_LIST, doGetSpeedOrderData);
  yield takeLeading(SPEED_ORDER_MODIFY_ORDER, doModifySpeedOrder);
  yield takeLeading(SPEED_ORDER_CANCEL_ORDER, doCancelSpeedOrder);
  yield takeLeading(SPEED_ORDER_MODIFY_STOP_ORDER, doModifySpeedStopOrder);
  yield takeLeading(SPEED_ORDER_CANCEL_STOP_ORDER, doCancelSpeedStopOrder);
  yield takeEvery(MARKET_SYMBOL_SUBSCRIBE_DATA, doUpdateSpeedOrderSymbolData);
  yield takeEvery(
    MARKET_ORDER_MATCH_SUBSCRIBE_DATA,
    doUpdateSpeedOrderOrderBookData
  );
  yield takeEvery(
    MARKET_ORDER_MATCH_SUBSCRIBE_DATA,
    doUpdateSpeedOrderStopOrderHistoryData
  );
}
