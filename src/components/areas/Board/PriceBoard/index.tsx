import * as React from 'react';
import * as _ from 'lodash';
import * as styles from './styles.scss';
import * as utils from './utils';
import { BoardKey, IBoardTab } from 'interfaces/common';
import { Fallback, StockBoard } from 'components/common';
import { INDEX_SLIDER_STATE_KEY, MAIN_INDEX_SHOW_COUNT } from 'constants/main';
import { INewSymbolData, ISymbolList } from 'interfaces/market';
import { IState } from 'redux/global-reducers';
import {
  IndexSliderState,
  IndexStock,
  Market,
  RealtimeChannelDataType,
  SocketStatus,
  SymbolType,
} from 'constants/enum';
import { RouteComponentProps, withRouter } from 'react-router';
import { Routes } from 'constants/routes';
import { RowNode } from 'ag-grid-community';
import { StockBoardComponent } from 'components/common/StockBoard';
import { ToastType } from 'react-toastify';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { getIndexStockList } from './actions';
import { getKey, setKey } from 'utils/localStorage';
import { getRefreshPageTime, refreshMarketTimeout } from 'utils/market';
import { handleError, onRowDragEnd } from 'utils/common';
import {
  queryIndexData,
  queryIndexMinutes,
  querySymbolData,
  querySymbolOddlot,
  resetBoardData,
  selectWatchlist,
  showNotification,
  subscribe,
  unsubscribe,
  updateWatchlist,
} from 'redux/global-actions';
import { withErrorBoundary } from 'react-error-boundary';
import BoardFilter from './BoardFilter';
import IndexSlider from './IndexSliderContainer';
import PutThroughBoard from './PutThroughBoard';
import classNames from 'classnames';
import getWatchlist from 'utils/watchlist';

export interface IBoardRouterParams {
  readonly key?: string;
}

interface IBoardProps
  extends React.ClassAttributes<BoardComponent>,
    WithNamespaces,
    RouteComponentProps<IBoardRouterParams> {
  readonly symbolList: IState['symbolList'];
  readonly cwList: IState['cwList'];
  readonly futuresList: IState['futuresList'];
  readonly stockList: IState['stockList'];
  readonly indexList: IState['indexList'];
  readonly indexStockList: IState['indexStockList'];
  readonly watchlist: IState['watchlist'];
  readonly watchlistServer: IState['watchlistServer'];
  readonly watchlistData: IState['watchlistData'];
  readonly resetMarketDataTrigger: IState['resetMarketDataTrigger'];
  readonly resetBoardDataTrigger: IState['resetBoardDataTrigger'];
  readonly socketStatus: IState['socketStatus'];
  readonly resetRouter: IState['resetRouter'];
  readonly selectedWatchlist: IState['selectedWatchlist'];
  readonly config: IState['config'];

  readonly getIndexStockList: typeof getIndexStockList;
  readonly updateWatchlist: typeof updateWatchlist;
  readonly selectWatchlist: typeof selectWatchlist;
  readonly showNotification: typeof showNotification;
  readonly querySymbolData: typeof querySymbolData;
  readonly querySymbolOddlot: typeof querySymbolOddlot;
  readonly queryIndexData: typeof queryIndexData;
  readonly queryIndexMinutes: typeof queryIndexMinutes;
  readonly subscribe: typeof subscribe;
  readonly unsubscribe: typeof unsubscribe;
  readonly resetBoardData: typeof resetBoardData;
}

interface IBoardState {
  readonly indexSliderState: IndexSliderState;
  readonly indexSliderLength: number;
  readonly selectedTab: IBoardTab;
  readonly selectedRow?: INewSymbolData;
  readonly symbolSearchValue?: string;
  readonly symbols: INewSymbolData[];
  readonly symbolsMap: { readonly [s: string]: INewSymbolData };
  readonly isSorted: boolean; // This is for suppress row drag
  readonly isRemovingRow?: boolean; // To stop trigger reload board data when change selected watchlist
}

class BoardComponent extends React.Component<IBoardProps, IBoardState> {
  private localStockBoardRef?: StockBoardComponent;
  private boardRef: React.RefObject<HTMLDivElement>;
  private localRefreshMarket: NodeJS.Timeout;
  private localRefreshPage: NodeJS.Timeout;

