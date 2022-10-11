import * as _ from 'lodash';
import {
  COMMON_SHOW_NOTIFICATION,
  WATCHLIST_ADD_ITEM,
  WATCHLIST_DELETE_ITEM,
  WATCHLIST_GET_SYMBOL_DATA,
  WATCHLIST_GET_SYMBOL_DATA_FAILED,
  WATCHLIST_GET_SYMBOL_DATA_SUCCEDED,
  WATCHLIST_SELECT_ITEM,
  WATCHLIST_SERVER_ADD_ITEM,
  WATCHLIST_SERVER_ADD_ITEM_SUCCESS,
  WATCHLIST_SERVER_DELETE_ITEM,
  WATCHLIST_SERVER_GET_LIST,
  WATCHLIST_SERVER_UPDATE_ITEM,
  WATCHLIST_SERVER_UPDATE_ITEM_SUCCESS,
  WATCHLIST_UPDATE_ITEM,
  WATCHLIST_UPDATE_SELECTED_ITEM,
} from 'redux/actions';
import { FunctionKey } from 'constants/enum';
import {
  IAction,
  INotification,
  IRequest,
  IRequestExtra,
  IResponse,
  IWatchlist,
} from 'interfaces/common';
import { IQuerySymbolData } from 'interfaces/actions';
import { IState } from 'redux/global-reducers';
import { ToastType } from 'react-toastify';
import { call, put, select, takeEvery } from 'redux-saga/effects';
import { request } from 'utils/socketApi';
import { showNotification } from 'redux/global-actions';
import config from 'config';

function updateWatchList(data: IWatchlist): Promise<IResponse<object>> {
  return request(config.apis.updateWatchList, [
    {
      id: data.id,
      name: data.name,
      itemList: data.data?.map((ele) => {
        return { data: ele, isNote: false };
      }),
    },
  ]);
}

function addWatchList(data: IWatchlist): Promise<IResponse<object>> {
  return request(config.apis.addWatchList, { name: data.name });
}

function delWatchList(data: IWatchlist): Promise<IResponse<object>> {
  return request(config.apis.delWatchList, { items: [data.id] });
}

function* doGetWatchlistData(req: IRequest<IWatchlist | null>) {
  const store: IState = yield select((state: IState) => ({
    sideBarFunction: state.sideBarFunction,
  }));
  if (store.sideBarFunction.key === FunctionKey.DASHBOARD) {
    yield put<IAction<IQuerySymbolData>>({
      type: WATCHLIST_GET_SYMBOL_DATA,
      payload: {
        symbolList: req.payload?.data || [],
      },
      response: {
        failed: WATCHLIST_GET_SYMBOL_DATA_FAILED,
        success: WATCHLIST_GET_SYMBOL_DATA_SUCCEDED,
      },
    });
  }
}

function* doAddWatchlist(req: IRequestExtra<IWatchlist | null, INotification>) {
  if (req.payload != null) {
    try {
      yield call(addWatchList, req.payload);
      yield put({
        type: WATCHLIST_SERVER_GET_LIST,
      });
    } catch (e) {
      console.error('fail to add new watchlist', e);
      yield put<IAction<INotification>>({
        type: COMMON_SHOW_NOTIFICATION,
        payload: {
          ...req.extraData,
          type: ToastType.ERROR,
          content: `${req.extraData.content}_FAILED`,
        },
      });
      return;
    }
  }
  yield call(doGetWatchlistData, req);
  yield put({
    ...req,
    type: WATCHLIST_SERVER_ADD_ITEM_SUCCESS,
  });
  yield put<IAction<INotification>>({
    type: COMMON_SHOW_NOTIFICATION,
    payload: req.extraData,
  });
}

function* doDeleteWatchlistServer(
  req: IRequestExtra<IWatchlist | null, INotification>
) {
  if (req.payload != null) {
    try {
      yield call(delWatchList, req.payload);
    } catch (e) {
      console.error('fail to delete watchlist', e);
      yield put(
        showNotification({
          ...req.extraData,
        })
      );
      return;
    }
  }
  yield call(doGetWatchlistData, req);
  yield put({
    ...req,
    type: WATCHLIST_SERVER_UPDATE_ITEM_SUCCESS,
  });
  yield put(showNotification({ ...req.extraData }));
}

function* doDeleteWatchlist(
  req: IRequestExtra<IWatchlist | null, INotification>
) {
  const store: IState = yield select((state: IState) => ({
    selectedWatchlist: state.selectedWatchlist,
  }));
  if (req.payload?.id === store.selectedWatchlist?.id) {
    yield put<IAction<IWatchlist | null>>({
      type: WATCHLIST_SELECT_ITEM,
      payload: null,
    });
  }
  yield call(doGetWatchlistData, req);
}

function* doUpdateWatchlistServer(
  req: IRequestExtra<IWatchlist | null, INotification>
) {
  if (req.payload != null && req.payload.isServer === true) {
    try {
      yield call(updateWatchList, req.payload);
    } catch (e) {
      console.error('fail to update watchlist', e);
      yield put<IAction<INotification>>({
        type: COMMON_SHOW_NOTIFICATION,
        payload: {
          ...req.extraData,
          type: ToastType.ERROR,
          content: `${req.extraData.content}_FAILED`,
        },
      });
      return;
    }
  }
  yield call(doGetWatchlistData, req);
  yield put({
    ...req,
    type: WATCHLIST_SERVER_UPDATE_ITEM_SUCCESS,
  });
  yield put<IAction<INotification>>({
    type: COMMON_SHOW_NOTIFICATION,
    payload: req.extraData,
  });
}

function* doUpdateWatchlist(
  req: IRequestExtra<IWatchlist | null, INotification>
) {
  yield put<IAction<IWatchlist | null>>({
    type: WATCHLIST_UPDATE_SELECTED_ITEM,
    payload: req.payload,
  });
  yield put<IAction<INotification>>({
    type: COMMON_SHOW_NOTIFICATION,
    payload: req.extraData,
  });
}

export default function* watchGetWatchlistData() {
  yield takeEvery(WATCHLIST_SELECT_ITEM, doGetWatchlistData);
  yield takeEvery(WATCHLIST_ADD_ITEM, doGetWatchlistData);
  yield takeEvery(WATCHLIST_SERVER_ADD_ITEM, doAddWatchlist);
  yield takeEvery(WATCHLIST_UPDATE_ITEM, doUpdateWatchlist);
  yield takeEvery(WATCHLIST_SERVER_UPDATE_ITEM, doUpdateWatchlistServer);
  yield takeEvery(WATCHLIST_DELETE_ITEM, doDeleteWatchlist);
  yield takeEvery(WATCHLIST_SERVER_DELETE_ITEM, doDeleteWatchlistServer);
}
