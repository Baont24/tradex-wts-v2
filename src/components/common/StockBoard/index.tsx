import * as React from 'react';
import * as _ from 'lodash';
import * as styles from './styles.scss';
import * as utils from './utils';
import { AgGridReact } from 'ag-grid-react';
import { BoardKey, IBoardTab } from 'interfaces/common';
import { BoardRoutes } from 'constants/routes';
import {
  CellDoubleClickedEvent,
  ColDef,
  ColGroupDef,
  ColumnApi,
  ColumnGroupOpenedEvent,
  ColumnState,
  DragStoppedEvent,
  GridApi,
  GridReadyEvent,
  RowDragEndEvent,
  RowHeightParams,
  RowNode,
  SortChangedEvent,
} from 'ag-grid-community';
// import { ColumnState } from 'ag-grid-community/dist/lib/columnController/columnController';
import {
  DEFAULT_COL_DEF,
  DEFAULT_COL_GROUP_DEF,
  getColumnDefs,
} from './config';
import { Fallback } from 'components/common';
import {
  FunctionKey,
  Lang,
  MarketStatus,
  OrderType,
  SellBuyType,
  SpeedOrderClickType,
  SymbolSession,
} from 'constants/enum';
import { INewSymbolData } from 'interfaces/market';
import { IState } from 'redux/global-reducers';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import {
  changeFooterFunction,
  changeSidebarFunction,
} from '../SideBarFunction/actions';
import { connect } from 'react-redux';
import { domainConfig } from 'config/domain';
import { getKey, removeKey, setKey } from 'utils/localStorage';
import { getMinLot } from 'utils/market';
import {
  handleError,
  setColumnConfig,
  translateLocaleText,
} from 'utils/common';
import { setCurrentSymbol, toggleSymbolInfoModal } from 'redux/global-actions';
import { withErrorBoundary } from 'react-error-boundary';
import FooterRow from './FooterRow';
import NoRowsOverlay from './NoRowsOverlay';
import config from 'config';

export interface IColumnConfig {
  readonly key: BoardKey;
  readonly cols?: ColumnState[];
}

const BOARD_KEY = 'BoardKey';

export interface IStockBoardProps
  extends React.ClassAttributes<StockBoardComponent>,
    WithNamespaces {
  readonly symbols: INewSymbolData[];
  readonly symbolsMap: { readonly [s: string]: INewSymbolData };
  readonly selectedTab: IBoardTab;
  readonly selectedRow?: INewSymbolData;
  readonly config: IState['config'];
  readonly marketStatus: IState['marketStatus'];
  readonly newSymbolData: IState['newSymbolData'];
  readonly newSymbolOddlotData: IState['newSymbolOddlotData'];
  readonly boardData: IState['boardData'];
  readonly lang: IState['lang'];
  readonly isDebugging: IState['isDebugging'];
  readonly resetBoardDataTrigger: IState['resetBoardDataTrigger'];
  readonly symbolCachedData: IState['symbolCachedData'];
  readonly symbolOddlotCachedData: IState['symbolOddlotCachedData'];
  readonly selectedAccount: IState['selectedAccount'];
  readonly isAuthenticated: IState['isAuthenticated'];
  readonly router: IState['router'];
  readonly sideBarFunction?: IState['sideBarFunction'];

  readonly onDragEnd?: (stockCode: string, newIndex: number) => void;
  readonly onChangeSortStatus?: (status: boolean) => void;
  readonly stockBoardRef?: (ref: StockBoardComponent) => void;
  readonly onDoubleClick?: () => void;
  readonly onRemoveRow?: (rowNode: RowNode) => void;
  readonly setCurrentSymbol: typeof setCurrentSymbol;
  readonly toggleSymbolInfoModal: typeof toggleSymbolInfoModal;
  readonly changeFooterFunction: typeof changeFooterFunction;
  readonly changeSidebarFunction: typeof changeSidebarFunction;
}

export class StockBoardComponent extends React.Component<IStockBoardProps> {
  private localGridApi?: GridApi;
  private localColumnDefs: Array<ColGroupDef | ColDef>;
  private localColumnApi?: ColumnApi;
  private localPinnedRow?: RowNode[] = [];
  private localTabKey?: BoardKey;
  private localSymbolSession: { [s: string]: SymbolSession };
  private localMarketStatus: { [s: string]: MarketStatus };
  private localTimer: NodeJS.Timeout;
  private localDelay: number = 200;
  private localPrevent: boolean = false;

