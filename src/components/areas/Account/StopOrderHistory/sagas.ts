import {
  ACCOUNT_QUERY_STOP_ORDER_HISTORY,
  queryStopOrderHistory as queryStopOrderHistoryAction,
} from './actions';
import { AccountRoutes, BoardRoutes } from 'constants/routes';
import {
  COMMON_SHOW_NOTIFICATION,
  MARKET_ORDER_MATCH_SUBSCRIBE_DATA,
} from 'redux/actions';
import { IAction, INotification } from 'interfaces/common';
import { IOrderBookReducer } from 'interfaces/reducers';
import { IState } from 'redux/global-reducers';
import {
  IStopOrderHistoryParams,
  IStopOrderHistoryResponse,
} from 'interfaces/api';
import { OrderStatusResponse, SellBuyType } from 'constants/enum';
import { ToastType } from 'react-toastify';
import { call, put, select, takeEvery, takeLatest } from 'redux-saga/effects';
import { formatDateToString } from 'utils/datetime';
import { query } from 'utils/socketApi';
import config from 'config';

const queryStopOrderHistory = (params: IStopOrderHistoryParams) => {
  return query(config.apis.stopOrderHistory, params);
};

function* doQueryStopOrderHistory(request: IAction) {
  const store: IState = yield select((state: IState) => ({
    stopOrderHistory: state.stopOrderHistory,
    selectedAccount: state.selectedAccount,
  }));

  try {
    if (store.selectedAccount == null) {
      throw new Error('No account selected');
    }

    const params: IStopOrderHistoryParams = {
      accountNumber: store.selectedAccount.accountNumber,
      code: store.stopOrderHistory.params?.code,
      fromDate: formatDateToString(store.stopOrderHistory.params?.fromDate),
      toDate: formatDateToString(store.stopOrderHistory.params?.toDate),
      ...(store.stopOrderHistory.params?.sellBuyType !== 'All' && {
        sellBuyType: store.stopOrderHistory.params?.sellBuyType?.toUpperCase() as SellBuyType,
      }),
      ...(store.stopOrderHistory.params?.status !== 'All' && {
        status: store.stopOrderHistory.params?.status,
      }),
    };

    const response: { data: IStopOrderHistoryResponse[] } = yield call(
      queryStopOrderHistory,
      params
    );
    let payload = response.data;
    let totalDataCount = response.data.length;
    let offset = 0;
    while (totalDataCount === 100) {
      offset += 100;
      const newResponse: { data: IStopOrderHistoryResponse[] } = yield call(
        queryStopOrderHistory,
        {
          ...params,
          offset,
        }
      );
      if (newResponse.data) {
        payload = [...payload, ...newResponse.data];
        totalDataCount = newResponse.data.length;
      } else {
        totalDataCount = 0;
      }
    }

    if (request.response) {
      yield put<IAction<IStopOrderHistoryResponse[]>>({
        type: request.response.success,
        payload,
      });
    }
  } catch (error) {
    console.error('Query stop order history', error);

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
        title: 'Stop Order History',
        content: error.code || error.message,
        contentParams: error.messageParams,
        time: new Date(),
      },
    });
  }
}

function* doUpdateStopOrderHistory(request: IAction<IOrderBookReducer>) {
  const store: IState = yield select((state: IState) => ({
    router: state.router,
    stopOrderHistory: state.stopOrderHistory,
    selectedAccount: state.selectedAccount,
  }));

  if (
    !store.router.includes(AccountRoutes.STOP_ORDER_HISTORY) &&
    !store.router.includes(BoardRoutes.TRADING_TEMPLATE)
  ) {
    return;
  }

  if (
    request.payload.accountNumber === store.selectedAccount?.accountNumber &&
    store.stopOrderHistory.data.some(
      (val) =>
        val.code === request.payload.symbol &&
        val.accountNumber === request.payload.accountNumber &&
        request.payload.orderStatus === OrderStatusResponse.SENDING
    )
  ) {
    yield put(queryStopOrderHistoryAction());
  }
}

export function* watchQueryStockTransfer() {
  yield takeLatest(ACCOUNT_QUERY_STOP_ORDER_HISTORY, doQueryStopOrderHistory);
  yield takeEvery(MARKET_ORDER_MATCH_SUBSCRIBE_DATA, doUpdateStopOrderHistory);
}
