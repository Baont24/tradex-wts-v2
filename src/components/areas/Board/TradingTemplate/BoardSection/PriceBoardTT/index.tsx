import * as React from 'react';
import * as classNames from 'classnames';
import * as globalStyles from 'styles/style.scss';
import * as styles from '../styles.scss';
import { BoardMarketRoutes } from 'constants/routes';
import {
  Dropdown,
  Fallback,
  StockBoard,
  SymbolSearch,
} from 'components/common';
import { IState } from 'redux/global-reducers';
import { RealtimeChannelDataType } from 'constants/enum';
import { RowNode } from 'ag-grid-community';
import { ToastType } from 'react-toastify';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { handleError } from 'utils/common';
import {
  initPriceBoard,
  selectSymbolPriceBoard,
  updateWatchlistBoard,
} from 'components/areas/Board/PriceBoard/actions';
import { showNotification, subscribe, unsubscribe } from 'redux/global-actions';
import { withErrorBoundary } from 'react-error-boundary';

const BOARD_LIST_DROPDOWN: Array<{
  readonly title: string;
  readonly value: BoardMarketRoutes;
}> = [
  { title: 'VN30', value: BoardMarketRoutes.VN30 },
  { title: 'HSX', value: BoardMarketRoutes.HOSE },
  { title: 'HNX30', value: BoardMarketRoutes.HNX30 },
  { title: 'HNX', value: BoardMarketRoutes.HNX },
  { title: 'UPCOM', value: BoardMarketRoutes.UPCOM },
  { title: 'Futures Index', value: BoardMarketRoutes.FUTURES },
  { title: 'Futures Bond', value: BoardMarketRoutes.FUTURES_BOND },
  { title: 'CW', value: BoardMarketRoutes.CW },
  { title: 'Oddlot HNX', value: BoardMarketRoutes.ODDLOT_HNX },
  { title: 'Oddlot UPCOM', value: BoardMarketRoutes.ODDLOT_UPCOM },
];

interface IPriceBoardTTProps
  extends React.ClassAttributes<PriceBoardTTComponent>,
    WithNamespaces {
  readonly priceBoard: IState['priceBoard'];
  readonly watchlistServer: IState['watchlistServer'];
  readonly selectedAccount: IState['selectedAccount'];

  readonly initPriceBoard: typeof initPriceBoard;
  readonly selectSymbolPriceBoard: typeof selectSymbolPriceBoard;
  readonly updateWatchlistBoard: typeof updateWatchlistBoard;
  readonly showNotification: typeof showNotification;
  readonly subscribe: typeof subscribe;
  readonly unsubscribe: typeof unsubscribe;
}

interface IPriceBoardTTState {
  readonly isSorted?: boolean; // This is for suppress row drag
  readonly isDropdownActive: boolean;
}

class PriceBoardTTComponent extends React.Component<
  IPriceBoardTTProps,
  IPriceBoardTTState