  constructor(props: IStockBoardProps) {
    super(props);

    this.localColumnDefs = this.getColumnDefs(props.selectedTab.key);

    this.state = {};

    this.localSymbolSession = utils.getMarketStatus(props.marketStatus).session;
    this.localMarketStatus = utils.getMarketStatus(props.marketStatus).status;
  }

  shouldComponentUpdate(nextProps: IStockBoardProps) {
    if (this.props.selectedTab.key !== nextProps.selectedTab.key) {
      this.localColumnDefs = this.getColumnDefs(nextProps.selectedTab.key);
      this.localTabKey = nextProps.selectedTab.key;
      this.localGridApi?.setColumnDefs(this.localColumnDefs);
      this.applyColumnConfig(nextProps.selectedTab.key);
      this.localGridApi?.onFilterChanged();
      this.refreshBoardData();
    }
    if (
      this.props.selectedTab.key === nextProps.selectedTab.key &&
      this.props.selectedTab.selectedSubTab?.key !==
        nextProps.selectedTab.selectedSubTab?.key
    ) {
      this.refreshBoardData();
    }

    if (nextProps.selectedRow !== this.props.selectedRow) {
      this.onScrollToSelectedRow(nextProps.selectedRow);
    }

    if (this.props.boardData !== nextProps.boardData) {
      if (nextProps.boardData.status.isSucceeded) {
        const data = utils.getBoardData(
          nextProps.boardData.data,
          this.props.selectedTab.key,
          this.localMarketStatus,
          this.localSymbolSession
        );
        if (data.length > 0) {
          this.localGridApi?.hideOverlay();
          this.localGridApi?.setRowData([
            ...data,
            {
              s: 'LastRow',
              isLastRow: true,
              content: utils.getLastRowContent(nextProps.selectedTab.key),
            },
          ]);
        } else {
          this.localGridApi?.setRowData([]);
          this.localGridApi?.showNoRowsOverlay();
        }
      } else if (nextProps.boardData.status.isFailed) {
        this.localGridApi?.setRowData([]);
        this.localGridApi?.showNoRowsOverlay();
      } else if (nextProps.boardData.status.isLoading) {
        this.localGridApi?.showLoadingOverlay();
      }

      this.onScrollToSelectedRow(nextProps.selectedRow);
    }

    if (
      (nextProps.newSymbolData != null &&
        this.props.newSymbolData !== nextProps.newSymbolData) ||
      (nextProps.newSymbolOddlotData != null &&
        this.props.newSymbolOddlotData !== nextProps.newSymbolOddlotData)
    ) {
      const symbolData = (this.props.selectedTab.key === 'Oddlot'
        ? nextProps.newSymbolOddlotData
        : nextProps.newSymbolData) as INewSymbolData;
      const cachedData =
        this.props.selectedTab.key === 'Oddlot'
          ? nextProps.symbolOddlotCachedData
          : nextProps.symbolCachedData;

      if (nextProps.symbolsMap[symbolData?.s] != null) {
        const updateNodes = utils.getNewSymbolData(
          this.props.selectedTab.key,
          symbolData,
          cachedData,
          this.localSymbolSession,
          this.localMarketStatus,
          this.localGridApi
        );
        this.localGridApi?.applyTransactionAsync({
          update: updateNodes,
        });

        utils.updatePinnedRowData(
          this.props.selectedTab.key,
          symbolData,
          this.localSymbolSession,
          this.localMarketStatus,
          updateNodes[0],
          this.localPinnedRow,
          this.localGridApi
        );
      }
    }

    if (nextProps.lang !== this.props.lang) {
      const lastRow = this.localGridApi?.getRowNode('LastRow');
      this.localGridApi?.applyTransaction({
        update:
          lastRow != null
            ? [
                {
                  ...lastRow.data,
                  content: utils.getLastRowContent(nextProps.selectedTab.key),
                },
              ]
            : [],
      });
    }

    if (nextProps.marketStatus !== this.props.marketStatus) {
      this.localSymbolSession = utils.getMarketStatus(
        nextProps.marketStatus
      ).session;
      this.localMarketStatus = utils.getMarketStatus(
        nextProps.marketStatus
      ).status;

      if (this.props.isDebugging) {
        console.log(
          'Symbol Session',
          this.localSymbolSession,
          this.localMarketStatus
        );
      }

      this.localGridApi?.forEachLeafNode((rowNode) => {
        const data: INewSymbolData = rowNode.data;
        rowNode.updateData({
          ...data,
          ss: utils.getSymbolSession(
            this.localMarketStatus,
            this.localSymbolSession,
            data,
            data.ss
          ),
        });
      });
    }

    if (nextProps.resetBoardDataTrigger !== this.props.resetBoardDataTrigger) {
      this.refreshBoardData();
    }
    return false;
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeGrid);
    this.props.i18n.off('languageChanged', this.onChangeLang);
  }

  render() {
    const { config } = this.props;
    return (
      <div className={`${styles.StockBoard} ag-theme-balham-dark`}>
        <AgGridReact
          rowData={this.props.symbols}
          onGridReady={this.onGridReady}
          onGridColumnsChanged={this.onGridColumnsChanged}
          localeTextFunc={translateLocaleText}
          onColumnGroupOpened={this.onColumnGroupOpened}
          onColumnVisible={this.onColumnVisible}
          defaultColDef={DEFAULT_COL_DEF}
          defaultColGroupDef={DEFAULT_COL_GROUP_DEF}
          headerHeight={25.5}
          rowHeight={26}
          enableCellExpressions={true}
          getRowHeight={this.getRowHeight}
          getRowNodeId={utils.getRowNodeId}
          asyncTransactionWaitMillis={500}
          cellFlashDelay={config.cellFlashDelay}
          cellFadeDelay={100}
          suppressDragLeaveHidesColumns={true}
          onDragStopped={this.onDragStopped}
          rowBuffer={10}
          enableCellChangeFlash={true}
          rowDragManaged={true}
          onRowDragEnd={this.onRowDragEnd}
          postSort={this.postSort}
          onSortChanged={this.onSort}
          isExternalFilterPresent={this.isExternalFilterPresent}
          doesExternalFilterPass={this.doesExternalFilterPass}
          isFullWidthCell={this.isFullWidthCell}
          fullWidthCellRendererFramework={FooterRow}
          noRowsOverlayComponentFramework={NoRowsOverlay}
        />
      </div>
    );
  }

  resetBoardConfig = (key?: BoardKey) => {
    const colConfigs = getKey<IColumnConfig[]>(BOARD_KEY);
    if (colConfigs != null) {
      this.localColumnDefs = this.getColumnDefs(this.props.selectedTab.key);
      if (key) {
        const data = colConfigs?.filter((val) => val.key !== key) || null;
        if (data != null) {
          setKey<IColumnConfig[]>(BOARD_KEY, data);
        }
      } else {
        removeKey(BOARD_KEY);
      }
      this.localGridApi?.setColumnDefs(this.localColumnDefs);
    }
  };

  refreshBoardData = () => {
    this.localColumnApi?.applyColumnState({});
    this.localGridApi?.setRowData([]);
    // this.localGridApi?.showLoadingOverlay();
    this.localGridApi?.setPinnedTopRowData([]);
    this.localGridApi?.refreshHeader();
    this.localPinnedRow = [];
  };

  private resizeGrid = () => {
    setTimeout(() => {
      this.localGridApi?.sizeColumnsToFit();
    });
  };

  private getRowHeight = (params: RowHeightParams) => {
    if (params.data.isLastRow) {
      return 33;
    }
    return 26;
  };

  private applyColumnConfig = (key: BoardKey) => {
    if (this.localColumnApi) {
      const colConfigs = getKey<IColumnConfig[]>(BOARD_KEY);
      if (colConfigs != null) {
        const config = colConfigs.find((val) => val.key === key);
        if (config && config.cols && config.cols.length) {
          this.localColumnApi.setColumnState(config.cols);
        }
      }
    }
  };

  private isExternalFilterPresent = () => {
    return this.localTabKey !== 'WATCHLIST';
  };

  private isFullWidthCell = (node: RowNode) => {
    return node.data.isLastRow;
  };

  private doesExternalFilterPass = (node: RowNode) => {
    return (
      this.localPinnedRow?.findIndex((val) => val.data?.s === node.id) === -1
    );
  };

  private onChangeLang = (lang: Lang) => {
    setTimeout(() => {
      this.localColumnDefs = this.getColumnDefs(this.props.selectedTab.key);
      this.localGridApi?.setColumnDefs(this.localColumnDefs);
      this.applyColumnConfig(this.props.selectedTab.key);
      this.resizeGrid();
    });
  };

  private onGridReady = (event: GridReadyEvent) => {
    this.localGridApi = event.api;
    this.localColumnApi = event.columnApi;

    event.api.setColumnDefs(this.localColumnDefs);
    this.applyColumnConfig(this.props.selectedTab.key);

    event.api.sizeColumnsToFit();
    window.addEventListener('resize', this.resizeGrid);

    event.api.showLoadingOverlay();

    if (this.props.boardData) {
      const data = utils.getBoardData(
        this.props.boardData.data,
        this.props.selectedTab.key,
        this.localMarketStatus,
        this.localSymbolSession
      );

      if (data.length > 0) {
        event.api.hideOverlay();
        event.api.setRowData([
          ...data,
          {
            s: 'LastRow',
            isLastRow: true,
            content: utils.getLastRowContent(this.props.selectedTab.key),
          },
        ]);
      } else {
        event.api.showNoRowsOverlay();
      }
    }

    this.props.i18n.on('languageChanged', this.onChangeLang);
  };

  private onColumnGroupOpened = (event: ColumnGroupOpenedEvent) => {
    this.resizeGrid();
  };

  private onGridColumnsChanged = () => {
    this.resizeGrid();
  };

  private postSort = (mutableNodes: RowNode[]) => {
    for (const i in mutableNodes) {
      if (mutableNodes[i].data.isLastRow) {
        mutableNodes.push(mutableNodes.splice(+i, 1)[0]);
      }
    }
  };

  private onSort = (event: SortChangedEvent) => {
    event.api.refreshHeader();
    const sortStatus = event.columnApi.getColumnState().length > 0;
    if (this.props.selectedTab.key === 'WATCHLIST') {
      this.props.onChangeSortStatus?.(sortStatus);
    }
  };

  private onDragStopped = (event: DragStoppedEvent) => {
    const cols = event.columnApi.getColumnState();
    setColumnConfig(this.props.selectedTab.key, cols);
  };

  private onColumnVisible = () => {
    this.localGridApi?.refreshHeader();
    this.resizeGrid();
  };

  private onScrollToSelectedRow = (selectedRow?: INewSymbolData) => {
    if (selectedRow) {
      const node = this.localGridApi?.getRowNode(selectedRow.s);
      if (node) {
        this.localGridApi?.ensureIndexVisible(node.rowIndex, 'top');
        this.localGridApi?.setFocusedCell(node.rowIndex || 0, 's');
      }
    }
  };

  private onRowDragEnd = (event: RowDragEndEvent) => {
    this.props.onDragEnd?.(event.node.data.s, event.overIndex);
  };

  private onRemoveRow = (node: RowNode) => {
    if (this.props.onRemoveRow) {
      const deletedRow = node.data;
      this.props.onRemoveRow(node);
      this.localGridApi?.applyTransaction({ remove: [deletedRow] });
    }
  };

  private onPinRow = (node: RowNode) => {
    let count = this.localGridApi?.getPinnedTopRowCount();
    const mutablePinnedRowsData: INewSymbolData[] = [];
    for (let i = 0; i < (count || 0); i++) {
      if (this.localGridApi) {
        mutablePinnedRowsData.push(
          this.localGridApi?.getPinnedTopRow(i)?.data as INewSymbolData
        );
      }
    }
    mutablePinnedRowsData.push(node.data);
    this.localGridApi?.setPinnedTopRowData(mutablePinnedRowsData);

    count = this.localGridApi?.getPinnedTopRowCount();
    const mutablePinnedRows: RowNode[] = [];
    for (let i = 0; i < (count || 0); i++) {
      if (this.localGridApi) {
        mutablePinnedRows.push(this.localGridApi.getPinnedTopRow(i) as RowNode);
      }
    }
    this.localPinnedRow = mutablePinnedRows;
    this.localGridApi?.onFilterChanged();
  };

  private onUnpinRow = (node: RowNode) => {
    let count = this.localGridApi?.getPinnedTopRowCount();
    const mutableUnpinnedRowsData: INewSymbolData[] = [];
    for (let i = 0; i < (count || 0); i++) {
      const rowData = this.localGridApi?.getPinnedTopRow(i)
        ?.data as INewSymbolData;
      if (rowData && rowData.s !== node.data.s && this.localGridApi) {
        mutableUnpinnedRowsData.push(rowData);
      }
    }
    this.localGridApi?.setPinnedTopRowData(mutableUnpinnedRowsData);

    count = this.localGridApi?.getPinnedTopRowCount();
    const mutableUnpinnedRows: RowNode[] = [];
    for (let i = 0; i < (count || 0); i++) {
      if (this.localGridApi) {
        const rowNode = this.localGridApi?.getPinnedTopRow(i);
        if (rowNode !== undefined) {
          mutableUnpinnedRows.push(rowNode);
        }
      }
    }
    this.localPinnedRow = mutableUnpinnedRows;
    this.localGridApi?.onFilterChanged();
  };

  private onCellDoubleClicked = (params: CellDoubleClickedEvent) => {
    if (this.props.selectedAccount == null || !this.props.isAuthenticated) {
      return;
    }
    let orderType = OrderType.LO;
    if (params.value === OrderType.ATC) {
      orderType = OrderType.ATC;
    }
    if (params.value === OrderType.ATO) {
      orderType = OrderType.ATO;
    }
    const data = params.data as INewSymbolData;
    this.props.changeFooterFunction({
      key: this.props.router.includes(BoardRoutes.TRADING_TEMPLATE)
        ? undefined
        : FunctionKey.ORDER,
      orderForm: {
        accountNumber: this.props.selectedAccount.accountNumber,
        orderQuantityType: 'share',
        orderType,
        orderQuantity: getMinLot(data.m, data.t, this.localTabKey === 'Oddlot'),
        sellBuyType: SellBuyType.BUY,
        stockCode: data.s,
        orderPrice:
          params.value === OrderType.ATC || params.value === OrderType.ATO
            ? undefined
            : params.value,
      },
    });
  };

  private onShowSymbolInfo = (
    data: INewSymbolData,
    clickType: SpeedOrderClickType
  ) => {
    const { sideBarFunction } = this.props;
    if (clickType === SpeedOrderClickType.SINGLE_CLICK) {
      this.localTimer = setTimeout(() => {
        if (!this.localPrevent) {
          if (!domainConfig[config.domain]?.isDoubleClickShowChart) {
            if (this.props.router.includes(BoardRoutes.TRADING_TEMPLATE)) {
              this.props.setCurrentSymbol({ code: data.s, forceUpdate: true });
            } else {
              this.props.toggleSymbolInfoModal({
                show: true,
                data,
                symbol: { code: data.s, forceUpdate: true },
              });
            }
          } else if (domainConfig[config.domain]?.isDoubleClickShowChart) {
            if (sideBarFunction?.footerKey !== FunctionKey.ORDER) {
              if (
                sideBarFunction?.key === FunctionKey.DASHBOARD ||
                sideBarFunction?.key == null
              ) {
                this.props.changeSidebarFunction({ key: FunctionKey.INFO });
              }
            }
            this.props.setCurrentSymbol({ code: data.s, forceUpdate: true });
          }
        }
        this.localPrevent = false;
      }, this.localDelay);
    } else if (
      clickType === SpeedOrderClickType.DOUBLE_CLICK &&
      domainConfig[config.domain]?.isDoubleClickShowChart
    ) {
      clearTimeout(this.localTimer);
      this.localPrevent = true;
      if (sideBarFunction?.key === FunctionKey.INFO) {
        this.props.changeSidebarFunction({});
      }
      this.props.toggleSymbolInfoModal({
        show: true,
        data,
        symbol: { code: data.s, forceUpdate: true },
      });
    }
  };

  private getColumnDefs = (key: BoardKey) =>
    getColumnDefs(
      key,
      this.onRemoveRow,
      this.onShowSymbolInfo,
      this.onPinRow,
      this.onUnpinRow,
      this.props.selectedAccount == null || !this.props.isAuthenticated
        ? undefined
        : this.onCellDoubleClicked
    );
}

const mapStateToProps = (state: IState) => ({
  config: state.config,
  newSymbolData: state.newSymbolData,
  newSymbolOddlotData: state.newSymbolOddlotData,
  symbolCachedData: state.symbolCachedData,
  symbolOddlotCachedData: state.symbolOddlotCachedData,
  boardData: state.boardData,
  lang: state.lang,
  marketStatus: state.marketStatus,
  isDebugging: state.isDebugging,
  resetBoardDataTrigger: state.resetBoardDataTrigger,
  selectedAccount: state.selectedAccount,
  isAuthenticated: state.isAuthenticated,
  router: state.router,
  sideBarFunction: state.sideBarFunction,
});

const mapDispatchToProps = {
  setCurrentSymbol,
  toggleSymbolInfoModal,
  changeFooterFunction,
  changeSidebarFunction,
};

const StockBoard = withErrorBoundary(
  withNamespaces('common', {
    innerRef: (ref: StockBoardComponent) => {
      ref?.props.stockBoardRef?.(ref);
    },
  })(
    connect(mapStateToProps, mapDispatchToProps, null, { forwardRef: true })(
      StockBoardComponent
    )
  ),
  Fallback,
  handleError
);

export default StockBoard;
