import * as utils from './utils';
import {
  BOARD_INIT_PRICE_BOARD,
  BOARD_SELECT_SYMBOL,
  BOARD_UPDATE_WATCHLIST_BOARD,
  initPriceBoard,
  updatePriceBoard,
} from './actions';
import { BoardMarketRoutes } from 'constants/routes';
import { IAction, INotification, IWatchlist } from 'interfaces/common';
import { INewSymbolData } from 'interfaces/market';
import { IPriceBoardAction } from 'interfaces/actions';
import { IPriceBoardReducer } from 'interfaces/reducers';
import { IState } from 'redux/global-reducers';
import { IndexStock } from 'constants/enum';
import { MARKET_QUERY_INDEX_STOCK_LIST_SUCCESS } from 'redux/actions';
import { ToastType } from 'react-toastify';
import { arrayMoveItem } from 'utils/common';
import { isStockSymbol, symbolToRoute } from 'utils/market';
import { put, select, take, takeEvery } from 'redux-saga/effects';
import {
  querySymbolData,
  selectWatchlist,
  updateWatchlist,
} from 'redux/global-actions';

function* doInitPriceBoard(request: IAction<IPriceBoardAction | undefined>) {
  const store: IState = yield select((state: IState) => ({
    watchlist: state.watchlist,
    watchlistServer: state.watchlistServer,
    isAuthenticated: state.isAuthenticated,
    config: state.config,
    symbolList: state.symbolList,
    stockList: state.stockList,
    cwList: state.cwList,
    futuresList: state.futuresList,
    selectedWatchlist: state.selectedWatchlist,
    indexStockList: state.indexStockList,
    priceBoard: state.priceBoard,
  }));

  const watchlist = store.isAuthenticated
    ? store.watchlistServer
    : store.watchlist;
  const selectedBoard = utils.getCurrentTab(
    request.payload?.key,
    watchlist,
    store.config.boardTabs
  );
  const selectedSubTab = selectedBoard.selectedSubTab;
  const selectedSymbol =
    store.symbolList.map?.[request.payload?.selectedSymbol ?? ''];
  let symbol: INewSymbolData[];
  let symbolMap: Record<string, INewSymbolData>;
  let payload: IPriceBoardReducer;

  if (
    selectedBoard.key === store.priceBoard.selectedBoard.key &&
    selectedSubTab?.key === store.priceBoard.selectedBoard.selectedSubTab?.key
  ) {
    payload = {
      ...store.priceBoard,
      selectedSymbol,
    };
  } else {
    let selectedWatchlist: IWatchlist | null = null;
    if (selectedBoard.key === 'WATCHLIST') {
      selectedWatchlist =
        watchlist.find((val) => val.id === Number(request.payload?.key)) ??
        null;
      yield put(selectWatchlist(selectedWatchlist));
    }

    symbol = utils.getCurrentSymbols(
      store.symbolList,
      store.stockList,
      store.cwList,
      store.futuresList,
      watchlist,
      selectedWatchlist,
      selectedBoard
    );
    symbolMap = utils.getCurrentSymbolsMap(symbol);
    const indexStock =
      request.payload?.key === BoardMarketRoutes.VN30
        ? IndexStock.VN30
        : request.payload?.key === BoardMarketRoutes.HNX30
        ? IndexStock.HNX30
        : request.payload?.key == null
        ? IndexStock.VN30
        : undefined;
    yield put(
      querySymbolData({
        symbolList: symbol.map((val) => val.s),
        isWatchlist: selectedBoard.key === 'WATCHLIST',
        indexStock,
      })
    );

    if (indexStock != null) {
      yield take(MARKET_QUERY_INDEX_STOCK_LIST_SUCCESS);

      const indexStockList: IState['indexStockList'] = yield select(
        (state: IState) => state.indexStockList
      );

      symbol = indexStockList.map((val) => ({
        s: val,
        ...store.symbolList.map?.[val],
      }));
      symbolMap = utils.getCurrentSymbolsMap(symbol);
    }

    payload = {
      symbol,
      symbolMap,
      selectedBoard,
      selectedSymbol,
    };
  }
  if (request.response != null) {
    yield put<IAction<IPriceBoardReducer>>({
      type: request.response.success,
      payload,
    });
  }
}

