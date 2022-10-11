import * as React from 'react';
import * as config from './config';
import * as globalStyles from 'styles/style.scss';
import * as styles from './styles.scss';
import {
  AccountDropdown,
  DateRangePicker,
  Dropdown,
  Fallback,
  SheetData,
  SymbolSearch,
  TabTable,
} from 'components/common';
import { AccountRoutes, Routes } from 'constants/routes';
import { AccountType, OrderStatus, SellBuyType } from 'constants/enum';
import { FaExclamationCircle } from 'react-icons/fa';
import { GridApi, GridReadyEvent } from 'ag-grid-community';
import { IAccount } from 'interfaces/common';
import {
  IDrOrderHistoryParams,
  IParamsEquityOrderHistory,
} from 'interfaces/api';
import { IState } from 'redux/global-reducers';
import { RouteComponentProps, withRouter } from 'react-router';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import {
  derivativesOrderHistoryStatusDropdown,
  orderHistoryStatusDropdown,
  sellBuyDropdown,
} from './enum';
import { formatDateToString } from 'utils/datetime';
import { getDrOrderHistory, getEquityOrderHistory } from './action';
import { handleError } from 'utils/common';
import { isString } from 'lodash';
import { orderBookTab } from '../config';
import { withErrorBoundary } from 'react-error-boundary';

interface IOrderHistoryProps
  extends React.ClassAttributes<OrderHistoryComponent>,
    WithNamespaces,
    RouteComponentProps {
  readonly selectedAccount: IState['selectedAccount'];
  readonly accountList: IState['accountList'];
  readonly currentSymbol: IState['currentSymbol'];
  readonly equityOrderHistory: IState['equityOrderHistory'];
  readonly drOrderHistory: IState['drOrderHistory'];

  readonly getEquityOrderHistory: typeof getEquityOrderHistory;
  readonly getDrOrderHistory: typeof getDrOrderHistory;
}

interface ISecuritiesStatementState {
  readonly fromDate: Date;
  readonly toDate: Date;
  readonly sellBuyType: string;
  readonly selectedAccount?: string;
  readonly orderStatus: OrderStatus;
  readonly validity?: string;
  readonly symbolCode?: string;
}
class OrderHistoryComponent extends React.Component<
  IOrderHistoryProps,
  ISecuritiesStatementState
