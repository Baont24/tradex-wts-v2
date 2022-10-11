import * as React from 'react';
import * as classNames from 'classnames';
import * as styles from './styles.scss';
import { AgGridReact } from 'ag-grid-react';
import {
  ColGroupDef,
  DragStoppedEvent,
  GridApi,
  GridReadyEvent,
  RowDragEndEvent,
  RowNode,
} from 'ag-grid-community';
import { Dropdown, Fallback, SymbolSearch } from 'components/common';
import {
  FaCaretDown,
  FaCaretUp,
  FaCheck,
  FaPen,
  FaPlus,
  FaTrashAlt,
} from 'react-icons/fa';
import { IColDef, INotification, IWatchlist } from 'interfaces/common';
import { INewSymbolData } from 'interfaces/market';
import { IState } from 'redux/global-reducers';
import { ISymbolInfoProps } from 'components/common/SymbolInfo';
import { ToastType } from 'react-toastify';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import {
  addWatchlist,
  deleteWatchlist,
  getSymbolDataWatchlist,
  selectWatchlist,
  showNotification,
  updateWatchlist,
} from 'redux/global-actions';
import { connect } from 'react-redux';
import { getColumnDefs } from './config';
import {
  handleError,
  onRowDragEnd,
  setColumnConfig,
  translateLocaleText,
  truncateText,
} from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';
import getWatchlist from 'utils/watchlist';

export interface IWatchlistBoardProps
  extends React.ClassAttributes<WatchlistBoardComponent>,
    WithNamespaces {
  readonly symbolList: IState['symbolList'];
  readonly watchlist: IState['watchlist'];
  readonly watchlistServer: IState['watchlistServer'];
  readonly selectedWatchlist: IState['selectedWatchlist'];
  readonly watchlistData: IState['watchlistData'];
  readonly newSymbolData: IState['newSymbolData'];
  readonly lang: IState['lang'];
  readonly symbolCachedData: IState['symbolCachedData'];
  readonly config: IState['config'];
  readonly collapsed?: boolean;

  readonly updateWatchlist: typeof updateWatchlist;
  readonly selectWatchlist: typeof selectWatchlist;
  readonly showNotification: typeof showNotification;
  readonly getSymbolDataWatchlist: typeof getSymbolDataWatchlist;
  readonly deleteWatchlist: typeof deleteWatchlist;
  readonly addWatchlist: typeof addWatchlist;
  readonly onCollapse: () => void;
}

export interface IWatchlistBoardState {
  readonly columnDefs: Array<ColGroupDef | IColDef<INewSymbolData>>;
  readonly editedWatchlist?: IWatchlist;
  readonly newWatchlistName?: string;
}

class WatchlistBoardComponent extends React.Component<
  IWatchlistBoardProps,
  IWatchlistBoardState
