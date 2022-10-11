import * as React from 'react';
import * as configCol from './config';
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
import { RouteComponentProps, withRouter } from 'react-router';
import { SystemType } from 'constants/enum';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { assetManagementTab } from '../config';
import { connect } from 'react-redux';
import { formatDateToString, getDateAMonthAgo } from 'utils/datetime';
import { handleError } from 'utils/common';
import {
  queryDerivativesCashStatement,
  queryEquityCashStatement,
} from './actions';
import { withErrorBoundary } from 'react-error-boundary';
// import config from 'config';

interface ICashStatementProps
  extends React.ClassAttributes<CashStatementComponent>,
    WithNamespaces,
    RouteComponentProps {
  readonly selectedAccount: IState['selectedAccount'];
  readonly lang: IState['lang'];
  readonly equityCashStatement: IState['equityCashStatement'];
  readonly derivativesCashStatement: IState['derivativesCashStatement'];

  readonly queryEquityCashStatement: typeof queryEquityCashStatement;
  readonly queryDerivativesCashStatement: typeof queryDerivativesCashStatement;
}

interface ICashStatementState {
  readonly fromDate: Date;
  readonly toDate: Date;
}
class CashStatementComponent extends React.Component<
  ICashStatementProps,
  ICashStatementState
> {
  private localGridApi?: GridApi;

  constructor(props: ICashStatementProps) {
    super(props);

    this.state = {
      fromDate: getDateAMonthAgo(),
      toDate: new Date(),
    };
  }

  componentDidMount() {
    this.queryCashStatement();
    this.props.i18n.on('languageChanged', this.onResizeGrid);
  }

  componentDidUpdate(prevProps: ICashStatementProps) {
    if (
      this.props.selectedAccount !== prevProps.selectedAccount ||
      this.props.lang !== prevProps.lang
    ) {
      this.queryCashStatement(this.props.selectedAccount?.accountNumber);
      this.onResizeGrid();
    }

    if (
      this.props.derivativesCashStatement !==
        prevProps.derivativesCashStatement ||
      this.props.equityCashStatement !== prevProps.equityCashStatement
    ) {
      this.onResizeGrid();
    }
  }

  componentWillUnmount() {
    this.props.i18n.off('languageChanged', this.onResizeGrid);
  }

  render() {
    const {
      t,
      equityCashStatement,
      derivativesCashStatement,
      selectedAccount,
    } = this.props;
    const isDerivatives = selectedAccount?.type === SystemType.DERIVATIVES;
    const firstRowData = isDerivatives
      ? {
          no: t('Beginning Balance 1'),
          totalBalance: derivativesCashStatement.data?.beginningBalance,
        }
      : {
          no: t('Beginning Balance 1'),
          balance: equityCashStatement?.data?.beginningBalance,
        };

    const lastRowData = isDerivatives
      ? {
          no: t('Ending Balance 1'),
          totalBalance: derivativesCashStatement.data?.endingBalance,
        }
      : {
          no: t('Ending Balance 1'),
          balance: equityCashStatement.data?.endingBalance,
        };
    const RenderItem = (
      <div className={styles.CashStatementData}>
        <div className={styles.CashStatementFilter}>
          <div className={styles.CashStatementAccount}>
            <p>{t('Account No.')}</p>
            <AccountDropdown isForm={true} />
          </div>
          {/* <div className={styles.CashStatementType}>
            <p>{t('Transaction Type 1')}</p>
            <Dropdown isHover={true} placeholder="All" isForm={true} />
          </div> */}

          <div className={styles.CashStatementDate}>
            <p>{t('Date')}</p>
            <DateRangePicker
              onChangeStartDate={this.onChangeFromDate}
              onChangeEndDate={this.onChangeToDate}
              startDate={this.state.fromDate}
              endDate={this.state.toDate}
            />
          </div>
          <div className={styles.CashStatementQuery}>
            <button
              className={globalStyles.QueryButton}
              onClick={this.onClickQuery}
            >
              {t('Query')}
            </button>
          </div>
        </div>

        {isDerivatives ? (
          <SheetData
            rowData={derivativesCashStatement.data?.listTransactionHistory?.map(
              (val, id) => ({
                ...val,
                no: id + 1,
              })
            )}
            defaultColDef={configCol.DEFAULT_COL_DEF}
            status={derivativesCashStatement.status}
            columnDefs={configCol.getDirColumnDefs()}
            firstRowData={[firstRowData]}
            lastRowData={[lastRowData || { no: t('Ending Balance 1') }]}
            onGridReady={this.onGridReady}
            hasGroupHeader={true}
            onLoadMore={this.onLoadMore}
          />
        ) : (
          <SheetData
            rowData={equityCashStatement.data?.list}
            defaultColDef={configCol.DEFAULT_COL_DEF}
            columnDefs={configCol.getColumnDefs()}
            status={equityCashStatement.status}
            firstRowData={[firstRowData]}
            lastRowData={[
              lastRowData || { no: t('Ending Balance 1'), balance: 0 },
            ]}
            onGridReady={this.onGridReady}
            onLoadMore={this.onLoadMore}
          />
        )}
      </div>
    );

    return (
      <div className={styles.CashStatement}>
        <TabTable
          data={assetManagementTab(
            AccountRoutes.CASH_STATEMENT,
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

  private onClickQuery = () => {
    this.queryCashStatement();
  };

  private queryCashStatement = (
    accountNumber?: string,
    offset?: number,
    fetchCount?: number
  ) => {
    if (this.props.selectedAccount) {
      if (this.props.selectedAccount.type === SystemType.DERIVATIVES) {
        this.props.queryDerivativesCashStatement({
          subAccountID:
            accountNumber || this.props.selectedAccount.accountNumber,
          fromDate: formatDateToString(this.state.fromDate, 'yyyyMMdd') || '',
          toDate: formatDateToString(this.state.toDate, 'yyyyMMdd') || '',
          fetchCount: 40,
          offset: offset ? offset + 1 : 0,
        });
      } else {
        this.props.queryEquityCashStatement({
          accountNo: accountNumber || this.props.selectedAccount.accountNumber,
          transactionType: 'ALL',
          fromDate: formatDateToString(this.state.fromDate, 'yyyyMMdd') || '',
          toDate: formatDateToString(this.state.toDate, 'yyyyMMdd') || '',
          fetchCount: 40,
          offset: offset ? offset + 1 : 0,
        });
      }
    }
  };

  private onLoadMore = (offset: number, fetchCount: number) => {
    this.queryCashStatement(undefined, offset, fetchCount);
  };

  private onGridReady = (event: GridReadyEvent) => {
    this.localGridApi = event.api;
  };

  private onResizeGrid = () => {
    setTimeout(() => {
      this.localGridApi?.sizeColumnsToFit();
    });
  };
}

const mapStateToProps = (state: IState) => ({
  selectedAccount: state.selectedAccount,
  equityCashStatement: state.equityCashStatement,
  derivativesCashStatement: state.derivativesCashStatement,
  lang: state.lang,
});

const mapDispatchToProps = {
  queryEquityCashStatement,
  queryDerivativesCashStatement,
};

const CashStatement = withRouter(
  withErrorBoundary(
    withNamespaces('common')(
      connect(mapStateToProps, mapDispatchToProps)(CashStatementComponent)
    ),
    Fallback,
    handleError
  )
);

export default CashStatement;
