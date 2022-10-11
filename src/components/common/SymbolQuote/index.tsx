import * as React from 'react';
import * as styles from './styles.scss';
import { AgGridReact } from 'ag-grid-react';
import {
  BodyScrollEvent,
  ColDef,
  ColGroupDef,
  GridApi,
  GridColumnsChangedEvent,
  GridReadyEvent,
} from 'ag-grid-community';
import { INewSymbolData } from 'interfaces/market';
import { IState } from 'redux/global-reducers';
import { RealtimeChannelDataType, SymbolType } from 'constants/enum';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { domainConfig } from 'config/domain';
import { getColumnDefs } from './config';
import { handleError, translateLocaleText } from 'utils/common';
import { querySymbolDataQuote } from './actions';
import { withErrorBoundary } from 'react-error-boundary';
import Fallback from 'components/common/Fallback';

export interface ISymbolQuoteProps
  extends React.ClassAttributes<SymbolQuoteComponent>,
    WithNamespaces {
  readonly data?: INewSymbolData;
  readonly symbolQuoteData: IState['symbolQuoteData'];
  readonly currentSymbol: IState['currentSymbol'];
  readonly newSymbolData: IState['newSymbolData'];
  readonly resetMarketDataTrigger: IState['resetMarketDataTrigger'];
  readonly resetBoardDataTrigger: IState['resetBoardDataTrigger'];
  readonly config: IState['config'];

  readonly querySymbolDataQuote: typeof querySymbolDataQuote;
}

class SymbolQuoteComponent extends React.Component<ISymbolQuoteProps> {
  private localAllowSrollQuery = true;
  private localLastTradingVolume?: number;
  private localGridApi?: GridApi;
  private localSymbol?: INewSymbolData;
  private localColumnDefs: Array<ColGroupDef | ColDef>;

  constructor(props: ISymbolQuoteProps) {
    super(props);
    this.localColumnDefs = getColumnDefs(
      (domainConfig[props.config.domain]?.isHideType as boolean) ||
        props.currentSymbol.infoData?.t === SymbolType.INDEX
    );
    this.localSymbol = props.data || props.currentSymbol.infoData;
  }

  componentDidMount() {
    if (this.localSymbol?.s === this.props.currentSymbol.code) {
      this.requestSymbolQuoteData(this.props.currentSymbol.code);
    }
  }

  shouldComponentUpdate(nextProps: ISymbolQuoteProps) {
    if (
      this.props.newSymbolData !== nextProps.newSymbolData &&
      nextProps.newSymbolData?.s === this.props.currentSymbol.code &&
      nextProps.newSymbolData?.channelType === RealtimeChannelDataType.QUOTE
    ) {
      this.localGridApi?.applyTransaction({
        add: [nextProps.newSymbolData],
        addIndex: 0,
      });
    }

    if (
      nextProps.symbolQuoteData &&
      nextProps.symbolQuoteData !== this.props.symbolQuoteData
    ) {
      this.localAllowSrollQuery = true;

      const data = nextProps.symbolQuoteData.data.map((quote) => ({
        ...quote,
        ce: this.localSymbol?.ce,
        fl: this.localSymbol?.fl,
        re: this.localSymbol?.re,
        t: this.localSymbol?.t,
        ti: quote.t,
      }));

      this.localLastTradingVolume =
        nextProps.symbolQuoteData.data[
          nextProps.symbolQuoteData.data.length - 1
        ]?.vo;

      if (!this.localLastTradingVolume) {
        this.localAllowSrollQuery = false;
      }

      if (nextProps.symbolQuoteData.status.isSucceeded) {
        this.localGridApi?.hideOverlay();
        this.localGridApi?.applyTransaction({
          add: data,
          addIndex: this.localGridApi?.getModel().getRowCount(),
        });
      } else if (nextProps.symbolQuoteData.status.isLoading) {
        this.localGridApi?.showLoadingOverlay();
      } else if (nextProps.symbolQuoteData.status.isFailed) {
        this.localGridApi?.hideOverlay();
      }
    }

    if (
      (this.props.currentSymbol !== nextProps.currentSymbol &&
        this.props.currentSymbol.code !== nextProps.currentSymbol.code) ||
      this.props.resetMarketDataTrigger !== nextProps.resetMarketDataTrigger ||
      this.props.resetBoardDataTrigger !== nextProps.resetBoardDataTrigger
    ) {
      this.localSymbol = nextProps.currentSymbol.infoData;
      this.requestSymbolQuoteData(nextProps.currentSymbol.code);
      this.localGridApi?.setRowData([]);
      this.localGridApi?.showLoadingOverlay();
      this.localGridApi?.setColumnDefs(
        getColumnDefs(
          (domainConfig[this.props.config.domain]?.isHideType as boolean) ||
            this.localSymbol?.t === SymbolType.INDEX
        )
      );
    }
    return false;
  }

  render() {
    return (
      <div className={`${styles.QuoteInfo} ag-theme-balham-dark`}>
        <AgGridReact
          columnDefs={this.localColumnDefs}
          onGridReady={this.onGridReady}
          localeTextFunc={translateLocaleText}
          rowHeight={26}
          headerHeight={26}
          alwaysShowVerticalScroll={false}
          enableCellExpressions={true}
          suppressDragLeaveHidesColumns={true}
          enableCellChangeFlash={true}
          suppressMovableColumns={true}
          // animateRows={true}
          suppressHorizontalScroll={true}
          onBodyScroll={this.onGridScroll}
          onGridColumnsChanged={this.onGridColumnsChanged}
          asyncTransactionWaitMillis={0}
          rowBuffer={5}
        />
      </div>
    );
  }

  private resizeGrid = () => {
    setTimeout(() => {
      this.localGridApi?.sizeColumnsToFit();
    });
  };

  private onGridReady = (event: GridReadyEvent) => {
    this.localGridApi = event.api;
    event.api.sizeColumnsToFit();
    window.addEventListener('resize', this.resizeGrid);
  };

  private requestSymbolQuoteData = (
    symbol: string,
    lastTradingVolume?: number
  ) => {
    this.props.querySymbolDataQuote({
      symbol,
      fetchCount: 40,
      lastTradingVolume,
    });
  };

  private onGridScroll = (ev: BodyScrollEvent) => {
    const lastDisplayedIndex = ev.api.getLastDisplayedRow();
    const allIndex = ev.api.getModel().getRowCount();
    if (
      lastDisplayedIndex >= allIndex - 5 &&
      this.localAllowSrollQuery &&
      allIndex > 0
    ) {
      if (this.localSymbol) {
        this.requestSymbolQuoteData(
          this.localSymbol.s,
          this.localLastTradingVolume
        );
      }
      this.localAllowSrollQuery = false;
    }
  };

  private onGridColumnsChanged = (event: GridColumnsChangedEvent) => {
    event.api.sizeColumnsToFit();
  };
}

const mapStateToProps = (state: IState) => {
  return {
    symbolQuoteData: state.symbolQuoteData,
    currentSymbol: state.currentSymbol,
    resetMarketDataTrigger: state.resetMarketDataTrigger,
    resetBoardDataTrigger: state.resetBoardDataTrigger,
    newSymbolData: state.newSymbolData,
    config: state.config,
  };
};

const SymbolQuote = withErrorBoundary(
  withNamespaces('common')(
    connect(mapStateToProps, { querySymbolDataQuote })(SymbolQuoteComponent)
  ),
  Fallback,
  handleError
);

export default SymbolQuote;