> {
  private localGridApi?: GridApi;
  private localIsDerivatives: boolean;
  constructor(props: IOrderHistoryProps) {
    super(props);

    this.state = {
      fromDate: new Date(),
      toDate: new Date(),
      sellBuyType: 'All',
      selectedAccount: this.props.selectedAccount?.account,
      orderStatus: OrderStatus.All,
      validity: 'Day',
      symbolCode: '',
    };
  }

  componentDidMount() {
    this.localIsDerivatives =
      this.props.selectedAccount?.accountType === AccountType.DERIVATIVES;
    if (this.localIsDerivatives) {
      this.queryDrOrderHistory();
    } else {
      this.queryEquityOrderHistory();
    }
    this.props.i18n.on('languageChanged', this.onChangeLang);
  }

  componentDidUpdate(
    prevProps: IOrderHistoryProps,
    prevState: ISecuritiesStatementState
  ) {
    if (prevProps.selectedAccount !== this.props.selectedAccount) {
      this.localIsDerivatives =
        this.props.selectedAccount?.accountType === AccountType.DERIVATIVES;
      if (this.localIsDerivatives) {
        this.queryDrOrderHistory();
      } else {
        this.queryEquityOrderHistory();
      }
    }
    setTimeout(() => {
      this.localGridApi?.sizeColumnsToFit();
    });
  }

  componentWillUnmount() {
    this.props.i18n.off('languageChanged', this.onChangeLang);
  }

  render() {
    const { t, drOrderHistory } = this.props;

    const lastRowData = this.props.equityOrderHistory.data.reduce(
      (val, curr) => {
        return {
          symbol: t('TOTAL 2'),
          orderQty: val.orderQty + curr.orderQty,
          matchedQty: val.matchedQty + curr.matchedQty,
          unmatchedQty: val.unmatchedQty + curr.unmatchedQty,
          matchedValue: val.matchedValue + curr.matchedValue,
          transactionFee: val.transactionFee + curr.transactionFee,
          tax: val.tax + curr.tax,
        };
      },
      {
        symbol: t('TOTAL 2'),
        orderQty: 0,
        matchedQty: 0,
        unmatchedQty: 0,
        matchedValue: 0,
        transactionFee: '',
        tax: '',
      }
    );

    const lastRowDataDer = drOrderHistory.data.reduce(
      (val, curr) => {
        return {
          symbol: t('TOTAL 2'),
          orderQuantity: val.orderQuantity + curr.orderQuantity,
          matchedQuantity: val.matchedQuantity + curr.matchedQuantity,
          unmatchedQuantity: val.unmatchedQuantity + curr.unmatchedQuantity,
          matchedValue: val.matchedValue + curr.matchedValue,
          transactionFee: val.transactionFee + curr.transactionFee,
          tax: val.tax + curr.tax,
        };
      },
      {
        symbol: t('TOTAL 2'),
        orderQuantity: 0,
        matchedQuantity: 0,
        unmatchedQuantity: 0,
        matchedValue: 0,
        transactionFee: 0,
        tax: 0,
      }
    );
    const RenderItem = (
      <div className={styles.OrderHistoryTab}>
        <div className={styles.OrderHistoryFilter}>
          <div className={styles.OrderHistoryAccount}>
            <p>{t('Account No.')}</p>
            <AccountDropdown isForm={true} onChange={this.onChangeAccount} />
          </div>
          <div className={styles.OrderHistoryStockSymbol}>
            <p>{t('Stock Symbol')}</p>
            <div className={styles.OrderHistorySymbolPicker}>
              <SymbolSearch
                placeholder={this.state.symbolCode}
                onSymbolSearch={this.onSymbolSearch}
                icon={false}
                isForm={true}
                disabled={this.localIsDerivatives}
              />
            </div>
          </div>
          <div className={styles.OrderHistoryDropdown}>
            <p>{t('Buy/Sell')}</p>
            <Dropdown
              placeholder={this.state.sellBuyType}
              isForm={true}
              data={sellBuyDropdown}
              onSelect={this.onSelectBuySell}
              activeItem={this.state.sellBuyType}
            />
          </div>
          <div className={styles.OrderHistoryDropdown}>
            <p>{t('Status')}</p>
            <Dropdown
              placeholder={this.state.orderStatus}
              isForm={true}
              data={
                this.localIsDerivatives
                  ? derivativesOrderHistoryStatusDropdown()
                  : orderHistoryStatusDropdown()
              }
              onSelect={this.onSelectOrderStatus}
              activeItem={this.state.orderStatus}
            />
          </div>
          {/* <div className={styles.OrderHistoryDropdown}>
            <p>{t('Validity')}</p>
            <Dropdown
              placeholder={this.state.sellBuyType}
              isForm={true}
              data={validityDropdown}
              onSelect={this.onSelectValidity}
              activeItem={this.state.validity}
            />
          </div> */}
          <div className={styles.OrderHistoryDate}>
            <p>{t('Date')}</p>
            <DateRangePicker
              onChangeStartDate={this.onChangeFromDate}
              onChangeEndDate={this.onChangeToDate}
              startDate={this.state.fromDate}
              endDate={this.state.toDate}
            />
          </div>
          <div className={styles.OrderHistoryDate}>
            <button
              className={globalStyles.QueryButton}
              onClick={this.onClickConfirm}
            >
              {t('Query')}
            </button>
          </div>
        </div>
        <div className={styles.OrderHistoryTable}>
          {this.localIsDerivatives ? (
            <SheetData
              rowData={drOrderHistory.data}
              columnDefs={config.getDrOrderHistoryColumnDefs()}
              status={drOrderHistory.status}
              onGridReady={this.onGridReady}
              lastRowData={[lastRowDataDer]}
              defaultColDef={config.DEFAULT_COL_DEF}
            />
          ) : (
            <SheetData
              rowData={this.props.equityOrderHistory.data}
              columnDefs={config.getColumnDefs()}
              status={this.props.equityOrderHistory.status}
              onGridReady={this.onGridReady}
              lastRowData={[lastRowData]}
              onLoadMore={this.onLoadMore}
              defaultColDef={config.DEFAULT_COL_DEF}
            />
          )}
        </div>
        <div className={styles.OrderHistoryFooter}>
          <div className={styles.Note}>
            {`(${t('If the request is rejected, please move on')}`}
            <FaExclamationCircle className={styles.ErrorIcon} size={17} />
            {`${t('to see the rejected reason')}.)`}
          </div>
        </div>
      </div>
    );

    return (
      <div className={styles.OrderHistory}>
        <TabTable
          data={orderBookTab(AccountRoutes.ORDER_HISTORY, RenderItem)}
          onSelect={this.onSelect}
        />
      </div>
    );
  }

  private onSymbolSearch = (code: string) => {
    this.setState({ symbolCode: code });
  };

  private onSelect = (eventKey: string) => {
    this.props.history.push(`/${Routes.ACCOUNT}/${eventKey}`);
  };

  private onChangeAccount = (account: IAccount | string) => {
    if (isString(account)) {
      this.setState({ selectedAccount: account });
    } else {
      this.setState({ selectedAccount: account.account });
    }
  };

  private onChangeFromDate = (date: Date) => {
    this.setState({ fromDate: date });
  };

  private onChangeToDate = (date: Date) => {
    this.setState({ toDate: date });
  };

  private onSelectBuySell = (title: SellBuyType, value: SellBuyType) => {
    this.setState({ sellBuyType: value });
  };

  private onSelectOrderStatus = (title: OrderStatus, value: OrderStatus) => {
    this.setState({ orderStatus: value });
  };

  // private onSelectValidity = (data: string) => {
  //   this.setState({ validity: data });
  // };

  private onClickConfirm = () => {
    if (this.localIsDerivatives) {
      this.queryDrOrderHistory();
    } else {
      this.queryEquityOrderHistory();
    }
  };

  private queryEquityOrderHistory = (accountNumber?: string) => {
    const localParams: IParamsEquityOrderHistory[] = [
      {
        accountNo: this.props.selectedAccount?.accountNumber,
        fromDate: formatDateToString(this.state.fromDate),
        toDate: formatDateToString(this.state.toDate),
        sellBuyType: this.state.sellBuyType,
        stockSymbol: this.state.symbolCode || '',
        status: this.state.orderStatus,
      },
    ];
    this.props.getEquityOrderHistory(localParams);
  };

  private queryDrOrderHistory = (accountNumber?: string) => {
    if (this.props.selectedAccount !== null) {
      const localParams: IDrOrderHistoryParams = {
        accountNumber: this.props.selectedAccount?.accountNumber,
        fromDate: formatDateToString(this.state.fromDate, 'yyyyMMdd'),
        toDate: formatDateToString(this.state.toDate, 'yyyyMMdd'),
        status: [this.state.orderStatus],
        sellBuyType: this.state.sellBuyType.toUpperCase(),
      };
      this.props.getDrOrderHistory(localParams);
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

  private onLoadMore = (offset: number, fetchCount: number) => {
    this.props.getEquityOrderHistory([
      {
        accountNo: this.state.selectedAccount,
        fromDate: formatDateToString(this.state.fromDate),
        toDate: formatDateToString(this.state.toDate),
        sellBuyType: this.state.sellBuyType,
        stockSymbol: this.state.symbolCode || '',
        status: this.state.orderStatus,
        offset,
        fetchCount,
      },
    ]);
  };
}

const mapStateToProps = (state: IState) => ({
  selectedAccount: state.selectedAccount,
  accountList: state.accountList,
  currentSymbol: state.currentSymbol,
  equityOrderHistory: state.equityOrderHistory,
  drOrderHistory: state.drOrderHistory,
});

const mapDispatchToProps = {
  getEquityOrderHistory,
  getDrOrderHistory,
};

const OrderHistory = withRouter(
  withErrorBoundary(
    withNamespaces('common')(
      connect(mapStateToProps, mapDispatchToProps)(OrderHistoryComponent)
    ),
    Fallback,
    handleError
  )
);

export default OrderHistory;