  constructor(props: IBoardProps) {
    super(props);

    const indexSliderState = getKey<IndexSliderState>(INDEX_SLIDER_STATE_KEY);
    const selectedTab = utils.getCurrentTab(
      props.match.params.key,
      this.getWatchList(props),
      props.config.boardTabs
    );
    const symbols = utils.getCurrentSymbols(
      props.symbolList,
      props.stockList,
      props.cwList,
      props.futuresList,
      this.getWatchList(props),
      props.selectedWatchlist,
      selectedTab
    );

    this.state = {
      indexSliderState:
        indexSliderState != null ? indexSliderState : IndexSliderState.SHOW,
      selectedTab,
      indexSliderLength: this.getIndexLength(window.innerWidth),
      symbols,
      symbolsMap: utils.getCurrentSymbolsMap(symbols),
      isSorted: false,
    };

    this.boardRef = React.createRef();
  }

  componentDidMount() {
    this.queryData(
      this.state.symbols,
      this.props.symbolList,
      undefined,
      this.state.selectedTab.selectedSubTab?.key.split('-')[1] ===
        SymbolType.INDEX
        ? (this.state.selectedTab.selectedSubTab?.key.split(
            '-'
          )[0] as IndexStock)
        : undefined,
      this.state.selectedTab.key === 'Oddlot',
      this.state.selectedTab.key === 'WATCHLIST'
    );

    this.queryIndexData(this.state.indexSliderState, this.props.indexList);

    this.setRefreshBoardTimeout(refreshMarketTimeout());

    if (this.props.config.schedules.refreshPage != null) {
      this.localRefreshPage = setTimeout(() => {
        console.warn('trigger schedule to reset page');
        window.location.reload();
      }, getRefreshPageTime());
    }

    window.addEventListener('resize', this.onWindowResize);
  }

  componentDidUpdate(prevProps: IBoardProps, prevState: IBoardState) {
    const prevWatchlist = this.getWatchList(prevProps);
    const watchlist = this.getWatchList(this.props);

    if (
      this.state.selectedTab.key === 'WATCHLIST' &&
      prevProps.selectedWatchlist &&
      prevWatchlist !== watchlist &&
      prevWatchlist.length !== watchlist.length
    ) {
      const deletedWatchlist = _.difference(prevWatchlist, watchlist);
      const addedWatchlist = _.difference(watchlist, prevWatchlist);
      if (
        (deletedWatchlist[0] != null &&
          deletedWatchlist[0].id === prevProps.selectedWatchlist.id) ||
        prevWatchlist.length === 0
      ) {
        this.onChangeTab('WATCHLIST', watchlist[0]?.id);
      }

      if (addedWatchlist[0] != null) {
        this.onChangeTab('WATCHLIST', addedWatchlist[0].id);
      }
    }

    if (this.props.indexList !== prevProps.indexList) {
      this.queryIndexData(
        this.state.indexSliderState,
        this.props.indexList,
        prevProps.indexList
      );
    }

    if (
      this.state.selectedTab !== prevState.selectedTab ||
      (this.state.selectedTab.key === 'WATCHLIST' &&
        prevProps.selectedWatchlist?.id === this.props.selectedWatchlist?.id &&
        !this.state.isRemovingRow &&
        ((prevProps.selectedWatchlist?.data == null &&
          this.props.selectedWatchlist?.data != null) ||
          (prevProps.selectedWatchlist?.data != null &&
            this.props.selectedWatchlist?.data != null &&
            this.props.selectedWatchlist.data !==
              prevProps.selectedWatchlist.data) ||
          this.props.watchlistServer !== prevProps.watchlistServer))
    ) {
      const symbols = utils.getCurrentSymbols(
        this.props.symbolList,
        this.props.stockList,
        this.props.cwList,
        this.props.futuresList,
        this.getWatchList(this.props),
        this.props.selectedWatchlist,
        this.state.selectedTab
      );

      this.queryData(
        symbols,
        this.props.symbolList,
        this.state.symbols,
        this.state.selectedTab.selectedSubTab?.key.split('-')[1] ===
          SymbolType.INDEX
          ? (this.state.selectedTab.selectedSubTab?.key.split(
              '-'
            )[0] as IndexStock)
          : undefined,
        this.state.selectedTab.key === 'Oddlot',
        this.state.selectedTab.key === 'WATCHLIST'
      );

      this.setState({
        symbols,
        symbolsMap: utils.getCurrentSymbolsMap(symbols),
      });
    }

    if (
      this.state.selectedTab.key === 'WATCHLIST' &&
      this.props.selectedWatchlist !== prevProps.selectedWatchlist &&
      this.state.isRemovingRow
    ) {
      this.setState({ isRemovingRow: false });
    }

    if (this.props.indexStockList !== prevProps.indexStockList) {
      const nextSymbols = this.props.indexStockList.map((val) => ({
        s: val,
        ...this.props.symbolList.map?.[val],
      }));

      this.props.subscribe({
        symbolList: nextSymbols,
        types: [
          RealtimeChannelDataType.QUOTE,
          RealtimeChannelDataType.BID_OFFER,
          RealtimeChannelDataType.EXTRA,
        ],
      });

      this.setState({
        symbols: nextSymbols,
        symbolsMap: utils.getCurrentSymbolsMap(nextSymbols),
      });
    }

    if (
      this.props.match !== prevProps.match &&
      this.props.match.url !== prevProps.match.url
    ) {
      const selectedTab = utils.getCurrentTab(
        this.props.match.params.key,
        this.getWatchList(this.props),
        this.props.config.boardTabs
      );
      this.setState({
        selectedTab,
      });
    }

    if (
      this.props.socketStatus !== prevProps.socketStatus &&
      prevProps.socketStatus === SocketStatus.CONNECTING &&
      this.props.socketStatus === SocketStatus.CONNECTED
    ) {
      this.props.resetBoardData();
    }

    if (
      this.props.symbolList !== prevProps.symbolList || // Trigger by this.props.resetMarketDataTrigger
      this.props.resetBoardDataTrigger !== prevProps.resetBoardDataTrigger ||
      this.props.resetRouter !== prevProps.resetRouter
    ) {
      this.refreshBoardData();
    }

    if (prevState.indexSliderState !== this.state.indexSliderState) {
      if (this.state.indexSliderState === IndexSliderState.SHOW) {
        this.queryIndexData(this.state.indexSliderState, this.props.indexList);
      } else if (this.state.indexSliderState === IndexSliderState.HIDE) {
        this.props.unsubscribe({
          symbolList: this.props.indexList,
          types: [RealtimeChannelDataType.QUOTE, RealtimeChannelDataType.EXTRA],
          symbolType: SymbolType.INDEX,
        });
      }
    }
  }

