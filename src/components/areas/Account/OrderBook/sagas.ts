import {
  ACCOUNT_ORDER_BOOK,
  ACCOUNT_ORDER_BOOK_DETAIL,
  ACCOUNT_ORDER_BOOK_LOAD_MORE,
} from './actions';
import { COMMON_SHOW_NOTIFICATION } from 'redux/actions';
import { IAction, INotification, IResponse } from 'interfaces/common';
import {
  IDerivativeOrderBookDetailParams,
  IDerivativesOrderBookParams,
  IDerivativesOrderBookResponse,
  IEquityOrderBookDetailParams,
  IEquityOrderBookListResponse,
  IEquityOrderBookParams,
  IEquityOrderBookResponse,
  IOrderBookDetailResponse,
} from 'interfaces/api';
import { IOrderBookAction, IOrderBookDetailAction } from 'interfaces/actions';
import { IOrderBookReducer } from 'interfaces/reducers';
import { IState } from 'redux/global-reducers';
import { SystemType } from 'constants/enum';
import { ToastType } from 'react-toastify';
import { call, put, select, takeLatest } from 'redux-saga/effects';
import { mapOrderBookData } from 'utils/map';
import { query } from 'utils/socketApi';
import config from 'config';

function queryEquityOrderBook(params: IEquityOrderBookParams) {
  return query(config.apis.equityOrderBook, params);
}

function queryDerivativesOrderBook(params: IDerivativesOrderBookParams) {
  return query(config.apis.derivativesOrderBook, params);
}

function queryOrderBookDetail(params: IOrderBookDetailAction) {
  const paramEquityOrderBookDetail: IEquityOrderBookDetailParams = {
    accountNumber: params.accountNumber,
    orderGroupNo: params.orderGroupNo,
  };

  const orderNumber = params.orderNumber;
  const paramDerivativeOrderBookDetail: IDerivativeOrderBookDetailParams = {
    accountNumber: params.accountNumber,
    orderGroupID: params.orderGroupNo,
    orderID: orderNumber,
  };
  if (params.type === SystemType.EQUITY) {
    return query(config.apis.equityOrderBookDetail, paramEquityOrderBookDetail);
  } else {
    return query(
      config.apis.derivativeOrderBookDetail,
      paramDerivativeOrderBookDetail
    );
  }
}

function* doQueryEquityOrderBook(request: IAction<IOrderBookAction>) {
  let payload: IEquityOrderBookResponse[] = [];
  try {
    const store: IState = yield select((state: IState) => ({
      accountList: state.accountList,
    }));
    const fetchCount = config.fetchCount;

    if (request.payload.accountNumber === 'ALL') {
      for (const account of store.accountList) {
        if (account.type === SystemType.EQUITY) {
          const nextResponse: {
            data?: IEquityOrderBookListResponse;
          } = yield call(queryEquityOrderBook, {
            ...request.payload,
            accountNo: request.payload.accountNumber,
            fetchCount,
          });

          if (nextResponse.data != null && request.response) {
            payload = [...payload, ...nextResponse.data.beanList];

            yield put<IAction<IOrderBookReducer[]>>({
              type: request.response.success,
              payload: nextResponse.data.beanList.map((val) =>
                mapOrderBookData(val)
              ),
            });
          }
        }
      }
    } else {
      const nextResponse: {
        data?: IEquityOrderBookListResponse;
      } = yield call(queryEquityOrderBook, {
        ...request.payload,
        accountNo: request.payload.accountNumber,
        fetchCount,
      });

      if (nextResponse.data != null && request.response) {
        payload = [...payload, ...nextResponse.data.beanList];

        yield put<IAction<IOrderBookReducer[]>>({
          type: request.response.success,
          payload: nextResponse.data.beanList.map((val) =>
            mapOrderBookData(val)
          ),
        });
      }
    }
  } catch (error) {
    if (request.response && payload.length === 0) {
      yield put<IAction<string>>({
        type: request.response.failed,
        payload: error.code || error.message,
      });
    }

    yield put<IAction<INotification>>({
      type: COMMON_SHOW_NOTIFICATION,
      payload: {
        type: ToastType.ERROR,
        title: 'Order Book',
        content: error.code || error.message,
        contentParams: error.messageParams,
        time: new Date(),
      },
    });
  }
}

function* doQueryOrderBookDetail(request: IAction<IOrderBookDetailAction>) {
  try {
    const response: { data?: IOrderBookDetailResponse[] } = yield call(
      queryOrderBookDetail,
      request.payload
    );
    if (response?.data != null && request.response != null) {
      yield put<IAction<IOrderBookDetailResponse[]>>({
        type: request.response.success,
        payload: response.data,
      });
    }
  } catch (error) {
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
        title: 'Order Book Log',
        content: error.code || error.message,
        contentParams: error.messageParams,
        time: new Date(),
      },
    });
  }
}

function* doQueryDerivativesOrderBook(request: IAction<IOrderBookAction>) {
  const fetchCount = config.fetchCount;
  let payload: IDerivativesOrderBookResponse[] = [];
  try {
    const response: IResponse<IDerivativesOrderBookResponse[]> = yield call(
      queryDerivativesOrderBook,
      {
        ...request.payload,
        fetchCount,
      }
    );

    if (response.data != null && request.response) {
      payload = [...payload, ...response.data];
      yield put<IAction<IOrderBookReducer[]>>({
        type: request.response.success,
        payload,
      });
    }
  } catch (error) {
    if (request.response && payload.length === 0) {
      yield put<IAction<string>>({
        type: request.response.failed,
        payload: error.code || error.message,
      });
    }
    yield put<IAction<INotification>>({
      type: COMMON_SHOW_NOTIFICATION,
      payload: {
        type: ToastType.ERROR,
        title: 'Order Book',
        content: error.code || error.message,
        contentParams: error.messageParams,
        time: new Date(),
      },
    });
  }
}

function* doQueryOrderBook(request: IAction<IOrderBookAction>) {
  if (request.payload.systemType === SystemType.DERIVATIVES) {
    yield doQueryDerivativesOrderBook(request);
  } else {
    yield doQueryEquityOrderBook(request);
  }
}

export function* watchQueryOrderBook() {
  yield takeLatest(ACCOUNT_ORDER_BOOK, doQueryOrderBook);
  yield takeLatest(ACCOUNT_ORDER_BOOK_LOAD_MORE, doQueryOrderBook);
}

export function* watchQueryOrderBookDetail() {
  yield takeLatest(ACCOUNT_ORDER_BOOK_DETAIL, doQueryOrderBookDetail);
}
