import * as React from 'react';
import * as config from './config';
import * as globalStyles from 'styles/style.scss';
import * as styles from './styles.scss';
import {
  AccountDropdown,
  Dropdown,
  Fallback,
  ModifyOrderForm,
  SheetData,
  SymbolSearch,
  TabTable,
} from 'components/common';
import { AccountRoutes, Routes } from 'constants/routes';
import {
  AccountType,
  OrderFormActionMode,
  OrderStatus,
  OrderStatusResponse,
  SellBuyType,
  SystemType,
} from 'constants/enum';
import {
  CellClickedEvent,
  GridApi,
  GridReadyEvent,
  RowNode,
} from 'ag-grid-community';
import { FaExclamationCircle } from 'react-icons/fa';
import { IAccount } from 'interfaces/common';
import {
  IDerivativesOrderBookResponse,
  IEquityOrderBookResponse,
} from 'interfaces/api';
import { IOrderBookReducer } from 'interfaces/reducers';
import { IState } from 'redux/global-reducers';
import { RouteComponentProps, withRouter } from 'react-router';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import {
  cancelDerivativesOrder,
  cancelOrder,
} from 'components/common/OrderForm/actions';
import { connect } from 'react-redux';
import {
  derivativesOrderStatusDropdown,
  orderStatusDropdown,
  sellBuyDropdown,
} from '../OrderHistory/enum';
import { handleError } from 'utils/common';
import { orderBookTab } from '../config';
import { queryOrderBook } from './actions';
import {
  subscribeOrderMatch,
  unsubscribeOrderMatch,
} from 'redux/global-actions';
import { withErrorBoundary } from 'react-error-boundary';
import CancelMultiOrderModal from './CancelMultiOrder';
import OrderInfo from './OrderInfo';

interface IOrderBookProps
  extends React.ClassAttributes<OrderBookComponent>,
    WithNamespaces,
    RouteComponentProps {
  readonly selectedAccount: IState['selectedAccount'];
  readonly currentSymbol: IState['currentSymbol'];
  readonly orderBook: IState['orderBook'];
  readonly modifyOrderResult: IState['modifyOrderResult'];
  readonly cancelOrderResult: IState['cancelOrderResult'];
  readonly placeOrderResult: IState['placeOrderResult'];
  readonly isSmallComponent?: boolean;
  readonly refresh?: boolean;

  readonly queryOrderBook: typeof queryOrderBook;
  readonly cancelOrder: typeof cancelOrder;
  readonly cancelDerivativesOrder: typeof cancelDerivativesOrder;
  readonly subscribeOrderMatch: typeof subscribeOrderMatch;
  readonly unsubscribeOrderMatch: typeof unsubscribeOrderMatch;
}

interface IOrderBookState {
  readonly sellBuyType: string;
  readonly accountNumber?: string;
  readonly orderStatus: OrderStatus;
  readonly symbolCode: string;
  readonly fromDate: Date;
  readonly toDate: Date;
  readonly isModifyOrderModalOpened?: boolean;
  readonly isCancelOrderModalOpened?: boolean;
  readonly isOrderInfoModalOpened?: boolean;
  readonly selectedOrder?: IOrderBookReducer;
  readonly isCancelMultiOrderEnabled?: boolean;
  readonly isCancelMultiOrderModalOpened?: boolean;
}

class OrderBookComponent extends React.Component<
  IOrderBookProps,
  IOrderBookState
