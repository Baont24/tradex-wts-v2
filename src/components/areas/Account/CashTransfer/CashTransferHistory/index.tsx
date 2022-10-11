import * as React from 'react';
import * as config from './config';
import * as globalStyles from 'styles/style.scss';
import * as styles from './styles.scss';
import {
  AccountType,
  CashTransferStatus,
  SystemType,
  TransferType,
} from 'constants/enum';
import {
  DateRangePicker,
  Dropdown,
  Fallback,
  SheetData,
  TabTable,
} from 'components/common';
import { GridApi, GridReadyEvent } from 'ag-grid-community';
import { IState } from 'redux/global-reducers';
import { QUERY_FETCH_COUNT } from 'constants/main';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { formatDateToString, getDateAMonthAgo } from 'utils/datetime';
import { handleError } from 'utils/common';
import {
  queryDerivativeCashTransferHistory,
  queryEquityCashTransferHistory,
  queryVSDCashTransferHistory,
} from './action';
import { withErrorBoundary } from 'react-error-boundary';

interface ICashTransferHistoryProps
  extends React.ClassAttributes<CashTransferHistoryComponent>,
    WithNamespaces {
  readonly selectedAccount: IState['selectedAccount'];
  readonly equityCashTransferHistory: IState['equityCashTransferHistory'];
  readonly VSDCashTransferHistory: IState['VSDCashTransferHistory'];
  readonly derivativeCashTransferHistory: IState['derivativeCashTransferHistory'];
  readonly equityCashTransferResult: IState['equityCashTransferResult'];
  readonly VSDCashTransferResult: IState['VSDCashTransferResult'];
  readonly derivativeInternalCashTransferResult: IState['derivativeInternalCashTransferResult'];
  readonly derivativeBankCashTransferResult: IState['derivativeBankCashTransferResult'];
  readonly queryEquityCashTransferHistory: typeof queryEquityCashTransferHistory;
  readonly queryVSDCashTransferHistory: typeof queryVSDCashTransferHistory;
  readonly queryDerivativeCashTransferHistory: typeof queryDerivativeCashTransferHistory;
  readonly isVSD: boolean;
  readonly isBank: boolean;
}

interface ICashTransferHistoryState {
  readonly fromDate: Date;
  readonly toDate: Date;
  readonly transferType: TransferType;
  readonly transferStatus: CashTransferStatus | string;
}

const transferTypeData = [
  { title: 'TO_SUB', value: TransferType.TO_SUB },
  { title: 'TO_BANK', value: TransferType.TO_BANK },
];

const VSDtransferTypeData = [
  { title: ' FROM_TO_VSD', value: TransferType.FROM_TO_VSD },
  { title: ' VSD_WITHDRAW ', value: TransferType.VSD_WITHDRAW },
  { title: ' VSD_DEPOSIT ', value: TransferType.VSD_DEPOSIT },
];

const transferStatusData = [
  { title: 'ALL', value: 'ALL' },
  { title: 'Pending', value: CashTransferStatus.PENDING },
  { title: 'APPROVED', value: CashTransferStatus.APPROVED },
  { title: 'Reject 1', value: CashTransferStatus.REJECTED },
  { title: 'Deleted', value: CashTransferStatus.DELETED },
];

class CashTransferHistoryComponent extends React.Component<
  ICashTransferHistoryProps,
  ICashTransferHistoryState
