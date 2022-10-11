import { IAction, IResponse, IWatchlist } from 'interfaces/common';
import { IQueryWatchListResponse } from 'interfaces/api';
import { IState } from 'redux/global-reducers';
import {
  WATCHLIST_SELECT_ITEM,
  WATCHLIST_SERVER_GET_LIST,
  WATCHLIST_SERVER_GET_LIST_SUCCESS,
} from 'redux/actions';
import { call, put, select, takeLeading } from 'redux-saga/effects';
import { query } from 'utils/socketApi';
import RetryAble from 'utils/RetryAble';
import config from 'config';

function callQueryWatchList(): Promise<IResponse<IQueryWatchListResponse>> {
  return new RetryAble<IResponse<IQueryWatchListResponse>>(() =>
    query(config.apis.queryWatchList, {})
  ).run();
}

function* queryWatchLists() {
  try {
    const store: IState = yield select((state: IState) => ({
      selectedWatchlist: state.selectedWatchlist,
    }));

    const list: IResponse<IQueryWatchListResponse> = yield call(
      callQueryWatchList
    );

    if (store.selectedWatchlist?.isServer) {
      const selectedWatchlist = list.data.find(
        (val) => val.id === store.selectedWatchlist?.id
      );
      if (selectedWatchlist != null) {
        yield put<IAction<IWatchlist | null>>({
          type: WATCHLIST_SELECT_ITEM,
          payload: {
            id: selectedWatchlist.id,
            name: selectedWatchlist.name,
            isServer: true,
            data: selectedWatchlist.itemList?.map((ele) => ele.data) || [],
          },
        });
      }
    }

    yield put<IAction<IWatchlist[]>>({
      type: WATCHLIST_SERVER_GET_LIST_SUCCESS,
      payload: list.data.map((item) => ({
        id: item.id,
        name: item.name,
        isServer: true,
        data: item.itemList?.map((ele) => ele.data) || [],
      })),
    });
  } catch (error) {
    console.error('Load watchlist server failed', error);
    yield put<IAction<IQueryWatchListResponse>>({
      type: WATCHLIST_SERVER_GET_LIST_SUCCESS,
      payload: [],
    });
  }
}

export function* watchQueryWatchList() {
  yield takeLeading(WATCHLIST_SERVER_GET_LIST, queryWatchLists);
}
