import * as React from 'react';
import * as config from './config';
import * as globalStyles from 'styles/style.scss';
import * as styles from './styles.scss';
import {
  AccountDropdown,
  DateRangePicker,
  Fallback,
  SheetData,
  TabTable,
} from 'components/common';
import { AccountRoutes, Routes } from 'constants/routes';
import { GridApi, GridReadyEvent } from 'ag-grid-community';
import { IState } from 'redux/global-reducers';
import { QUERY_FETCH_COUNT } from 'constants/main';
import { RouteComponentProps, withRouter } from 'react-router';
import { SystemType } from 'constants/enum';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { formatDateToString, getDateAMonthAgo } from 'utils/datetime';
import { getStockTransactionHistory } from './action';
import { handleError } from 'utils/common';
import { portfolioTab } from '../config';
import { withErrorBoundary } from 'react-error-boundary';

interface ISecuritiesStatementProps
  extends React.ClassAttributes<SecuritiesStatementComponent>,
    WithNamespaces,
    RouteComponentProps {
  readonly accountList: IState['accountList'];
  readonly selectedAccount: IState['selectedAccount'];
  readonly securitiesStatement: IState['securitiesStatement'];
  readonly getStockTransactionHistory: typeof getStockTransactionHistory;
}

interface ISecuritiesStatementState {
  readonly fromDate: Date;
  readonly toDate: Date;
}
class SecuritiesStatementComponent extends React.Component<
  ISecuritiesStatementProps,
  ISecuritiesStatementState
> {
  private localGridApi?: GridApi;

  constructor(props: ISecuritiesStatementProps) {
    super(props);

    this.state = {
      fromDate: getDateAMonthAgo(),
      toDate: new Date(),
    };
  }

  componentDidMount() {
    this.querySecuritiesStatement();
    this.props.i18n.on('languageChanged', this.onChangeLang);
  }

  componentDidUpdate(prevProps: ISecuritiesStatementProps) {
    if (this.props.selectedAccount !== prevProps.selectedAccount) {
      this.querySecuritiesStatement(this.props.selectedAccount?.account);
    }
    return true;
  }

  componentWillUnmount() {
    this.props.i18n.off('languageChanged', this.onChangeLang);
  }

  render() {
    const { t } = this.props;

    const RenderItem = (
      <div className={styles.SecuritiesStatementTab}>
        <div className={styles.SecuritiesStatementFilter}>
          <div className={styles.SecuritiesStatementAccount}>
            <p>{t('Account No.')}</p>
            <AccountDropdown isForm={true} type={SystemType.EQUITY} />
          </div>
          <div className={styles.SecuritiesStatementDate}>
            <p>{t('Date')}</p>
            <DateRangePicker
              onChangeStartDate={this.onChangeFromDate}
              onChangeEndDate={this.onChangeToDate}
              startDate={this.state.fromDate}
              endDate={this.state.toDate}
            />
          </div>
          <div className={styles.SecuritiesStatementDate}>
            <button
              className={globalStyles.QueryButton}
              onClick={this.onClickQuery}
            >
              {t('Query')}
            </button>
          </div>
        </div>

        <SheetData
          hasGroupHeader={true}
          rowData={this.props.securitiesStatement.data.list}
          columnDefs={config.getColumnDefs()}
          status={this.props.securitiesStatement.status}
          onGridReady={this.onGridReady}
          defaultColDef={config.DEFAULT_COL_DEF}
          onLoadMore={this.onLoadMore}
        />
      </div>
    );

    return (
      <div className={styles.SecuritiesStatement}>
        <TabTable
          data={portfolioTab(
            AccountRoutes.SECURITIES_STATEMENT,
            RenderItem,
            this.props.selectedAccount?.type
          )}
          onSelect={this.onSelect}
        />
      </div>
    );
  }

  private onSelect = (eventKey: string) => {
    this.props.history.push(`/${Routes.ACCOUNT}/${eventKey}`);
  };

  private onChangeFromDate = (date: Date) => {
    this.setState({ fromDate: date });
  };

  private onChangeToDate = (date: Date) => {
    this.setState({ toDate: date });
  };

  private querySecuritiesStatement = (
    accountNumber?: string,
    offset?: number,
    fetchCount?: number
  ) => {
    if (
      this.props.securitiesStatement.data.totalCount === 0 ||
      this.props.securitiesStatement.data.totalCount > (offset || 0)
    ) {
      this.props.getStockTransactionHistory({
        accountNumber: accountNumber || this.props.selectedAccount?.account,
        fromDate: formatDateToString(this.state.fromDate, 'yyyyMMdd') || '',
        toDate: formatDateToString(this.state.toDate, 'yyyyMMdd') || '',
        offset: offset || 0,
        fetchCount: fetchCount || QUERY_FETCH_COUNT,
      });
    }
  };

  private onClickQuery = () => {
    this.querySecuritiesStatement();
  };

  private onLoadMore = (offset?: number, fetchCount?: number) => {
    this.querySecuritiesStatement(undefined, offset, fetchCount);
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
  accountList: state.accountList,
  selectedAccount: state.selectedAccount,
  securitiesStatement: state.securitiesStatement,
});

const mapDispatchToProps = {
  getStockTransactionHistory,
};

const SecuritiesStatement = withRouter(
  withErrorBoundary(
    withNamespaces('common')(
      connect(mapStateToProps, mapDispatchToProps)(SecuritiesStatementComponent)
    ),
    Fallback,
    handleError
  )
);

export default SecuritiesStatement;
