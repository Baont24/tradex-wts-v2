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
import { queryInterestExpenseStatement } from './actions';
import { withErrorBoundary } from 'react-error-boundary';

interface IInterestExpenseStatementProps
  extends React.ClassAttributes<InterestExpenseStatementComponent>,
    WithNamespaces,
    RouteComponentProps {
  readonly selectedAccount: IState['selectedAccount'];
  readonly accountList: IState['accountList'];

  readonly equityInterestExpenseStatement: IState['equityInterestExpenseStatement'];

  readonly queryInterestExpenseStatement: typeof queryInterestExpenseStatement;
}

interface IInterestExpenseStatementState {
  readonly fromDate: Date;
  readonly toDate: Date;
}

class InterestExpenseStatementComponent extends React.Component<
  IInterestExpenseStatementProps,
  IInterestExpenseStatementState
> {
  private localGridApi?: GridApi;

  constructor(props: IInterestExpenseStatementProps) {
    super(props);

    this.state = {
      fromDate: getDateAMonthAgo(),
      toDate: new Date(),
    };
  }

  componentDidMount() {
    if (this.props.selectedAccount != null) {
      this.props.queryInterestExpenseStatement({
        accountNumber: this.props.selectedAccount.accountNumber,
        fromDate: formatDateToString(this.state.fromDate) || '',
        toDate: formatDateToString(this.state.toDate) || '',
      });
    }
    this.props.i18n.on('languageChanged', this.onChangeLang);
  }

  shouldComponentUpdate(nextProps: IInterestExpenseStatementProps) {
    if (
      this.props.selectedAccount !== nextProps.selectedAccount &&
      nextProps.selectedAccount != null &&
      nextProps.selectedAccount.accountType === AccountType.MARGIN
    ) {
      this.props.queryInterestExpenseStatement({
        accountNumber: nextProps.selectedAccount.accountNumber,
        fromDate: formatDateToString(this.state.fromDate) || '',
        toDate: formatDateToString(this.state.toDate) || '',
      });
    }
    return true;
  }

  componentWillUnmount() {
    this.props.i18n.off('languageChanged', this.onChangeLang);
  }

  render() {
    const { t } = this.props;

    const RenderItem = (
      <div className={styles.InterestExpenseStatementTab}>
        <div className={styles.InterestExpenseStatementFilter}>
          <div className={styles.InterestExpenseStatementAccount}>
            <p>{t('Account No.')}</p>
            <AccountDropdown
              isForm={true}
              unshowAccounts={this.props.accountList
                .filter((account) => account.accountType !== AccountType.MARGIN)
                .map((acc) => acc.account)}
            />
          </div>
          <div className={styles.InterestExpenseStatementDate}>
            <p>{t('Date')}</p>
            <DateRangePicker
              onChangeStartDate={this.onChangeFromDate}
              onChangeEndDate={this.onChangeToDate}
              startDate={this.state.fromDate}
              endDate={this.state.toDate}
            />
          </div>
          <div className={styles.InterestExpenseStatementQuery}>
            <button
              className={globalStyles.QueryButton}
              onClick={this.onClickQuery}
            >
              {t('Query')}
            </button>
          </div>
        </div>
        <div className={styles.InterestExpenseStatementFilter}>
          <div>
            {/* <p>
              {`${t('Interest Rate')}: `}
              <span className="mr-5">{`${
                this.props.equityInterestExpenseStatement.data.total?.interestRate || ''
              }%`}</span>
            </p> */}
            {/* <p>
              {`${t('Accrued Interest Amount MAS')} `}
              <span>{`VND ${this.props.equityInterestExpenseStatement.data.total?.accruedInterestAmount || ''}`}</span>
            </p> */}
          </div>
        </div>

        <SheetData
          rowData={this.props.equityInterestExpenseStatement.data.list}
          columnDefs={config.getColumnDefs()}
          status={this.props.equityInterestExpenseStatement.status}
          defaultColDef={config.DEFAULT_COL_DEF}
          lastRowData={[
            {
              no: t('TOTAL 2'),
              ...this.props.equityInterestExpenseStatement.data.total,
            },
          ]}
          onGridReady={this.onGridReady}
        />
      </div>
    );

    return <div className={styles.InterestExpenseStatement}>{RenderItem}</div>;
  }

  private onChangeFromDate = (date: Date) => {
    this.setState({ fromDate: date });
  };

  private onChangeToDate = (date: Date) => {
    this.setState({ toDate: date });
  };

  private onClickQuery = () => {
    if (this.props.selectedAccount != null) {
      this.props.queryInterestExpenseStatement({
        accountNumber: this.props.selectedAccount.accountNumber,
        fromDate: formatDateToString(this.state.fromDate) || '',
        toDate: formatDateToString(this.state.toDate) || '',
        fetchCount: 100,
      });
    }
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
  equityInterestExpenseStatement: state.equityInterestExpenseStatement,
});

const mapDispatchToProps = {
  queryInterestExpenseStatement,
};

const InterestExpenseStatement = withRouter(
  withErrorBoundary(
    withNamespaces('common')(
      connect(
        mapStateToProps,
        mapDispatchToProps
      )(InterestExpenseStatementComponent)
    ),
    Fallback,
    handleError
  )
);

export default InterestExpenseStatement;