  componentWillUnmount() {
    this.props.unsubscribe({
      symbolList: this.state.symbols,
      types: [
        RealtimeChannelDataType.QUOTE,
        RealtimeChannelDataType.BID_OFFER,
        RealtimeChannelDataType.EXTRA,
      ],
    });

    this.props.unsubscribe({
      symbolList: this.props.indexList,
      types: [RealtimeChannelDataType.QUOTE, RealtimeChannelDataType.EXTRA],
      symbolType: SymbolType.INDEX,
    });

    clearTimeout(this.localRefreshMarket);
    if (this.localRefreshPage != null) {
      clearTimeout(this.localRefreshPage);
    }

    window.removeEventListener('resize', this.onWindowResize);
  }

  render() {
    return (
      <div className={styles.Board} ref={this.boardRef}>
        {this.state.indexSliderState === IndexSliderState.SHOW ||
        this.state.indexSliderState === IndexSliderState.HALF_SHOW ? (
          this.props.config.hideAllIndexChart ? null : (
            <IndexSlider
              indexSliderState={this.state.indexSliderState}
              indexSliderLength={this.state.indexSliderLength}
            />
          )
        ) : null}
        <BoardFilter
          symbols={this.state.symbols}
          indexSliderState={this.state.indexSliderState}
          selectedTab={this.state.selectedTab}
          onToggleIndex={this.onToggleIndex}
          onChangeTab={this.onChangeTab}
          resetBoardConfig={this.localStockBoardRef?.resetBoardConfig}
          onChangeSelectedRow={this.onChangeSelectedRow}
        />
        <div
          className={classNames(styles.BoardSection, {
            // Those classes are used for controlling rowDrag when sorting
            [styles.SuppressRowDrag]: this.state.isSorted,
            [styles.AllowRowDrag]: !this.state.isSorted,
          })}
        >
          {this.state.selectedTab.key === 'PutThrough' ? (
            <PutThroughBoard
              market={this.state.selectedTab.selectedSubTab?.key as Market}
            />
          ) : (
            <StockBoard
              symbols={this.state.symbols}
              symbolsMap={this.state.symbolsMap}
              selectedTab={this.state.selectedTab}
              selectedRow={this.state.selectedRow}
              onRemoveRow={this.onRemoveRow}
              stockBoardRef={this.setStockBoardRef}
              onDragEnd={this.onRowDragEnd}
              onChangeSortStatus={this.onChangeSortStatus}
            />
          )}
        </div>
      </div>
    );
  }

