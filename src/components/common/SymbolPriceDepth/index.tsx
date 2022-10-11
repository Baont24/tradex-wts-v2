import * as React from 'react';
import * as styles from './styles.scss';
import { AgGridReact } from 'ag-grid-react';
import {
  ColDef,
  ColGroupDef,
  GridApi,
  GridReadyEvent,
} from 'ag-grid-community';
import { INewSymbolData } from 'interfaces/market';
import { IState } from 'redux/global-reducers';
import { RealtimeChannelDataType, SymbolType } from 'constants/enum';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { getColumnDefs } from './config';
import { handleError, translateLocaleText } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';
import Fallback from '../Fallback';

interface IPriceDepthData {
  readonly id: string;
  readonly re?: number;
  readonly ce?: number;
  readonly fl?: number;
  readonly t?: SymbolType;
  readonly v1?: number;
  readonly p1?: number | string;
  readonly v2?: number;
  readonly p2?: number | string;
}

export interface ISymbolPriceDepthProps extends WithNamespaces {
  readonly data?: INewSymbolData;
  readonly newSymbolData: IState['newSymbolData'];
  readonly currentSymbol: IState['currentSymbol'];
  readonly isInfoSideMenu?: boolean;
}

class SymbolPriceDepthComponent extends React.Component<
  ISymbolPriceDepthProps
> {
  private localGridApi?: GridApi;
  private localColumnDefs?: Array<ColGroupDef | ColDef>;
  private localData?: INewSymbolData;

  constructor(props: ISymbolPriceDepthProps) {
    super(props);

    this.state = {};
    this.localColumnDefs = getColumnDefs(this.props.isInfoSideMenu);
    this.localData = props.data || props.currentSymbol.infoData;
  }

  shouldComponentUpdate(nextProps: ISymbolPriceDepthProps) {
    if (nextProps.currentSymbol !== this.props.currentSymbol) {
      if (nextProps.currentSymbol.infoData) {
        this.localData = {
          ...this.localData,
          ...nextProps.currentSymbol.infoData,
        };
      }
      const mutableData = this.getPriceDepthGridData(
        nextProps.currentSymbol.infoData
      );
      const totalRow = mutableData.pop();
      this.localGridApi?.setRowData(mutableData);
      this.localGridApi?.setPinnedBottomRowData([totalRow]);
    }

    if (
      this.props.newSymbolData !== nextProps.newSymbolData &&
      nextProps.newSymbolData?.s === nextProps.currentSymbol.code &&
      nextProps.newSymbolData.channelType === RealtimeChannelDataType.BID_OFFER
    ) {
      this.localData = { ...this.localData, ...nextProps.newSymbolData };
      const mutableData = this.getPriceDepthGridData(this.localData);
      const totalRow = mutableData.pop();
      this.localGridApi?.applyTransactionAsync({
        update: mutableData,
      });
      this.localGridApi?.setPinnedBottomRowData([totalRow]);
    }

    return false;
  }

  render() {
    const { t } = this.props;

    return (
      <div className={styles.SymbolPriceDepth}>
        <AgGridReact
          columnDefs={this.localColumnDefs}
          localeTextFunc={translateLocaleText}
          onGridReady={this.onPriceDepthGridReady}
          pinnedBottomRowData={[
            { id: 'total', p1: t('Total'), v1: 0, p2: t('Total'), v2: 0 },
          ]}
          getRowNodeId={this.onGetRowNodeId}
          rowHeight={26}
          headerHeight={26}
          alwaysShowVerticalScroll={false}
          domLayout="autoHeight"
          enableCellExpressions={true}
          suppressDragLeaveHidesColumns={true}
          enableCellChangeFlash={true}
          suppressMovableColumns={true}
          suppressHorizontalScroll={true}
        />
      </div>
    );
  }

  private onGetRowNodeId = (data: IPriceDepthData) => data.id;

  private onPriceDepthGridReady = (event: GridReadyEvent) => {
    this.localGridApi = event.api;
    event.api.sizeColumnsToFit();
    event.api.hideOverlay();
    const mutableRowData = this.getPriceDepthGridData(this.localData);
    const totalRowData = mutableRowData.pop();
    event.api.setRowData(mutableRowData);
    event.api.setPinnedBottomRowData([totalRowData]);
  };

  private getPriceDepthGridData = (data?: INewSymbolData) => {
    const { t } = this.props;
    if (data == null) {
      return [];
    }

    const mutableData: IPriceDepthData[] = [];
    let totalBidVolume = 0;
    let totalOfferVolume = 0;

    for (let i = 0; i < 10; i++) {
      const bb = data.bb && data.bb[i];
      const bo = data.bo && data.bo[i];
      const bbp =
        data.bb &&
        data.bb[i] &&
        (data.bb[i].v ? (data.bb[i].p ? data.bb[i].p : data.ss) : 0);
      const bop =
        data.bo &&
        data.bo[i] &&
        (data.bo[i].v ? (data.bo[i].p ? data.bo[i].p : data.ss) : 0);
      const value: IPriceDepthData = {
        id: `bo${i}`,
        re: data.re,
        ce: data.ce,
        fl: data.fl,
        t: data.t,
        ...(bb && { p1: bbp, v1: bb.v }),
        ...(bo && { p2: bop, v2: bo.v }),
      };
      totalBidVolume += bb && bb.v ? bb.v : 0;
      totalOfferVolume += bo && bo.v ? bo.v : 0;
      mutableData.push(value);
    }

    mutableData.push({
      id: 'total',
      p1: t('Total') as string,
      v1: totalBidVolume,
      p2: t('Total') as string,
      v2: totalOfferVolume,
      t: data.t,
    });

    return mutableData;
  };
}

const mapStateToProps = (state: IState) => ({
  newSymbolData: state.newSymbolData,
  currentSymbol: state.currentSymbol,
});

const mapDispatchToProps = {};

const SymbolPriceDepth = withErrorBoundary(
  withNamespaces('common')(
    connect(mapStateToProps, mapDispatchToProps)(SymbolPriceDepthComponent)
  ),
  Fallback,
  handleError
);

export default SymbolPriceDepth;