function* doSelectSymbolPriceBoard(
  request: IAction<IPriceBoardAction | undefined>
) {
  const store: IState = yield select((state: IState) => ({
    watchlist: state.watchlist,
    watchlistServer: state.watchlistServer,
    isAuthenticated: state.isAuthenticated,
    config: state.config,
    symbolList: state.symbolList,
    stockList: state.stockList,
    cwList: state.cwList,
    futuresList: state.futuresList,
    selectedWatchlist: state.selectedWatchlist,
    indexStockList: state.indexStockList,
    priceBoard: state.priceBoard,
  }));

  const watchlistData = store.isAuthenticated
    ? store.watchlistServer
    : store.watchlist;
  const code = request.payload?.selectedSymbol ?? '';
  const selectedSymbol = store.symbolList.map?.[code];
  let notification: INotification | null = null;
  let { priceBoard } = store;

  if (priceBoard.selectedBoard.key === 'WATCHLIST') {
    let watchlist = watchlistData.find(
      (val) => val.id === Number(priceBoard.selectedBoard.selectedSubTab?.key)
    );
    if (watchlist != null) {
      if (watchlist.data != null) {
        if (watchlist.data.includes(code)) {
          notification = {
            type: ToastType.WARNING,
            title: 'Favorite list',
            content: 'DESTINATION_FAVORITE_LIST_DUPLICATE_SYMBOL',
            contentParams: {
              symbol: code,
              market: store.symbolList.map?.[code].m,
              watchlist: watchlist.name,
            },
            time: new Date(),
          };
        } else {
          watchlist = { ...watchlist, data: [...watchlist.data, code] };
          notification = {
            type: ToastType.SUCCESS,
            title: 'Update Favorite List',
            content: 'DESTINATION_FAVORITE_LIST_UPDATE_NEW_SYMBOL',
            contentParams: {
              symbol: code,
              market: store.symbolList.map?.[code].m,
              watchlist: watchlist.name,
            },
            time: new Date(),
          };
        }
      } else {
        watchlist = { ...watchlist, data: [code] };
        notification = {
          type: ToastType.SUCCESS,
          title: 'Update Favorite List',
          content: 'DESTINATION_FAVORITE_LIST_UPDATE_NEW_SYMBOL',
          contentParams: {
            symbol: code,
            market: store.symbolList.map?.[code].m,
            watchlist: watchlist.name,
          },
          time: new Date(),
        };
      }
      yield put(updateWatchlist(watchlist, notification));
    }
    const newWatchlistData = watchlistData.map((val) =>
      val.id === watchlist?.id ? watchlist : val
    );
    const selectedBoard = utils.getCurrentTab(
      'WATCHLIST',
      newWatchlistData,
      store.config.boardTabs
    );
    const symbol =
      watchlist?.data?.map(
        (val) => store.symbolList.map?.[val] ?? { s: val }
      ) ?? [];
    const symbolMap = utils.getCurrentSymbolsMap(symbol);
    priceBoard = {
      ...priceBoard,
      selectedSymbol,
      symbol,
      symbolMap,
      selectedBoard,
    };
    yield put(
      querySymbolData({
        symbolList: symbol.map((val) => val.s),
        isWatchlist: true,
      })
    );
  } else if (selectedSymbol != null) {
    const symbol = priceBoard.symbol.find((val) => val.s === code);
    if (
      symbol == null ||
      (priceBoard.selectedBoard.key === 'CW' && isStockSymbol(selectedSymbol.t))
    ) {
      yield put(
        initPriceBoard({
          key: symbolToRoute(selectedSymbol),
          selectedSymbol: code,
        })
      );
    } else {
      yield put(
        updatePriceBoard({
          selectedSymbol,
        })
      );
    }
  }
}

function* doUpdateWatchlistBoard(
  request: IAction<{ readonly code: string; readonly newIndex?: number }>
) {
  const store: IState = yield select((state: IState) => ({
    selectedWatchlist: state.selectedWatchlist,
    symbolList: state.symbolList,
  }));

  if (store.selectedWatchlist != null) {
    if (request.payload.newIndex != null) {
      // Update item position
      if (store.selectedWatchlist.data != null) {
        const currentIndex = store.selectedWatchlist.data.findIndex(
          (item) => item === request.payload.code
        );
        if (currentIndex > -1 && currentIndex !== request.payload.newIndex) {
          const data = arrayMoveItem(
            store.selectedWatchlist.data,
            currentIndex,
            request.payload.newIndex
          );
          yield put(
            updateWatchlist(
              { ...store.selectedWatchlist, data },
              {
                type: ToastType.SUCCESS,
                title: 'Update Favorite List',
                content: 'DESTINATION_FAVORITE_LIST_UPDATE_MOVE_SYMBOL',
                contentParams: {},
                time: new Date(),
              }
            )
          );
        }
      }
    } else {
      // Delete item
      const data = store.selectedWatchlist.data?.filter(
        (val) => val !== request.payload.code
      );
      yield put(
        updateWatchlist(
          {
            ...store.selectedWatchlist,
            data,
          },
          {
            type: ToastType.SUCCESS,
            title: 'Update Favorite List',
            content: 'DESTINATION_FAVORITE_LIST_UPDATE_DROP_SYMBOL',
            contentParams: {
              symbol: request.payload.code,
              market: store.symbolList.map?.[request.payload.code].m,
              watchlist: store.selectedWatchlist.name,
            },
            time: new Date(),
          }
        )
      );
    }
  }
}

export function* watchPriceBoardActions() {
  yield takeEvery(BOARD_INIT_PRICE_BOARD, doInitPriceBoard);
  yield takeEvery(BOARD_SELECT_SYMBOL, doSelectSymbolPriceBoard);
  yield takeEvery(BOARD_UPDATE_WATCHLIST_BOARD, doUpdateWatchlistBoard);
}
