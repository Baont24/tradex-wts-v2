import * as React from 'react';
import * as _ from 'lodash';
import * as classNames from 'classnames';
import * as styles from './styles.scss';
import { BlockUI, Dropdown, Fallback, SymbolSearch } from 'components/common';
import {
  BoardKey,
  IBoardTab,
  INotification,
  IWatchlist,
} from 'interfaces/common';
import {
  FaAngleDown,
  FaAngleUp,
  FaCheck,
  FaEllipsisV,
  FaPause,
  FaPen,
  FaPlay,
  FaPlus,
  FaSyncAlt,
  FaTrashAlt,
} from 'react-icons/fa';
import { INewSymbolData } from 'interfaces/market';
import { IState } from 'redux/global-reducers';
import { IndexSliderState, Market, SymbolType } from 'constants/enum';
import {
  MARKET_QUERY_INDEX_DATA_FAILED,
  MARKET_QUERY_INDEX_DATA_SUCCESS,
  MARKET_QUERY_INDEX_STOCK_LIST,
  MARKET_QUERY_INDEX_STOCK_LIST_FAILED,
  MARKET_QUERY_INDEX_STOCK_LIST_SUCCESS,
  MARKET_QUERY_SYMBOL_DATA,
  MARKET_QUERY_SYMBOL_DATA_FAILED,
  MARKET_QUERY_SYMBOL_DATA_SUCCESS,
} from 'redux/actions';
import { ToastType } from 'react-toastify';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import {
  addWatchlist,
  deleteWatchlist,
  resetBoardData,
  setCurrentSymbol,
  showNotification,
  updateWatchlist,
} from 'redux/global-actions';
import { connect } from 'react-redux';
import { handleError, truncateText } from 'utils/common';
import { isAuthenticated } from 'utils/domain';
import { withErrorBoundary } from 'react-error-boundary';
import getWatchlist from 'utils/watchlist';

export interface IBoardFilterProps
  extends React.ClassAttributes<BoardFilter>,
    WithNamespaces {
  readonly indexSliderState: IndexSliderState;
  readonly selectedTab: IBoardTab;
  readonly symbols: INewSymbolData[];
  readonly symbolList: IState['symbolList'];
  readonly watchlist: IState['watchlist'];
  readonly watchlistServer: IState['watchlistServer'];
  readonly selectedWatchlist: IState['selectedWatchlist'];
  readonly isDebugging: IState['isDebugging'];
  readonly config: IState['config'];

  readonly addWatchlist: typeof addWatchlist;
  readonly updateWatchlist: typeof updateWatchlist;
  readonly deleteWatchlist: typeof deleteWatchlist;
  readonly setCurrentSymbol: typeof setCurrentSymbol;
  readonly showNotification: typeof showNotification;
  readonly onToggleIndex: () => void;
  readonly onChangeTab: (
    key: BoardKey,
    subTabKey?: string | number,
    searchValue?: INewSymbolData
  ) => void;
  readonly resetBoardConfig?: (key?: BoardKey) => void;
  readonly resetBoardData: typeof resetBoardData;
  readonly onChangeSelectedRow: (symbol: INewSymbolData) => void;
}

export interface IBoardFilterState {
  readonly newWatchlistName?: string;
  readonly editedWatchlist?: IWatchlist;
  readonly isScrolling: boolean;
}

class BoardFilter extends React.Component<
  IBoardFilterProps,
  IBoardFilterState
