import * as React from 'react';
import * as config from './config';
import * as globalStyles from 'styles/style.scss';
import * as styles from './styles.scss';
import {
  AccountDropdown,
  DateRangePicker,
  Fallback,
  SheetData,
} from 'components/common';
import { AccountType } from 'constants/enum';
import { GridApi, GridReadyEvent } from 'ag-grid-community';
import { IState } from 'redux/global-reducers';
import { RouteComponentProps, withRouter } from 'react-router';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { formatDateToString, getDateAMonthAgo } from 'utils/datetime';
import { handleError } from 'utils/common';
import { queryEquityLoanStatement } from './action';
import { withErrorBoundary } from 'react-error-boundary';

interface ILoanStatementProps
  extends React.ClassAttributes<LoanStatementComponent>,
    WithNamespaces,
    RouteComponentProps {
  readonly selectedAccount: IState['selectedAccount'];
  readonly equityLoanStatement: IState['equityLoanStatement'];
  readonly accountList: IState['accountList'];
  readonly queryEquityLoanStatement: typeof queryEquityLoanStatement;
}

interface ILoanStatementState {
  readonly fromDate: Date;
  readonly toDate: Date;
}

class LoanStatementComponent extends React.Component<
  ILoanStatementProps,
  ILoanStatementState
> {
  private localGridApi?: GridApi;

  constructor(props: ILoanStatementProps) {
    super(props);

    this.state = {
      fromDate: getDateAMonthAgo(),
      toDate: new Date(),
    };
  }

  componentDidMount() {
    this.queryLoanStatement();
    this.props.i18n.on('languageChanged', this.onChangeLang);
  }

  componentDidUpdate(prevProps: ILoanStatementProps) {
    if (
      this.props.selectedAccount !== prevProps.selectedAccount &&
      this.props.selectedAccount &&
      this.props.selectedAccount.accountType === AccountType.MARGIN
    ) {
      this.queryLoanStatement();
    }
  }

  componentWillUnmount() {
    this.props.i18n.off('languageChanged', this.onChangeLang);
  }

  render() {
    const { t } = this.props;
    const lastRowData = this.props.equityLoanStatement.data?.reduce(
      (val, curr) => ({
        no: t('TOTAL 2'),
        beginningOutstandingLoan:
          val.beginningOutstandingLoan + curr.beginningOutstandingLoan,
        newDebtIncrease: val.newDebtIncrease + curr.newDebtIncrease,
        paidAmountDecrease: val.paidAmountDecrease + curr.paidAmountDecrease,
      }),
      {
        no: t('TOTAL 2'),
        beginningOutstandingLoan: 0,
        newDebtIncrease: 0,
        paidAmountDecrease: 0,
      }
    );
    const RenderItem = (
      <div className={styles.LoanStatementData}>
        <div className={styles.LoanStatementFilter}>
          <div className={styles.LoanStatementAccount}>
            <p>{t('Account No.')}</p>
            <AccountDropdown
              isForm={true}
              unshowAccounts={this.props.accountList
                .filter((account) => account.accountType !== AccountType.MARGIN)
                .map((acc) => acc.account)}
            />
          </div>
          <div className={styles.LoanStatementDate}>
            <p>{t('Date')}</p>
            <DateRangePicker
              onChangeStartDate={this.onChangeFromDate}
              onChangeEndDate={this.onChangeToDate}
              startDate={this.state.fromDate}
              endDate={this.state.toDate}
            />
          </div>
          <div className={styles.LoanStatementDate}>
            <button
              className={globalStyles.QueryButton}
              onClick={this.onClickSubmit}
            >
              {t('Query')}
            </button>
          </div>
        </div>

        <SheetData
          rowData={this.props.equityLoanStatement.data}
          columnDefs={config.getColumnDefs()}
          status={this.props.equityLoanStatement.status}
          lastRowData={[lastRowData]}
          onGridReady={this.onGridReady}
        />
      </div>
    );

    return <div className={styles.LoanStatement}>{RenderItem}</div>;
  }

  private onClickSubmit = () => {
    this.queryLoanStatement();
  };

  private queryLoanStatement = () => {
    this.props.queryEquityLoanStatement({
      accountNo: this.props.selectedAccount?.account,
      fromDate: formatDateToString(this.state.fromDate),
      toDate: formatDateToString(this.state.toDate),
      fetchCount: 15,
    });
  };

  private onChangeFromDate = (date: Date) => {
    this.setState({ fromDate: date });
  };

  private onChangeToDate = (date: Date) => {
    this.setState({ toDate: date });
  };

  private onGridReady = (event: GridReadyEvent) => {
    this.localGridApi = event.api;
  };

  private onChangeLang = () => {
    setTimeout(() => {
      this.localGridApi?.sizeColumnsToFit();
    });
  };
}

const mapStateToProps = (state: IState) => ({
  selectedAccount: state.selectedAccount,
  accountList: state.accountList,
  equityLoanStatement: state.equityLoanStatement,
});

const mapDispatchToProps = {
  queryEquityLoanStatement,
};

const LoanStatement = withRouter(
  withErrorBoundary(
    withNamespaces('common')(
      connect(mapStateToProps, mapDispatchToProps)(LoanStatementComponent)
    ),
    Fallback,
    handleError
  )
);

export default LoanStatement;