  private getWatchList = (props?: IBoardProps) =>
    getWatchlist(props != null ? props : this.props);

  private setStockBoardRef = (ref: StockBoardComponent) => {
    this.localStockBoardRef = ref;
  };

  private setRefreshBoardTimeout = (time: number) => {
    this.localRefreshMarket = setTimeout(() => {
      this.props.resetBoardData();
      clearTimeout(this.localRefreshMarket);
      this.setRefreshBoardTimeout(refreshMarketTimeout());
    }, time);
  };

  private queryData = (
    symbols: INewSymbolData[],
    symbolList: ISymbolList,
    prevSymbols?: INewSymbolData[],
    indexStock?: IndexStock,
    isOddlot?: boolean,
    isWatchlist?: boolean
  ) => {
    if (symbolList.map != null) {
      if (isOddlot) {
        this.props.querySymbolOddlot({
          symbolList: symbols.map((val) => val.s),
        });
      } else {
        this.props.querySymbolData({
          symbolList: symbols.map((val) => val.s),
          indexStock,
          isWatchlist,
        });
      }

      if (prevSymbols != null) {
        if (prevSymbols.length > 0) {
          this.props.unsubscribe({
            symbolList: prevSymbols,
            types: [
              RealtimeChannelDataType.QUOTE,
              RealtimeChannelDataType.BID_OFFER,
              RealtimeChannelDataType.EXTRA,
            ],
          });
        }
      }

      if (symbols.length > 0) {
        this.props.subscribe({
          symbolList: symbols,
          types: [
            RealtimeChannelDataType.QUOTE,
            RealtimeChannelDataType.BID_OFFER,
            RealtimeChannelDataType.EXTRA,
          ],
          isOddlot,
        });
      }
    }
  };

  private queryIndexData = (
    indexSliderState: IndexSliderState,
    indexList: INewSymbolData[],
    prevIndexList?: INewSymbolData[]
  ) => {
    if (indexSliderState !== IndexSliderState.HIDE) {
      if (indexList.length > 0) {
        this.props.queryIndexData({
          indexType: 'main-index-slider',
          symbolList: indexList
            .filter((index) => index.i && index.it === 'D')
            .map((el) => el.s)
            .slice(0, MAIN_INDEX_SHOW_COUNT),
        });
        if (prevIndexList != null) {
          this.props.unsubscribe({
            symbolList: prevIndexList,
            types: [
              RealtimeChannelDataType.QUOTE,
              RealtimeChannelDataType.EXTRA,
            ],
            symbolType: SymbolType.INDEX,
          });
        }

        this.props.subscribe({
          symbolList: indexList
            .filter((el) => el.i && el.it === 'D')
            .slice(0, this.state.indexSliderLength),
          types: [RealtimeChannelDataType.QUOTE, RealtimeChannelDataType.EXTRA],
          symbolType: SymbolType.INDEX,
        });
      }
    }
  };

  private refreshBoardData = () => {
    const symbols = this.state.symbols.map((val) => ({
      ...val,
      ...this.props.symbolList.map?.[val.s],
    }));
    this.setState(
      { symbols, symbolsMap: utils.getCurrentSymbolsMap(symbols) },
      () => {
        this.queryData(
          this.state.symbols,
          this.props.symbolList,
          this.state.symbols,
          this.state.selectedTab.selectedSubTab?.key.split('-')[1] ===
            SymbolType.INDEX
            ? (this.state.selectedTab.selectedSubTab?.key.split(
                '-'
              )[0] as IndexStock)
            : undefined,
          this.state.selectedTab.key === 'Oddlot',
          this.state.selectedTab.key === 'WATCHLIST'
        );
        this.queryIndexData(
          this.state.indexSliderState,
          this.props.indexList,
          this.props.indexList
        );
      }
    );
  };

  private onToggleIndex = () => {
    if (this.state.indexSliderState === IndexSliderState.SHOW) {
      this.setState({ indexSliderState: IndexSliderState.HALF_SHOW }, () => {
        setKey(INDEX_SLIDER_STATE_KEY, IndexSliderState.HALF_SHOW);
      });
    } else if (this.state.indexSliderState === IndexSliderState.HALF_SHOW) {
      this.setState({ indexSliderState: IndexSliderState.HIDE }, () => {
        setKey(INDEX_SLIDER_STATE_KEY, IndexSliderState.HIDE);
      });
    } else {
      this.setState({ indexSliderState: IndexSliderState.SHOW }, () => {
        setKey(INDEX_SLIDER_STATE_KEY, IndexSliderState.SHOW);
      });
    }
  };