> {
  private localWatchlist: IWatchlist[];
  private watchlistInputRef: React.RefObject<HTMLInputElement>;
  private localInterval: NodeJS.Timeout;
  constructor(props: IBoardFilterProps) {
    super(props);

    this.state = {
      isScrolling: false,
    };

    this.watchlistInputRef = React.createRef();
  }

  componentDidUpdate(prevProps: IBoardFilterProps) {
    if (this.props.watchlistServer !== prevProps.watchlistServer) {
      if (
        this.localWatchlist.some((ele) =>
          window.location.pathname.includes(ele?.id.toString())
        )
      ) {
        const watchlistId = this.localWatchlist.find((ele) =>
          window.location.pathname.includes(ele?.id.toString())
        );
        this.props.onChangeTab('WATCHLIST', watchlistId?.id);
      }
    }
    if (
      this.props.watchlistServer.length !== prevProps.watchlistServer.length ||
      this.props.watchlistServer.map(
        (val, index) => val.id !== prevProps.watchlistServer[index].id
      )
    ) {
      this.localWatchlist = this.getWatchList();
    }
  }

  componentWillUnmount() {
    this.stopScrolling();
  }

  render() {
    const { t, selectedTab, config } = this.props;
    const watchlistTab = config.boardTabs[0];
    this.localWatchlist = this.getWatchList();
    return (
      <div className={styles.BoardFilter}>
        <div className={styles.Left}>
          <div className={styles.FilterItem}>
            <div className={styles.SymbolPickerSection}>
              <SymbolSearch
                placeholder={t(
                  selectedTab.key === 'WATCHLIST'
                    ? 'Add Symbol'
                    : 'Enter Symbol'
                )}
                onSymbolSearch={this.onSymbolSearch}
                isHOSEtoHSX={true}
                removeIndexStock={true}
              />
            </div>
          </div>
          <div className={styles.FilterItem}>
            <Dropdown
              placeholder={t(this.props.selectedWatchlist?.name || 'Watchlist')}
              active={this.props.selectedTab.key === 'WATCHLIST'}
              onClick={this.onToggleWatchlist}
              onBlur={this.onBlurWatchlist}
              onShow={this.onHoverWatchlist}
              isHover={true}
            >
              {this.localWatchlist.map((val, idx) => {
                const onClickSelect = () =>
                  this.props.onChangeTab(watchlistTab.key, val.id);
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
                    className={classNames(styles.WatchlistItem, {
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
                          {(!isAuthenticated() ||
                            config.watchlist.serverSupportDel) && (
                            <span
                              className={styles.Icon}
                              onClick={onClickDelete}
                            >
                              <FaTrashAlt />
                            </span>
                          )}
                        </span>
                      </>
                    )}
                  </div>
                );
              })}
              {(!isAuthenticated() || config.watchlist.serverSupportAdd) && (
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
          {config.boardTabs.map((val, idx) => {
            const onSelectDropdown = (title: string, value: string) => {
              this.props.onChangeTab(val.key, value);
              this.stopScrolling();
            };

            const onClickEmptyTab = () => this.onClickTab(val.key);
            const onClickTab = () => {
              this.props.onChangeTab(
                val.key,
                val.data?.[val.key === 'HOSE' ? 1 : 0].key
              );
              this.stopScrolling();
            };
            return (
              val.key !== 'WATCHLIST' &&
              (this.props.selectedTab.key === val.key ? (
                <div className={styles.FilterItem} key={idx}>
                  <Dropdown
                    placeholder={t(
                      this.props.selectedTab.selectedSubTab?.title ||
                        val.title ||
                        val.key
                    )}
                    data={val.data?.map((s) => ({
                      title: s.title ?? '',
                      value: s.key,
                    }))}
                    active={true}
                    activeItem={this.props.selectedTab.selectedSubTab?.key}
                    onSelect={onSelectDropdown}
                    onClick={val.data ? undefined : onClickEmptyTab}
                    isHover={true}
                    tabMode={true}
                  />
                </div>
              ) : (
                <div className={styles.FilterItem} key={idx}>
                  <Dropdown
                    placeholder={t(val.title || val.key)}
                    data={val.data?.map((s) => ({
                      title: s.title ?? '',
                      value: s.key,
                    }))}
                    onSelect={onSelectDropdown}
                    onClick={val.data ? onClickTab : onClickEmptyTab}
                    isHover={true}
                    tabMode={true}
                  />
                </div>
              ))
            );
          })}
        </div>
        <div className={styles.Right}>
          {this.props.isDebugging && (
            <div className={styles.FilterItem}>
              <BlockUI
                className={styles.FilterButton}
                onClick={this.props.resetBoardData}
                block={[
                  MARKET_QUERY_SYMBOL_DATA,
                  MARKET_QUERY_INDEX_STOCK_LIST,
                ]}
                unblock={[
                  MARKET_QUERY_INDEX_DATA_SUCCESS,
                  MARKET_QUERY_INDEX_DATA_FAILED,
                  MARKET_QUERY_SYMBOL_DATA_SUCCESS,
                  MARKET_QUERY_SYMBOL_DATA_FAILED,
                  MARKET_QUERY_INDEX_STOCK_LIST_SUCCESS,
                  MARKET_QUERY_INDEX_STOCK_LIST_FAILED,
                ]}
              >
                <FaSyncAlt size={12} />
              </BlockUI>
            </div>
          )}
          <div className={styles.FilterItem} onClick={this.scrollBoard}>
            <div className={styles.FilterButton}>
              {this.state.isScrolling ? (
                <FaPause size={12} />
              ) : (
                <FaPlay size={12} />
              )}
            </div>
          </div>
          <div className={styles.FilterItem}>
            <Dropdown
              icon={<FaEllipsisV size={15} />}
              data={[
                { title: t('Reset board config'), value: 'clear' },
                { title: t('Reset all board config'), value: 'clear-all' },
              ]}
              onSelect={this.onSelectResetBoardConfig}
            />
          </div>
          {!config.hideAllIndexChart && (
            <div className={styles.FilterItem}>
              <div
                className={styles.FilterButton}
                onClick={this.props.onToggleIndex}
              >
                {this.props.indexSliderState === IndexSliderState.SHOW ||
                this.props.indexSliderState === IndexSliderState.HALF_SHOW ? (
                  <FaAngleUp size={12} />
                ) : (
                  <FaAngleDown size={12} />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  private getWatchList = (props?: IBoardFilterProps) =>
    getWatchlist(props != null ? props : this.props);

  private onSelectResetBoardConfig = (title: string, value: string) => {
    if (value === 'clear-all') {
      this.props.resetBoardConfig?.();
    } else {
      this.props.resetBoardConfig?.(this.props.selectedTab.key);
    }
  };

  private onClickTab = (key: BoardKey) => {
    this.props.onChangeTab(key);
    this.stopScrolling();
  };

  private onToggleWatchlist = () => {
    if (this.props.selectedWatchlist) {
      const { id } = this.props.selectedWatchlist;
      this.props.onChangeTab('WATCHLIST', id);
    }
  };

  private onBlurWatchlist = () => {
    this.setState({ editedWatchlist: undefined, newWatchlistName: undefined });
  };

  private onHoverWatchlist = () => {
    this.watchlistInputRef.current?.focus();
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

  private onEditWatchlist = (
    id: number,
    name: string,
    data?: string[],
    isServer?: boolean
  ) => {
    this.setState({ editedWatchlist: { id, name, data, isServer } }, () => {
      this.watchlistInputRef.current?.focus();
    });
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

  private onEnterWatchlist = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      if (this.state.editedWatchlist) {
        this.onSaveWatchlist();
      } else {
        this.onAddWatchlist();
      }
    }
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

  private onSymbolSearch = (code: string) => {
    if (this.props.selectedTab.key === 'WATCHLIST') {
      if (this.props.selectedWatchlist != null) {
        let watchlist: IWatchlist | undefined = this.getWatchList().find(
          (val) => val.id === this.props.selectedWatchlist?.id
        );
        let notification: INotification | null = null;
        if (watchlist != null) {
          if (watchlist.data != null) {
            if (watchlist.data.includes(code)) {
              if (this.props.symbolList.map) {
                const selectedSymbol = this.props.symbolList.map[code];
                this.props.onChangeSelectedRow(selectedSymbol);
              }
              notification = {
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
              notification = {
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
              if (this.props.symbolList.map) {
                const selectedSymbol = this.props.symbolList.map[code];
                this.props.onChangeSelectedRow(selectedSymbol);
              }
            }
          } else {
            watchlist = { ...watchlist, data: [code] };
            notification = {
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
          this.props.updateWatchlist(watchlist, notification);
        }
      } else {
        this.props.showNotification({
          type: ToastType.WARNING,
          title: 'Favorite list',
          content: 'The favorite name is empty !',
          time: new Date(),
        });
      }
    } else {
      if (this.props.symbolList.map) {
        const selectedSymbol = this.props.symbolList.map[code];
        let key: Market | BoardKey | SymbolType | undefined;

        if (this.props.config.boardTabs) {
          if (
            selectedSymbol.t === SymbolType.STOCK ||
            selectedSymbol.t === SymbolType.ETF
          ) {
            const symbol = this.props.symbols.find((val) => val.s === code);
            let { selectedSubTab } = this.props.selectedTab;
            if (symbol) {
              key = this.props.selectedTab.key;
            } else {
              key =
                selectedSymbol.t === SymbolType.ETF
                  ? selectedSymbol.t
                  : selectedSymbol.m;
              selectedSubTab = undefined;
            }
            if (this.props.selectedTab.key === 'CW') {
              key = selectedSymbol.m;
            }
            this.props.onChangeTab(
              key as BoardKey,
              selectedSubTab?.key,
              selectedSymbol
            );
          } else {
            key = selectedSymbol.t;
            this.props.onChangeTab(key as BoardKey, undefined, selectedSymbol);
          }
          this.props.setCurrentSymbol({
            code: selectedSymbol.s,
            symbolType: selectedSymbol.t,
            forceUpdate: true,
          });
        }
      }
    }
  };

  private scrollBoard = () => {
    if (!this.state.isScrolling) {
      const parentNode = document.querySelector('.BoardSection');
      if (parentNode) {
        const localBoard = parentNode.querySelector('.ag-body-viewport');
        if (localBoard) {
          let localStep = 1;
          this.setState({ isScrolling: true });
          this.localInterval = setInterval(() => {
            localBoard.scrollTop = localBoard.scrollTop + localStep;
            if (
              localBoard.scrollHeight - localBoard.scrollTop ===
              (localBoard as HTMLElement).offsetHeight
            ) {
              localStep = -1;
            }
            if (localBoard.scrollTop === 0) {
              localStep = 1;
            }
          }, 40);
        }
      }
    } else {
      this.stopScrolling();
    }
  };

  private stopScrolling = () => {
    clearInterval(this.localInterval);
    this.setState({ isScrolling: false });
  };
}

const mapStateToProps = (state: IState) => ({
  config: state.config,
  symbolList: state.symbolList,
  watchlist: state.watchlist,
  watchlistServer: state.watchlistServer,
  selectedWatchlist: state.selectedWatchlist,
  isDebugging: state.isDebugging,
});

const mapDispatchToProps = {
  showNotification,
  addWatchlist,
  updateWatchlist,
  deleteWatchlist,
  setCurrentSymbol,
  resetBoardData,
};

export default withErrorBoundary(
  withNamespaces('common')(
    connect(mapStateToProps, mapDispatchToProps)(BoardFilter)
  ),
  Fallback,
  handleError
);