> {
  private localGridApi?: GridApi;
  constructor(props: ICashTransferHistoryProps) {
    super(props);

    this.state = {
      fromDate: getDateAMonthAgo(),
      toDate: new Date(),
      transferType: transferTypeData[0].value,
      transferStatus: transferStatusData[0].value,
    };
  }

  componentDidMount() {
    this.props.i18n.on('languageChanged', this.onChangeLang);
    this.queryCashTransferHistory();
  }

  componentDidUpdate(
    prevProps: ICashTransferHistoryProps,
    prevState: ICashTransferHistoryState
  ) {
    if (this.props.selectedAccount !== prevProps.selectedAccount) {
      this.queryCashTransferHistory(this.props.selectedAccount?.account);
    }
    // when To VSD => To Bank
    if (
      prevProps.isVSD === true &&
      prevProps.isBank === false &&
      this.props.isBank
    ) {
      this.setState({ transferType: transferTypeData[1].value }, () => {
        this.queryCashTransferHistory(this.props.selectedAccount?.account);
      });
    }
    // when To VSD => To Sub
    if (
      prevProps.isVSD &&
      prevProps.isBank === false &&
      this.props.isVSD === false &&
      this.props.isBank === false
    ) {
      this.setState({ transferType: transferTypeData[0].value }, () => {
        this.queryCashTransferHistory(this.props.selectedAccount?.account);
      });
    }

    // when To Bank => To Sub
    if (
      prevProps.isVSD === false &&
      prevProps.isBank &&
      this.props.isVSD === false &&
      this.props.isBank === false
    ) {
      this.setState({ transferType: transferTypeData[0].value }, () => {
        this.queryCashTransferHistory(this.props.selectedAccount?.account);
      });
    }
    // when To Bank => To VSD
    if (
      prevProps.isVSD === false &&
      prevProps.isBank === true &&
      this.props.isVSD
    ) {
      this.setState({ transferType: TransferType.FROM_TO_VSD }, () => {
        this.queryCashTransferHistory(
          this.props.selectedAccount?.account,
          this.props.isVSD
        );
      });
    }

    // when To Sub => To Bank
    if (
      prevProps.isVSD === false &&
      prevProps.isBank === false &&
      this.props.isBank
    ) {
      this.setState({ transferType: transferTypeData[1].value }, () => {
        this.queryCashTransferHistory(this.props.selectedAccount?.account);
      });
    }
    // when To Sub => To VSD
    if (
      prevProps.isVSD === false &&
      prevProps.isBank === false &&
      this.props.isVSD
    ) {
      this.setState({ transferType: TransferType.FROM_TO_VSD }, () => {
        this.queryCashTransferHistory(
          this.props.selectedAccount?.account,
          this.props.isVSD
        );
      });
    }

    if (prevState.transferType !== this.state.transferType) {
      this.queryCashTransferHistory(this.props.selectedAccount?.account);
      this.onChangeLang();
    }
  }

  componentWillUnmount() {
    this.props.i18n.off('languageChanged', this.onChangeLang);
  }

  render() {
    const { t } = this.props;
    const isDerivatives =
      this.props.selectedAccount?.type === SystemType.DERIVATIVES;
    const renderItems = (
      <>
        <div className={styles.CashTransferHistoryFilter}>
          <div>
            <p>{t('Transfer Type')}</p>
            <div className={styles.TransferTypeDropdown}>
              <Dropdown
                data={this.props.isVSD ? VSDtransferTypeData : transferTypeData}
                isForm={true}
                onSelect={this.onSelectTransferType}
                activeItem={this.state.transferType}
              />
            </div>
          </div>
          <div>
            <p>{t('Date')}</p>
            <DateRangePicker
              onChangeStartDate={this.onChangeFromDate}
              onChangeEndDate={this.onChangeToDate}
              startDate={this.state.fromDate}
              endDate={this.state.toDate}
            />
          </div>
          <div>
            <button
              className={globalStyles.QueryButton}
              onClick={this.onClickQuery}
            >
              {t('Query')}
            </button>
          </div>
        </div>
        <div className={styles.CashTransferHistorySheet}>
          <SheetData
            rowData={
              this.props.isVSD
                ? this.props.VSDCashTransferHistory.data
                : isDerivatives
                ? this.props.derivativeCashTransferHistory.data
                : this.props.equityCashTransferHistory.data.list
            }
            columnDefs={config.getColumnDefs(this.state.transferType)}
            onGridReady={this.onGridReady}
            status={
              this.props.isVSD
                ? this.props.VSDCashTransferHistory.status
                : isDerivatives
                ? this.props.derivativeCashTransferHistory.status
                : this.props.equityCashTransferHistory.status
            }
            onLoadMore={this.onLoadMore}
          />
        </div>
      </>
    );

    return (
      <div className={styles.CashTransferHistory}>
        <TabTable
          data={[
            {
              key: 'internal-sub',
              title: 'Cash Transfer History 1',
              default: true,
              component: renderItems,
            },
          ]}
        />
      </div>
    );
  }

  private onGridReady = (event: GridReadyEvent) => {
    this.localGridApi = event.api;
  };

  private onChangeLang = () => {
    setTimeout(() => {
      this.localGridApi?.sizeColumnsToFit();
    });
  };

  private onChangeFromDate = (date: Date) => {
    this.setState({ fromDate: date });
  };

  private onChangeToDate = (date: Date) => {
    this.setState({ toDate: date });
  };

  private onSelectTransferType = (title: string, value: TransferType) => {
    this.setState({ transferType: value });
  };

  private queryCashTransferHistory = (
    accountNo?: string,
    isVSD?: boolean,
    offset?: number,
    fetchCount?: number
  ) => {
    let VSD =
      this.props.isVSD &&
      this.props.selectedAccount?.accountType === AccountType.DERIVATIVES;
    const isDerivatives =
      this.props.selectedAccount?.type === SystemType.DERIVATIVES;
    if (isVSD !== undefined) {
      VSD = isVSD;
    }
    if (VSD) {
      this.props.queryVSDCashTransferHistory({
        accountNo: accountNo || this.props.selectedAccount?.account,
        transferType: this.state.transferType,
        status: this.state.transferStatus as CashTransferStatus,
        fromDate: formatDateToString(this.state.fromDate, 'yyyyMMdd'),
        toDate: formatDateToString(this.state.toDate, 'yyyyMMdd'),
        offset: offset || 0,
        fetchCount: fetchCount || QUERY_FETCH_COUNT,
      });
    } else {
      if (isDerivatives) {
        this.props.queryDerivativeCashTransferHistory({
          accountNo: accountNo || this.props.selectedAccount?.account,
          transferType: this.state.transferType,
          status: this.state.transferStatus as CashTransferStatus,
          fromDate: formatDateToString(this.state.fromDate, 'yyyyMMdd'),
          toDate: formatDateToString(this.state.toDate, 'yyyyMMdd'),
          offset: offset || 0,
          fetchCount: fetchCount || QUERY_FETCH_COUNT,
        });
      } else {
        if (
          this.props.equityCashTransferHistory.data.totalCount === 0 ||
          this.props.equityCashTransferHistory.data.totalCount > (offset || 0)
        ) {
          this.props.queryEquityCashTransferHistory({
            accountNo: accountNo || this.props.selectedAccount?.account,
            transferType: this.state.transferType,
            status: this.state.transferStatus as CashTransferStatus,
            fromDate: formatDateToString(this.state.fromDate, 'yyyyMMdd'),
            toDate: formatDateToString(this.state.toDate, 'yyyyMMdd'),
            offset: offset || 0,
            fetchCount: fetchCount || QUERY_FETCH_COUNT,
          });
        }
      }
    }
  };

  private onClickQuery = () => {
    this.queryCashTransferHistory();
  };

  private onLoadMore = (offset: number, fetchCount: number) => {
    this.queryCashTransferHistory(undefined, undefined, offset, fetchCount);
  };
}

const mapStateToProps = (state: IState) => ({
  selectedAccount: state.selectedAccount,
  equityCashTransferHistory: state.equityCashTransferHistory,
  VSDCashTransferHistory: state.VSDCashTransferHistory,
  derivativeCashTransferHistory: state.derivativeCashTransferHistory,
  equityCashTransferResult: state.equityCashTransferResult,
  VSDCashTransferResult: state.VSDCashTransferResult,
  derivativeInternalCashTransferResult:
    state.derivativeInternalCashTransferResult,
  derivativeBankCashTransferResult: state.derivativeBankCashTransferResult,
});

const mapDispatchToProps = {
  queryEquityCashTransferHistory,
  queryVSDCashTransferHistory,
  queryDerivativeCashTransferHistory,
};

const CashTransferHistory = withErrorBoundary(
  withNamespaces('common')(
    connect(mapStateToProps, mapDispatchToProps)(CashTransferHistoryComponent)
  ),
  Fallback,
  handleError
);

export default CashTransferHistory;