> {
  private localGridApi?: GridApi;
  private watchlistInputRef: React.RefObject<HTMLInputElement>;
  private localWatchlist: IWatchlist[];

  constructor(props: IWatchlistBoardProps) {
    super(props);

    this.state = {
      columnDefs: getColumnDefs(this.onRemoveRow),
    };
    this.watchlistInputRef = React.createRef();
  }

  componentDidMount() {
    if (this.props.selectedWatchlist?.data) {
      this.props.getSymbolDataWatchlist({
        symbolList: this.props.selectedWatchlist.data,
      });
    }
    this.localWatchlist = this.getWatchList();
  }

  shouldComponentUpdate(nextProps: IWatchlistBoardProps) {
    if (this.props.selectedWatchlist !== nextProps.selectedWatchlist) {
      this.localGridApi?.setRowData(
        nextProps.selectedWatchlist?.data?.map(
          (val) => this.props.symbolList.map?.[val] || { s: val }
        ) || []
      );
      this.localGridApi?.setRowData(this.props.watchlistData.data);
    }

    if (this.props.watchlistData !== nextProps.watchlistData) {
      if (nextProps.watchlistData.status.isSucceeded) {
        this.localGridApi?.hideOverlay();
        this.localGridApi?.setRowData(nextProps.watchlistData.data);
      } else if (nextProps.watchlistData.status.isLoading) {
        this.localGridApi?.showLoadingOverlay();
      } else if (nextProps.watchlistData.status.isFailed) {
        this.localGridApi?.hideOverlay();
      }
    }

    if (
      nextProps.newSymbolData &&
      this.props.newSymbolData !== nextProps.newSymbolData &&
      this.props.selectedWatchlist?.data?.includes(
        nextProps.newSymbolData.s || ''
      ) &&
      nextProps.symbolCachedData[nextProps.newSymbolData.s]
    ) {
      this.localGridApi?.applyTransactionAsync({
        update: [nextProps.symbolCachedData[nextProps.newSymbolData.s]],
      });
    }

    if (this.props.lang !== nextProps.lang) {
      this.localGridApi?.setColumnDefs(getColumnDefs(this.onRemoveRow));
    }

    return true;
  }

  render() {
    const { t, config } = this.props;
    this.localWatchlist = this.getWatchList();

    const watchlistDropdown = this.getWatchList().map((val) => ({
      title: val.name,
      value: val.id.toString(),
    }));
    const watchlistPlaceholder =
      watchlistDropdown.length > 0
        ? this.props.selectedWatchlist
          ? this.props.selectedWatchlist.name
          : t('Watchlist name')
        : t('No Watchlist');
    return (
      <div className={styles.WatchlistBoard}>
        <div className={styles.Header}>
          <div className={styles.Left}>
            <div className={styles.WatchlistItem}>
              <Dropdown
                data={watchlistDropdown}
                placeholder={watchlistPlaceholder}
                onBlur={this.onBlurWatchlist}
                activeItem={this.props.selectedWatchlist?.id.toString()}
              >
                {this.localWatchlist.map((val, idx) => {
                  const onClickSelect = () => {
                    return this.props.selectWatchlist(val);
                  };

                  const onClickEdit = () =>
                    this.onEditWatchlist(
                      val.id,
                      val.name,
                      val.data,
                      val.isServer
                    );
                  const onClickDelete = () => this.onDeleteWatchlist(val.id);
                  return (
                    <div
                      className={classNames(styles.WatchlistIcon, {
                        [styles.WatchlistItemSelected]:
                          this.props.selectedWatchlist?.id === val.id,
                      })}
                      key={idx}
                    >
                      {this.state.editedWatchlist?.id === val.id ? (
                        <div className={styles.WatchlistForm}>
                          <input
                            className={styles.WatchlistInput}
                            type="text"
                            autoFocus={true}
                            placeholder={t('Edit Watchlist')}
                            onChange={this.onWatchlistInputChange}
                            value={this.state.editedWatchlist?.name || ''}
                            onKeyDown={this.onEnterWatchlist}
                            ref={this.watchlistInputRef}
                          />
                          <div className={styles.Icons}>
                            <FaCheck onClick={this.onSaveWatchlist} />
                          </div>
                        </div>
                      ) : (
                        <>
                          <span
                            className={styles.WatchlistName}
                            onClick={onClickSelect}
                          >
                            {truncateText(val.name, 20)}
                          </span>
                          <span className={styles.WatchlistTools}>
                            <span className={styles.Icon} onClick={onClickEdit}>
                              <FaPen />
                            </span>
                            <span
                              className={styles.Icon}
                              onClick={onClickDelete}
                            >
                              <FaTrashAlt />
                            </span>
                          </span>
                        </>
                      )}
                    </div>
                  );
                })}
                {config.watchlist.serverSupportAdd && (
                  <div className={styles.WatchlistForm}>
                    <input
                      className={styles.WatchlistInput}
                      type="text"
                      autoFocus={true}
                      placeholder={t('New Watchlist')}
                      onChange={this.onWatchlistInputChange}
                      value={this.state.newWatchlistName || ''}
                      onKeyDown={this.onEnterWatchlist}
                    />
                    <div className={styles.Icons}>
                      <FaPlus onClick={this.onAddWatchlist} />
                    </div>
                  </div>
                )}
              </Dropdown>
            </div>
            <div className={styles.WatchlistItem}>
              <SymbolSearch
                icon={false}
                placeholder={t('Add symbol 1')}
                onSymbolSearch={this.onAddSymbol}
              />
            </div>
          </div>
          <div className={styles.Right}>
            <div className={styles.WatchlistItem}>
              <div
                className={styles.CollapseButton}
                onClick={this.props.onCollapse}
              >
                {this.props.collapsed ? <FaCaretDown /> : <FaCaretUp />}
              </div>
            </div>
          </div>
        </div>
        <div className={`${styles.Content} ag-theme-balham-dark`}>
          <AgGridReact
            columnDefs={this.state.columnDefs}
            onGridReady={this.onGridReady}
            localeTextFunc={translateLocaleText}
            rowHeight={26}
            headerHeight={26}
            alwaysShowVerticalScroll={false}
            enableCellExpressions={true}
            suppressDragLeaveHidesColumns={true}
            enableCellChangeFlash={true}
            suppressMovableColumns={true}
            suppressHorizontalScroll={true}
            rowBuffer={5}
            getRowNodeId={this.getRowNodeId}
            // suppressRowClickSelection={true}
            rowMultiSelectWithClick={true}
            onRowDragEnd={this.onRowDragEnd}
            onDragStopped={this.onDragStopped}
            rowDragManaged={true}
          />
        </div>
      </div>
    );
  }

  private onDragStopped = (event: DragStoppedEvent) => {
    const cols = event.columnApi.getColumnState();
    setColumnConfig('WATCHLIST', cols);
  };

  private onRowDragEnd = (event: RowDragEndEvent) => {
    onRowDragEnd(
      event.node.data.s,
      event.overIndex,
      this.props.selectedWatchlist
    );
  };

  private getWatchList = (props?: ISymbolInfoProps) =>
    getWatchlist(props != null ? props : this.props);

  private onAddWatchlist = () => {
    if (this.state.newWatchlistName?.trim()) {
      const watchlist = this.getWatchList().findIndex(
        (val) => val.name.trim() === this.state.newWatchlistName?.trim()
      );
      if (watchlist === -1) {
        const id = new Date().getTime();
        const name = this.state.newWatchlistName;
        this.setState({ newWatchlistName: undefined }, () => {
          this.props.addWatchlist(
            { id, name },
            {
              type: ToastType.SUCCESS,
              title: 'Add New Favorite List',
              content: 'DESTINATION_FAVORITE_LIST_ADD',
              contentParams: {},
              time: new Date(),
            }
          );
        });
      } else {
        this.props.showNotification({
          type: ToastType.WARNING,
          title: 'Favorite list',
          content: 'The favorite name already exists in this favorite lists',
          time: new Date(),
        });
      }
    }
  };

  private onAddSymbol = (code: string | null) => {
    if (code && this.props.selectedWatchlist) {
      let watchlist = this.getWatchList().find(
        (val) => val.id === this.props.selectedWatchlist?.id
      );
      let noti: INotification | null = null;
      if (watchlist != null) {
        if (watchlist.data != null) {
          if (watchlist.data.includes(code)) {
            noti = {
              type: ToastType.WARNING,
              title: 'Favorite list',
              content: 'DESTINATION_FAVORITE_LIST_DUPLICATE_SYMBOL',
              contentParams: {
                symbol: code,
                market: this.props.symbolList.map?.[code].m,
                watchlist: watchlist.name,
              },

              time: new Date(),
            };
          } else {
            watchlist = { ...watchlist, data: [...watchlist.data, code] };
            noti = {
              type: ToastType.SUCCESS,
              title: 'Update Favorite List',
              content: 'DESTINATION_FAVORITE_LIST_UPDATE_NEW_SYMBOL',
              contentParams: {
                symbol: code,
                market: this.props.symbolList.map?.[code].m,
                watchlist: watchlist.name,
              },
              time: new Date(),
            };
          }
        } else {
          watchlist = { ...watchlist, data: [code] };
          noti = {
            type: ToastType.SUCCESS,
            title: 'Update Favorite List',
            content: 'DESTINATION_FAVORITE_LIST_UPDATE_NEW_SYMBOL',
            contentParams: {
              symbol: code,
              market: this.props.symbolList.map?.[code].m,
              watchlist: watchlist.name,
            },
            time: new Date(),
          };
        }
        this.props.updateWatchlist(watchlist, noti);
      }
    } else {
      this.props.showNotification({
        type: ToastType.WARNING,
        title: 'Favorite list',
        content: 'The favorite name is empty !',
        time: new Date(),
      });
    }
  };

  private onBlurWatchlist = () => {
    this.setState({ editedWatchlist: undefined, newWatchlistName: undefined });
  };

  private onSaveWatchlist = () => {
    if (this.state.editedWatchlist?.name.trim()) {
      const editedWatchlist = this.getWatchList().find(
        (val) => val.id === this.state.editedWatchlist?.id
      );
      if (
        editedWatchlist?.name.trim() === this.state.editedWatchlist?.name.trim()
      ) {
        this.setState({ editedWatchlist: undefined });
      } else {
        const watchlist = this.getWatchList().findIndex(
          (val) => val.name.trim() === this.state.editedWatchlist?.name.trim()
        );
        if (watchlist === -1) {
          this.props.updateWatchlist(
            {
              id: this.state.editedWatchlist.id,
              name: this.state.editedWatchlist.name,
              isServer: this.state.editedWatchlist.isServer,
              data: this.state.editedWatchlist.data ?? [],
            },
            {
              type: ToastType.SUCCESS,
              title: 'Update Favorite List',
              content: 'DESTINATION_FAVORITE_LIST_UPDATE_NAME',
              contentParams: {},
              time: new Date(),
            }
          );
          this.setState({ editedWatchlist: undefined });
        } else {
          this.props.showNotification({
            type: ToastType.WARNING,
            title: 'Favorite list',
            content: 'The favorite name already exists in this favorite lists',
            time: new Date(),
          });
        }
      }
    } else {
      this.setState({ editedWatchlist: undefined });
    }
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
    }
    this.localGridApi?.applyTransaction({ remove: [node.data] });
  };
  private onDeleteWatchlist = (id: number) => {
    this.props.deleteWatchlist(
      { id },
      {
        type: ToastType.SUCCESS,
        title: 'Delete Favorite List',
        content: 'DESTINATION_FAVORITE_LIST_DELETE',
        contentParams: {},
        time: new Date(),
      }
    );
    this.setState({
      editedWatchlist: undefined,
    });
  };

  private onEditWatchlist = (
    id: number,
    name: string,
    data?: string[],
    isServer?: boolean
  ) => {
    console.log('onEditWatchlist', id, name, data, isServer);
    this.setState({ editedWatchlist: { id, name, data, isServer } }, () => {
      this.watchlistInputRef.current?.focus();
    });
  };

  private onWatchlistInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { value } = event.target;
    if (this.state.editedWatchlist) {
      this.setState({
        editedWatchlist: { ...this.state.editedWatchlist, name: value },
      });
    } else {
      this.setState({ newWatchlistName: value });
    }
  };

  private onEnterWatchlist = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      if (this.state.editedWatchlist) {
        this.onSaveWatchlist();
      } else {
        this.onAddWatchlist();
      }
    }
  };

  private onGridReady = (event: GridReadyEvent) => {
    this.localGridApi = event.api;
    event.api.sizeColumnsToFit();

    if (this.props.watchlistData.data.length > 0) {
      event.api.setRowData(this.props.watchlistData.data);
    } else {
      event.api.setRowData(
        this.props.selectedWatchlist?.data?.map(
          (val) => this.props.symbolList.map?.[val] || { s: val }
        ) || []
      );
    }
  };

  private getRowNodeId = (data: INewSymbolData) => {
    return data.s;
  };
}

const mapStateToProps = (state: IState) => ({
  symbolList: state.symbolList,
  watchlist: state.watchlist,
  watchlistServer: state.watchlistServer,
  selectedWatchlist: state.selectedWatchlist,
  watchlistData: state.watchlistData,
  newSymbolData: state.newSymbolData,
  lang: state.lang,
  symbolCachedData: state.symbolCachedData,
  config: state.config,
});

const mapDispatchToProps = {
  updateWatchlist,
  selectWatchlist,
  showNotification,
  getSymbolDataWatchlist,
  deleteWatchlist,
  addWatchlist,
};

const WatchlistBoard = withErrorBoundary(
  withNamespaces('common')(
    connect(mapStateToProps, mapDispatchToProps)(WatchlistBoardComponent)
  ),
  Fallback,
  handleError
);

export default WatchlistBoard;