> {
  private localGridApi?: GridApi;
  private localIsDerivatives: boolean;

  constructor(props: IOrderBookProps) {
    super(props);

    this.state = {
      symbolCode: '',
      sellBuyType: 'All',
      accountNumber: this.props.selectedAccount?.accountNumber,
      orderStatus: OrderStatus.All,
      fromDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 day ago
      toDate: new Date(),
    };
  }

  componentDidMount() {
    this.localIsDerivatives =
      this.props.selectedAccount?.accountType === AccountType.DERIVATIVES;
    this.queryOrderBook();
    this.props.i18n.on('languageChanged', this.onChangeLang);
    this.props.subscribeOrderMatch();
  }

  componentDidUpdate(prevProps: IOrderBookProps) {
    if (
      prevProps.refresh !== this.props.refresh ||
      prevProps.selectedAccount !== this.props.selectedAccount ||
      (this.props.placeOrderResult !== prevProps.placeOrderResult &&
        this.props.placeOrderResult.data) ||
      (this.props.cancelOrderResult !== prevProps.cancelOrderResult &&
        this.props.cancelOrderResult.status.isSucceeded) ||
      (this.props.modifyOrderResult !== prevProps.modifyOrderResult &&
        this.props.modifyOrderResult.data)
    ) {
      this.localIsDerivatives =
        this.props.selectedAccount?.accountType === AccountType.DERIVATIVES;
      this.setState({ accountNumber: this.props.selectedAccount?.account });
      this.queryOrderBook();
      if (!this.props.isSmallComponent) {
        this.localGridApi?.setColumnDefs(
          config.getColumnDefs(
            this.onClickEdit,
            this.onClickDelete,
            this.onViewCellClicked,
            this.props.selectedAccount?.type === SystemType.EQUITY
          )
        );
      }
      this.onChangeLang();
    }
  }

  componentWillUnmount() {
    this.props.i18n.off('languageChanged', this.onChangeLang);
    this.props.unsubscribeOrderMatch();
  }

  render() {
    const { t, selectedAccount, orderBook } = this.props;
    const rowData = orderBook.data.filter((order) => order.orderTime);
    const columnDefs = this.props.isSmallComponent
      ? config.getMiniColumnDefs(
          this.onClickEdit,
          this.onClickDelete,
          this.onViewCellClicked
        )
      : config.getColumnDefs(
          this.onClickEdit,
          this.onClickDelete,
          this.onViewCellClicked,
          selectedAccount?.type === SystemType.EQUITY
        );

    const lastRowData = this.props.orderBook.data.reduce(
      (val, curr) => {
        return {
          totalCell: t('TOTAL 2'),
          orderQuantity: val.orderQuantity + curr.orderQuantity,
          orderPrice: '--',
          matchedPrice: '--',
          matchedQuantity:
            curr.orderStatus === OrderStatusResponse.CANCELLED
              ? val.matchedQuantity
              : val.matchedQuantity + curr.matchedQuantity,
          matchedValue: val.matchedValue + curr.matchedValue,
          unmatchedQuantity:
            curr.orderStatus === OrderStatusResponse.CANCELLED
              ? val.unmatchedQuantity
              : val.unmatchedQuantity + curr.unmatchedQuantity,
          canceledQty: val.canceledQty + (curr.canceledQty || 0),
          orderStatus: '--',
        };
      },
      {
        totalCell: t('TOTAL 2'),
        orderQuantity: 0,
        orderPrice: '--',
        matchedPrice: '--',
        matchedQuantity: 0,
        matchedValue: 0,
        unmatchedQuantity: 0,
        canceledQty: 0,
        orderStatus: '',
      }
    );
    const RenderItem = (
      <div className={styles.OrderBookTab}>
        {!this.props.isSmallComponent && (
          <div className={styles.OrderBookFilter}>
            <div className={styles.OrderBookAccount}>
              <p>{t('Account No.')}</p>
              <AccountDropdown
                isForm={true}
                isSelectedAll={false}
                onChange={this.onChangeAccount}
              />
            </div>
            <div className={styles.OrderBookStockSymbol}>
              <p>{t('Stock Symbol')}</p>
              <div className={styles.OrderBookSymbolPicker}>
                <SymbolSearch
                  placeholder={this.state.symbolCode}
                  onSymbolSearch={this.onSymbolSearch}
                  icon={false}
                  isForm={true}
                />
              </div>
            </div>
            <div className={styles.OrderBookDropdown}>
              <p>{t('Buy/Sell')}</p>
              <Dropdown
                placeholder={this.state.sellBuyType}
                isForm={true}
                data={sellBuyDropdown}
                onSelect={this.onSelectBuySell}
                activeItem={this.state.sellBuyType}
              />
            </div>
            <div className={styles.OrderBookDropdown}>
              <p>{t('Status')}</p>
              <Dropdown
                placeholder={this.state.orderStatus}
                isForm={true}
                data={
                  this.localIsDerivatives
                    ? derivativesOrderStatusDropdown()
                    : orderStatusDropdown()
                }
                onSelect={this.onSelectOrderStatus}
                activeItem={this.state.orderStatus}
              />
            </div>
            <div className={styles.OrderBookQuery}>
              <button
                className={globalStyles.QueryButton}
                onClick={this.onClickQuery}
              >
                {t('Query')}
              </button>
            </div>
          </div>
        )}
        <div className={styles.OrderBookTable}>
          <SheetData
            rowData={rowData}
            columnDefs={columnDefs}
            rowSelection="multiple"
            rowDeselection={true}
            status={this.props.orderBook.status}
            rowMultiSelectWithClick={true}
            defaultColDef={config.DEFAULT_COL_DEF}
            lastRowData={
              this.props.isSmallComponent ? undefined : [lastRowData]
            }
            onGridReady={this.onGridReady}
            onRowSelected={this.onRowSelected}
            isRowSelectable={this.isRowSelectable}
            suppressRowClickSelection={true}
            onLoadMore={this.onLoadMore}
          />
        </div>
        {!this.props.isSmallComponent && (
          <div className={styles.OrderBookFooter}>
            <button
              className={styles.CancelButton}
              disabled={!this.state.isCancelMultiOrderEnabled}
              onClick={this.onClickCancelMultiOrder}
            >
              {t('Cancel orders')}
            </button>
            <div className={styles.Note}>
              {`(${t('If the request is rejected, please move on')}`}
              <FaExclamationCircle className={styles.ErrorIcon} size={17} />
              {`${t('to see the rejected reason')}.)`}
            </div>
          </div>
        )}

        <ModifyOrderForm
          action={OrderFormActionMode.MODIFY}
          data={this.state.selectedOrder}
          show={this.state.isModifyOrderModalOpened}
          onHide={this.onHideModifyOrderModal}
          onSubmit={this.onHideModifyOrderModal}
        />

        <ModifyOrderForm
          action={OrderFormActionMode.CANCEL}
          data={this.state.selectedOrder}
          show={this.state.isCancelOrderModalOpened}
          onHide={this.onHideCancelOrderModal}
          onSubmit={this.onHideCancelOrderModal}
        />

        <OrderInfo
          data={this.state.selectedOrder}
          show={this.state.isOrderInfoModalOpened}
          onHide={this.onHideOrderInfoModal}
        />

        <CancelMultiOrderModal
          data={this.localGridApi?.getSelectedRows()}
          show={this.state.isCancelMultiOrderModalOpened}
          onHide={this.onHideCancelMultiOrderModal}
          onSubmit={this.onSubmitCancelMultiOrder}
        />
      </div>
    );

    return (
      <div className={styles.OrderBook}>
        <TabTable
          data={orderBookTab(AccountRoutes.ORDER_BOOK, RenderItem)}
          onSelect={this.onSelect}
        />
      </div>
    );
  }

  private onSelect = (eventKey: string) => {
    this.props.history.push(`/${Routes.ACCOUNT}/${eventKey}`);
  };

  private onSymbolSearch = (code: string | null) => {
    this.setState({ symbolCode: code || '' });
  };

  private onChangeAccount = (account: IAccount | string) => {
    if (typeof account === 'string') {
      this.setState({ accountNumber: account });
    }
  };

  private onSelectBuySell = (title: SellBuyType, value: SellBuyType) => {
    this.setState({ sellBuyType: value });
  };

  private onSelectOrderStatus = (title: OrderStatus, value: OrderStatus) => {
    this.setState({ orderStatus: value });
  };

  private onClickQuery = () => {
    this.queryOrderBook();
  };

  private onGridReady = (event: GridReadyEvent) => {
    this.localGridApi = event.api;
  };

  private onChangeLang = () => {
    setTimeout(() => {
      this.localGridApi?.sizeColumnsToFit();
    });
  };

  private onClickEdit = (data: IOrderBookReducer) => {
    this.setState({ isModifyOrderModalOpened: true, selectedOrder: data });
  };

  private onClickDelete = (data: IOrderBookReducer) => {
    this.setState({ isCancelOrderModalOpened: true, selectedOrder: data });
  };

  private onViewCellClicked = (event: CellClickedEvent) => {
    this.setState({ isOrderInfoModalOpened: true, selectedOrder: event.data });
  };

  private onRowSelected = () => {
    this.setState({
      isCancelMultiOrderEnabled:
        this.localGridApi != null &&
        this.localGridApi.getSelectedRows().length >= 1,
    });
  };

  private isRowSelectable = (node: RowNode) =>
    (node.data as IEquityOrderBookResponse)?.cancellable;

  private queryOrderBook = (offset?: number) => {
    if (this.props.selectedAccount != null) {
      this.props.queryOrderBook({
        accountNumber: this.props.selectedAccount.accountNumber,
        systemType: this.props.selectedAccount.type,
        stockSymbol: this.state.symbolCode,
        sellBuyType: this.state.sellBuyType as SellBuyType,
        status: this.state.orderStatus,
        validity: '',
        offset: offset ?? 0,
      });
    }
  };

  private onLoadMore = (offset: number, fetchCount: number) => {
    this.queryOrderBook(offset);
  };
  private onHideModifyOrderModal = () => {
    this.setState({
      isModifyOrderModalOpened: false,
      selectedOrder: undefined,
    });
  };

  private onHideCancelOrderModal = () => {
    this.setState({
      isCancelOrderModalOpened: false,
      selectedOrder: undefined,
    });
  };

  private onHideOrderInfoModal = () => {
    this.setState({ isOrderInfoModalOpened: false, selectedOrder: undefined });
  };

  private onHideCancelMultiOrderModal = () => {
    this.setState({ isCancelMultiOrderModalOpened: false });
  };

  private onClickCancelMultiOrder = () => {
    this.setState({ isCancelMultiOrderModalOpened: true });
  };

  private onSubmitCancelMultiOrder = () => {
    this.setState({ isCancelMultiOrderModalOpened: false }, () => {
      if (
        this.localGridApi != null &&
        this.localGridApi?.getSelectedRows().length > 0 &&
        this.state.accountNumber != null
      ) {
        const isDerivatives =
          this.props.selectedAccount?.type === SystemType.DERIVATIVES;
        if (isDerivatives) {
          this.props.cancelDerivativesOrder({
            accountNumber: this.state.accountNumber,
            orderInfo: (this.localGridApi?.getSelectedRows() as IDerivativesOrderBookResponse[]).map(
              (val) => ({
                commodityName: val.commodityName,
                contractMonth: val.contractMonth,
                marketID: val.marketID,
                orderGroupID: val.orderGroupID,
                orderNumber: val.orderNumber,
                orderType: val.orderType,
                sellBuyType: val.sellBuyType,
                symbolCode: val.symbol,
                validity: val.validity,
                validityDate: val.validityDate,
              })
            ),
          });
        } else {
          this.props.cancelOrder({
            accountNo: this.state.accountNumber,
            orders: (this.localGridApi?.getSelectedRows() as IEquityOrderBookResponse[]).map(
              (val) => ({
                orderGroupNo: val.orderGroupNo,
                orderNo: val.orderNo,
              })
            ),
          });
        }
      }
    });
  };
}

const mapStateToProps = (state: IState) => ({
  selectedAccount: state.selectedAccount,
  currentSymbol: state.currentSymbol,
  orderBook: state.orderBook,
  modifyOrderResult: state.modifyOrderResult,
  cancelOrderResult: state.cancelOrderResult,
  placeOrderResult: state.placeOrderResult,
});

const mapDispatchToProps = {
  queryOrderBook,
  cancelOrder,
  cancelDerivativesOrder,
  subscribeOrderMatch,
  unsubscribeOrderMatch,
};

const OrderBook = withRouter(
  withErrorBoundary(
    withNamespaces('common')(
      connect(mapStateToProps, mapDispatchToProps)(OrderBookComponent)
    ),
    Fallback,
    handleError
  )
);

export default OrderBook;