> {
  constructor(props: IPriceBoardTTProps) {
    super(props);

    props.initPriceBoard({
      key: this.props.selectedAccount?.isDerivatives
        ? BoardMarketRoutes.FUTURES
        : BoardMarketRoutes.VN30,
    });
    this.state = { isDropdownActive: true };
  }

  componentDidUpdate(prevProps: IPriceBoardTTProps) {
    if (prevProps.priceBoard.symbol !== this.props.priceBoard.symbol) {
      this.props.unsubscribe({
        symbolList: this.props.priceBoard.symbol,
        types: [
          RealtimeChannelDataType.QUOTE,
          RealtimeChannelDataType.BID_OFFER,
          RealtimeChannelDataType.EXTRA,
        ],
      });

      this.props.subscribe({
        symbolList: this.props.priceBoard.symbol,
        types: [
          RealtimeChannelDataType.QUOTE,
          RealtimeChannelDataType.BID_OFFER,
          RealtimeChannelDataType.EXTRA,
        ],
      });
    }
    if (
      prevProps.selectedAccount !== this.props.selectedAccount &&
      prevProps.selectedAccount?.isDerivatives !==
        this.props.selectedAccount?.isDerivatives
    ) {
      this.props.initPriceBoard({
        key: this.props.selectedAccount?.isDerivatives
          ? BoardMarketRoutes.FUTURES
          : BoardMarketRoutes.VN30,
      });
      this.setState({
        isDropdownActive: true,
      });
    }
  }

  componentWillUnmount() {
    this.props.unsubscribe({
      symbolList: this.props.priceBoard.symbol,
      types: [
        RealtimeChannelDataType.QUOTE,
        RealtimeChannelDataType.BID_OFFER,
        RealtimeChannelDataType.EXTRA,
      ],
    });
  }

  render() {
    const { t, priceBoard } = this.props;
    const watchlistDropdown = this.props.watchlistServer.map((val) => ({
      title: val.name,
      value: String(val.id),
    }));
    const boardPlaceholder =
      priceBoard.selectedBoard.key !== 'WATCHLIST'
        ? priceBoard.selectedBoard.selectedSubTab?.route ??
          priceBoard.selectedBoard.route ??
          'Board list'
        : 'Board list';
    const boardActiveItem =
      priceBoard.selectedBoard.key !== 'WATCHLIST'
        ? priceBoard.selectedBoard.selectedSubTab?.route ??
          priceBoard.selectedBoard.route
        : undefined;
    return (
      <div
        className={classNames(styles.PriceBoardTT, {
          // Those classes are used for controlling rowDrag when sorting
          [globalStyles.SuppressRowDrag]: this.state.isSorted,
          [globalStyles.AllowRowDrag]: !this.state.isSorted,
        })}
      >
        <div className={styles.Filter}>
          <div className={styles.SymbolSearchTitle}>{t('Stock Symbol')}</div>
          <div className={styles.BoardSymbolSearch}>
            <SymbolSearch
              isForm={true}
              placeholder={'Search Stock'}
              onSymbolSearch={this.onChangeSelectedRow}
            />
          </div>
          <div
            className={classNames(styles.BoardDropdown, {
              [styles.SubD]: this.props.selectedAccount?.isDerivatives,
            })}
          >
            <Dropdown
              isForm={true}
              placeholder={'Watchlist'}
              data={watchlistDropdown}
              onSelect={this.onSelectBoard}
              isHover={true}
              active={!this.state.isDropdownActive}
            />
          </div>
          <div
            className={classNames(styles.BoardDropdown, {
              [styles.SubD]: this.props.selectedAccount?.isDerivatives,
            })}
          >
            <Dropdown
              isForm={true}
              placeholder={boardPlaceholder}
              data={BOARD_LIST_DROPDOWN}
              activeItem={boardActiveItem}
              onSelect={this.onSelectBoard}
              active={this.state.isDropdownActive}
              isHover={true}
            />
          </div>
        </div>
        <StockBoard
          symbols={priceBoard.symbol}
          symbolsMap={priceBoard.symbolMap}
          selectedTab={priceBoard.selectedBoard}
          selectedRow={priceBoard.selectedSymbol}
          onRemoveRow={this.onRemoveRow}
          onDragEnd={this.onRowDragEnd}
          onChangeSortStatus={this.onChangeSortStatus}
        />
      </div>
    );
  }

  private onSelectBoard = (title: string, value: BoardMarketRoutes) => {
    const isDropdownActive = BOARD_LIST_DROPDOWN.find(
      (element) => element.title === title
    );
    this.setState({
      isDropdownActive: isDropdownActive !== undefined,
    });
    this.props.initPriceBoard({ key: value });
  };

  private onChangeSelectedRow = (code: string | null) => {
    this.props.selectSymbolPriceBoard({ selectedSymbol: code ?? undefined });
  };

  private onRowDragEnd = (stockCode: string, newIndex: number) => {
    this.props.updateWatchlistBoard(stockCode, newIndex);
  };

  private onRemoveRow = (node: RowNode) => {
    this.props.updateWatchlistBoard(node.data.s as string);
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
}

const mapStateToProps = (state: IState) => ({
  priceBoard: state.priceBoard,
  watchlistServer: state.watchlistServer,
  selectedAccount: state.selectedAccount,
});

const mapDispatchToProps = {
  initPriceBoard,
  selectSymbolPriceBoard,
  showNotification,
  updateWatchlistBoard,
  subscribe,
  unsubscribe,
};

const PriceBoardTT = withErrorBoundary(
  withNamespaces('common')(
    connect(mapStateToProps, mapDispatchToProps)(PriceBoardTTComponent)
  ),
  Fallback,
  handleError
);

export default PriceBoardTT;
