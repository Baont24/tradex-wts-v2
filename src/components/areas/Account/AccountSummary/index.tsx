import * as React from 'react';
import * as config from './config';
import * as styles from './styles.scss';
import { AccountType } from 'constants/enum';
import {
  CellClickedEvent,
  GridApi,
  GridReadyEvent,
  RowHeightParams,
  RowNode,
} from 'ag-grid-community';
import { Fallback, SheetData } from 'components/common';
import { IPortfoliosReducer } from 'interfaces/reducers';
import { IState } from 'redux/global-reducers';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { enquiryEquityPortfolios } from 'components/common/OrderForm/actions';
import { handleError } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';
import PortfolioRow from './PortfolioRow';

interface IAccountSummaryProps
  extends React.ClassAttributes<AccountSummaryComponent>,
    WithNamespaces {
  readonly selectedAccount: IState['selectedAccount'];
  readonly portfolios: IState['portfolios'];
  readonly accountList: IState['accountList'];

  readonly enquiryEquityPortfolios: typeof enquiryEquityPortfolios;
}

interface IAccountSummaryState {
  readonly portfolioList?: IPortfoliosReducer;
}
class AccountSummaryComponent extends React.Component<
  IAccountSummaryProps,
  IAccountSummaryState
> {
  private localGridApi?: GridApi;

  constructor(props: IAccountSummaryProps) {
    super(props);

    this.state = {};
  }

  componentDidMount() {
    if (this.props.selectedAccount != null) {
      this.props.enquiryEquityPortfolios();
    }

    this.props.i18n.on('languageChanged', this.onChangeLang);
  }

  componentDidUpdate(prevProps: IAccountSummaryProps) {
    if (
      this.props.accountList !== prevProps.accountList &&
      this.props.accountList.some((val) => val.isIICA)
    ) {
      this.props.enquiryEquityPortfolios();
      this.localGridApi?.setColumnDefs(
        config.getColumnDefs(
          this.onSymbolCellClicked,
          this.props.selectedAccount?.isIICA,
          this.props.selectedAccount?.accountType === AccountType.EQUITY
        )
      );
    }
  }

  componentWillUnmount() {
    this.props.i18n.off('languageChanged', this.onChangeLang);
  }

  render() {
    const { portfolios: equityPortfolios, t, selectedAccount } = this.props;

    let rowData: Array<Partial<IPortfoliosReducer>> = equityPortfolios.data;
    const columnDefs = config.getColumnDefs(
      this.onSymbolCellClicked,
      selectedAccount?.isIICA,
      selectedAccount?.accountType === AccountType.EQUITY
    );
    if (equityPortfolios.data.length === 0) {
      rowData = this.props.accountList.map((val) => ({
        accountNumber: val.accountNumber,
      }));
    }

    const lastRowData = equityPortfolios.data.reduce(
      (val, curr) => ({
        accountNumber: t('TOTAL 2'),
        summary: {
          liability: '',
          netAssetValue:
            typeof curr.summary.netAssetValue === 'number'
              ? val.summary.netAssetValue + curr.summary.netAssetValue
              : val.summary.netAssetValue,
          dailyPL: curr.summary.dailyPL
            ? val.summary.dailyPL + curr.summary.dailyPL
            : val.summary.dailyPL,
        },
      }),
      {
        accountNumber: t('TOTAL 2'),
        summary: {
          liability: '',
          netAssetValue: 0,
          dailyPL: 0,
        },
      }
    );
    return (
      <div className={styles.AccountSummary}>
        <SheetData
          rowData={rowData}
          columnDefs={columnDefs}
          status={equityPortfolios.status}
          lastRowData={
            equityPortfolios.data.length > 0 ? [lastRowData] : undefined
          }
          fullWidthCellRendererFramework={PortfolioRow}
          isFullWidthCell={this.isFullWidthCell}
          getRowHeight={this.getRowHeight}
          defaultColDef={config.DEFAULT_COL_DEF}
          domLayout="autoHeight"
          onGridReady={this.onGridReady}
        />
      </div>
    );
  }

  private onSymbolCellClicked = (event: CellClickedEvent) => {
    const portfolioList = event.data as IPortfoliosReducer;

    if (
      portfolioList.accountNumber !== 'TOTAL' &&
      portfolioList.portfolioList != null
    ) {
      this.setState(
        (state) => {
          if (
            state.portfolioList?.accountNumber !== portfolioList.accountNumber
          ) {
            return { portfolioList };
          }
          return { portfolioList: undefined };
        },
        () => {
          const rowData = this.props.portfolios.data.reduce((val, curr) => {
            const mutableArr: Array<
              IPortfoliosReducer & { isFullRow?: boolean }
            > = [...val, curr];

            if (
              curr.accountNumber === this.state.portfolioList?.accountNumber
            ) {
              mutableArr.push({ ...curr, isFullRow: true });
            }

            return mutableArr;
          }, []);

          event.api.setRowData(rowData);
          event.api.sizeColumnsToFit();

          event.column.setColDef(
            {
              ...event.column.getColDef(),
              cellRendererParams: {
                selectedAccount: this.state.portfolioList
                  ? portfolioList.accountNumber
                  : null,
              },
            },
            null
          );
        }
      );
    }
  };

  private onGridReady = (event: GridReadyEvent) => {
    this.localGridApi = event.api;
  };

  private isFullWidthCell = (rowNode: RowNode) => {
    return rowNode.data.isFullRow;
  };

  private getRowHeight = (params: RowHeightParams) => {
    if (params.data.isFullRow) {
      return 200;
    }
    return 26;
  };

  private onChangeLang = () => {
    setTimeout(() => {
      this.localGridApi?.sizeColumnsToFit();
    });
  };
}

const mapStateToProps = (state: IState) => ({
  selectedAccount: state.selectedAccount,
  portfolios: state.portfolios,
  accountList: state.accountList,
});

const mapDispatchToProps = {
  enquiryEquityPortfolios,
};

const AccountSummary = withErrorBoundary(
  withNamespaces('common')(
    connect(mapStateToProps, mapDispatchToProps)(AccountSummaryComponent)
  ),
  Fallback,
  handleError
);

export default AccountSummary;