  private onChangeTab = (
    key: BoardKey,
    subTabKey?: string | number,
    searchValue?: INewSymbolData
  ) => {
    const { boardTabs } = this.props.config;
    const selectedTab =
      boardTabs.find((val) => val.key === key) || boardTabs[0];
    const watchlist = this.getWatchList().find((val) => val.id === subTabKey);
    let selectedSubTab =
      subTabKey != null
        ? selectedTab.data?.find((val) => val.key === subTabKey)
        : selectedTab.data?.[0];

    if (key === 'WATCHLIST') {
      if (watchlist != null) {
        selectedSubTab = {
          title: watchlist.name,
          key: watchlist.id.toString(),
          route: watchlist.id.toString(),
        };
      }
    }

    if (
      searchValue?.t === SymbolType.FUTURES &&
      searchValue?.bs === SymbolType.BOND &&
      this.state.selectedTab.key !== 'WATCHLIST'
    ) {
      selectedSubTab = selectedTab.data?.[1];
    }
    this.setState(
      {
        selectedTab: { ...selectedTab, selectedSubTab },
        selectedRow: searchValue,
      },
      () => {
        const path = `/${Routes.BOARD}/${
          selectedSubTab?.route || selectedTab.route || ''
        }${this.props.location.search}`;
        this.props.history.push(path);
        if (watchlist != null) {
          this.props.selectWatchlist(watchlist);
        }
      }
    );
  };

  private onChangeSelectedRow = (searchValue: INewSymbolData) => {
    this.setState({ selectedRow: searchValue });
  };

  private onRowDragEnd = (stockCode: string, newIndex: number) => {
    onRowDragEnd(stockCode, newIndex, this.props.selectedWatchlist);
  };

  private onRemoveRow = (node: RowNode) => {
    if (this.props.selectedWatchlist != null) {
      const data = this.props.selectedWatchlist?.data?.filter(
        (val) => val !== node.data.s
      );
      this.props.updateWatchlist(
        {
          ...this.props.selectedWatchlist,
          data,
        },
        {
          type: ToastType.SUCCESS,
          title: 'Update Favorite List',
          content: 'DESTINATION_FAVORITE_LIST_UPDATE_DROP_SYMBOL',
          contentParams: {
            symbol: node.data.s,
            market: node.data.m,
            watchlist: this.props.selectedWatchlist.name,
          },
          time: new Date(),
        }
      );
      this.setState({ isRemovingRow: true });
    }
  };

  private onChangeSortStatus = (status: boolean) => {
    if (!this.state.isSorted && status) {
      this.props.showNotification({
        type: ToastType.WARNING,
        title: 'Watchlist',
        content: this.props.t('SORT_ERROR'),
        time: new Date(),
      });
    }
    this.setState({ isSorted: status });
  };

  private getIndexLength = (innerWidth: number) =>
    innerWidth <= 720 ? 2 : innerWidth <= 1200 ? 3 : innerWidth <= 1440 ? 4 : 5;

  private onWindowResize = () => {
    this.setState({
      indexSliderLength: this.getIndexLength(window.innerWidth),
    });
  };
}

const mapStateToProps = (state: IState) => ({
  symbolList: state.symbolList,
  cwList: state.cwList,
  futuresList: state.futuresList,
  stockList: state.stockList,
  indexList: state.indexList,
  indexStockList: state.indexStockList,
  watchlist: state.watchlist,
  watchlistServer: state.watchlistServer,
  selectedWatchlist: state.selectedWatchlist,
  resetMarketDataTrigger: state.resetMarketDataTrigger,
  resetBoardDataTrigger: state.resetBoardDataTrigger,
  socketStatus: state.socketStatus,
  resetRouter: state.resetRouter,
  config: state.config,
  watchlistData: state.watchlistData,
});

const mapDispatchToProps = {
  getIndexStockList,
  selectWatchlist,
  updateWatchlist,
  showNotification,
  querySymbolData,
  querySymbolOddlot,
  subscribe,
  unsubscribe,
  queryIndexData,
  queryIndexMinutes,
  resetBoardData,
};

const Board = withRouter(
  withErrorBoundary(
    withNamespaces(['common'], { wait: true })(
      connect(mapStateToProps, mapDispatchToProps)(BoardComponent)
    ),
    Fallback,
    handleError
  )
);

export default Board;
