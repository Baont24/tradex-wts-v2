import * as React from 'react';
import * as styles from './styles.scss';
import { AgGridReact } from 'ag-grid-react';
import { Fallback, TabTable } from 'components/common';
import { GridApi, GridReadyEvent, RowNode } from 'ag-grid-community';
import { IColDef, IColGroupDef, ITabTableData } from 'interfaces/common';
import { IIndexBoardData, INewSymbolData } from 'interfaces/market';
import { IState } from 'redux/global-reducers';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { getColumnDefs } from './config';
import { handleError, translateLocaleText } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';

export interface IIndexBoardProps
  extends React.ClassAttributes<IndexBoardComponent>,
    WithNamespaces {
  readonly indexListSlider: INewSymbolData[];
  readonly indexType: IIndexBoardData['type'];
  readonly headerHeight?: number;
  readonly rowHeight?: number;
  readonly domLayout?: boolean;
  readonly columnDefType?: INewSymbolData['it'];
  readonly newIndexData: IState['newIndexData'];
  readonly indexBoardData: IState['indexBoardData'];
  readonly symbolList: IState['symbolList'];
  readonly lang: IState['lang'];
  readonly indexList: IState['indexList'];
  readonly config: IState['config'];
  readonly tabKey: INewSymbolData['it'];

  readonly isExternalFilterPresent?: () => boolean;
  readonly doesExternalFilterPass?: (node: RowNode) => boolean;
  readonly onGridReady?: (event: GridReadyEvent) => void;
  readonly onSelectTab: (eventKey: INewSymbolData['it']) => void;
}

class IndexBoardComponent extends React.Component<IIndexBoardProps> {
  private localGridApi?: GridApi;
  private localColumnDefs: Array<
    IColGroupDef<INewSymbolData> | IColDef<INewSymbolData>
  >;
  private localGridData: INewSymbolData[] = [];

  constructor(props: IIndexBoardProps) {
    super(props);

    this.state = {};
  }

  componentDidMount() {
    this.props.i18n.on('languageChanged', this.onChangeLang);
  }

  shouldComponentUpdate(nextProps: IIndexBoardProps) {
    if (
      nextProps.indexBoardData !== this.props.indexBoardData &&
      nextProps.indexBoardData.data.type === this.props.indexType
    ) {
      this.localGridData = nextProps.indexBoardData.data.array.map((val) => ({
        ...nextProps.symbolList.map?.[val.s],
        ...val,
      }));

      if (nextProps.indexBoardData.status.isFailed) {
        this.localGridApi?.showNoRowsOverlay();
      }

      if (nextProps.indexBoardData.status.isLoading) {
        this.localGridApi?.showLoadingOverlay();
      }

      if (nextProps.indexBoardData.status.isSucceeded) {
        this.localGridApi?.setRowData(this.localGridData);
        this.localGridApi?.hideOverlay();
      }
    }

    if (nextProps.newIndexData !== this.props.newIndexData) {
      const data = this.props.indexListSlider.find(
        (val) => val.s === nextProps.newIndexData?.s
      );
      if (data != null) {
        const rowNode = this.localGridApi?.getRowNode(data.s);
        if (rowNode != null) {
          this.localGridApi?.applyTransactionAsync({
            update: [{ ...data, ...rowNode.data, ...nextProps.newIndexData }],
          });
        }
      }
    }

    if (nextProps.lang !== this.props.lang) {
      this.localGridApi?.applyTransaction({
        update: [],
      });
      return true;
    }

    if (nextProps.tabKey !== this.props.tabKey) {
      return true;
    }

    return false;
  }

  componentWillUnmount() {
    this.props.i18n.off('languageChanged', this.onChangeLang);
    window.removeEventListener('resize', this.resizeGrid);
  }

  render() {
    const { t } = this.props;

    const summaryIndexTab: ITabTableData[] = [
      {
        key: 'D',
        title: t('Main Index'),
        default: true,
        component: (
          <div className={styles.TabBoard}>
            <AgGridReact
              columnDefs={this.localColumnDefs}
              onGridReady={this.onGridReady}
              localeTextFunc={translateLocaleText}
              rowHeight={this.props.rowHeight}
              headerHeight={this.props.headerHeight}
              suppressMovableColumns={true}
              asyncTransactionWaitMillis={500}
              getRowNodeId={this.getRowNodeId}
              domLayout={this.props.domLayout ? 'autoHeight' : undefined}
              isExternalFilterPresent={this.props.isExternalFilterPresent}
              doesExternalFilterPass={this.props.doesExternalFilterPass}
            />
          </div>
        ),
      },
      {
        key: 'F',
        title: t('Foreigner Index'),
        hide: this.props.config.disableForeignerIndex,
        component: (
          <div className={styles.TabBoard}>
            <AgGridReact
              columnDefs={this.localColumnDefs}
              onGridReady={this.onGridReady}
              localeTextFunc={translateLocaleText}
              rowHeight={this.props.rowHeight}
              headerHeight={this.props.headerHeight}
              suppressMovableColumns={true}
              asyncTransactionWaitMillis={500}
              getRowNodeId={this.getRowNodeId}
              domLayout={this.props.domLayout ? 'autoHeight' : undefined}
              isExternalFilterPresent={this.props.isExternalFilterPresent}
              doesExternalFilterPass={this.props.doesExternalFilterPass}
            />
          </div>
        ),
      },
    ];

    return (
      <div className={styles.IndexBoard}>
        <TabTable data={summaryIndexTab} onSelect={this.onSelectTab} />
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

    this.localGridData = this.props.indexBoardData.data.array.map((val) => ({
      ...this.props.symbolList.map?.[val.s],
      ...val,
    }));
    this.localColumnDefs = getColumnDefs(
      this.props.columnDefType || this.props.tabKey
    );

    event.api.showLoadingOverlay();
    event.api.setColumnDefs(this.localColumnDefs);
    event.api.setRowData(this.localGridData);
    event.api.sizeColumnsToFit();

    window.removeEventListener('resize', this.resizeGrid);
    window.addEventListener('resize', this.resizeGrid);

    this.props.i18n.on('languageChanged', this.onChangeLang);

    this.localGridData = this.props.indexBoardData.data.array.map((val) => ({
      ...this.props.symbolList.map?.[val.s],
      ...val,
    }));
    event.api.setRowData(this.localGridData);
    this.props.onGridReady?.(event);
  };

  private onChangeLang = () => {
    this.localColumnDefs = getColumnDefs(
      this.props.columnDefType || this.props.tabKey
    );
    this.localGridApi?.setColumnDefs(this.localColumnDefs);
    this.resizeGrid();
  };

  private getRowNodeId = (data: INewSymbolData) => {
    return data.s;
  };

  private onSelectTab = (eventKey: 'F' | 'D') => {
    this.props.onSelectTab(eventKey);
  };
}

const mapStateToProps = (state: IState) => ({
  indexList: state.indexList,
  newIndexData: state.newIndexData,
  indexBoardData: state.indexBoardData,
  symbolList: state.symbolList,
  lang: state.lang,
  config: state.config,
});

const mapDispatchToProps = {};

const IndexBoard = withErrorBoundary(
  withNamespaces('common')(
    connect(mapStateToProps, mapDispatchToProps)(IndexBoardComponent)
  ),
  Fallback,
  handleError
);

export default IndexBoard;
