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
import {
  CellClickedEvent,
  GridApi,
  GridReadyEvent,
  RowNode,
} from 'ag-grid-community';
import { IAccount, ITabTableData } from 'interfaces/common';
import {
  IDerivativesOrderBookResponse,
  IEquityOrderBookResponse,
} from 'interfaces/api';
import { IOrderBookReducer } from 'interfaces/reducers';
import { IState } from 'redux/global-reducers';
import {
  OrderFormActionMode,
  OrderStatus,
  SellBuyType,
  SystemType,
} from 'constants/enum';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import {
  cancelDerivativesOrder,
  cancelOrder,
} from 'components/common/OrderForm/actions';
import { connect } from 'react-redux';
import { handleError } from 'utils/common';
import {
  orderStatusDropdown,
  sellBuyDropdown,
} from 'components/areas/Account/OrderHistory/enum';
import { queryOrderBook } from 'components/areas/Account/OrderBook/actions';
import {
  subscribeOrderMatch,
  unsubscribeOrderMatch,
} from 'redux/global-actions';
import { withErrorBoundary } from 'react-error-boundary';
import CancelMultiOrderModal from 'components/areas/Account/OrderBook/CancelMultiOrder';
import OrderInfo from 'components/areas/Account/OrderBook/OrderInfo';

interface IOrderBookSectionProps
  extends React.ClassAttributes<OrderBookSectionComponent>,
    WithNamespaces {
  readonly selectedAccount: IState['selectedAccount'];
  readonly orderBook: IState['orderBook'];

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
  readonly isOrderInfoModalOpened?: boolean;
  readonly isCancelMultiOrderEnabled?: boolean;
  readonly isCancelMultiOrderModalOpened?: boolean;
  readonly selectedOrder?: IOrderBookReducer;
  readonly isModifyOrderModalOpened?: boolean;
  readonly isCancelOrderModalOpened?: boolean;
}

class OrderBookSectionComponent extends React.Component<
  IOrderBookSectionProps,
  IOrderBookState
> {
  private localGridApi?: GridApi;
  constructor(props: IOrderBookSectionProps) {
    super(props);

    this.state = {
      symbolCode: '',
      sellBuyType: 'ALL',
      accountNumber: this.props.selectedAccount?.accountNumber,
      orderStatus: OrderStatus.All,
    };
  }

  componentDidMount() {
    this.queryOrderBook();
    this.props.i18n.on('languageChanged', this.onChangeLang);
    this.props.subscribeOrderMatch();
  }

  componentDidUpdate(prevProps: IOrderBookSectionProps) {
    if (prevProps.selectedAccount !== this.props.selectedAccount) {
      this.queryOrderBook();
      this.localGridApi?.setColumnDefs(
        config.getColumnDefs(
          this.onClickEdit,
          this.onClickDelete,
          this.onViewCellClicked,
          this.props.selectedAccount?.type === SystemType.EQUITY
        )
      );
      this.onChangeLang();
    }
  }

  componentWillUnmount() {
    this.props.i18n.off('languageChanged', this.onChangeLang);
    this.props.unsubscribeOrderMatch();
  }

  render() {
    const { t, selectedAccount } = this.props;
    const columnDefs = config.getColumnDefs(
      this.onClickEdit,
      this.onClickDelete,
      this.onViewCellClicked,
      selectedAccount?.type === SystemType.EQUITY
    );
    const lastRowData = this.props.orderBook.data.reduce(
      (val, curr) => ({
        totalCell: t('TOTAL 2'),
        orderQuantity: val.orderQuantity + curr.orderQuantity,
        orderPrice: '--',
        matchedPrice: '--',
        matchedQuantity: val.matchedQuantity + curr.matchedQuantity,
      }),
      {
        totalCell: t('TOTAL 2'),
        orderQuantity: 0,
        orderPrice: '--',
        matchedPrice: '--',
        matchedQuantity: 0,
      }
    );
    const renderItems = (
      <div className={styles.OrderBookSectionTab}>
        <div className={styles.OrderBookFilter}>
          <div className={styles.OrderBookCancel}>
            <button
              className={styles.CancelButton}
              disabled={!this.state.isCancelMultiOrderEnabled}
              onClick={this.onClickCancelMultiOrder}
            >
              {t('Cancel Order')}
            </button>
          </div>
          <div className={styles.OrderBookAccount}>
            <AccountDropdown
              isForm={true}
              isSelectedAll={false}
              onChange={this.onChangeAccount}
            />
          </div>
          <div className={styles.OrderBookStockSymbol}>
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
            <Dropdown
              placeholder={this.state.sellBuyType}
              isForm={true}
              data={sellBuyDropdown}
              onSelect={this.onSelectBuySell}
              activeItem={this.state.sellBuyType}
            />
          </div>
          <div className={styles.OrderBookDropdown}>
            <Dropdown
              placeholder={this.state.sellBuyType}
              isForm={true}
              data={orderStatusDropdown()}
              onSelect={this.onSelectOrderStatus}
              activeItem={this.state.orderStatus}
              disabled={true}
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
        <div className={styles.OrderBookTable}>
          <SheetData
            rowData={this.props.orderBook.data}
            columnDefs={columnDefs}
            rowSelection="multiple"
            status={this.props.orderBook.status}
            rowDeselection={true}
            rowMultiSelectWithClick={true}
            lastRowData={[lastRowData]}
            defaultColDef={config.DEFAULT_COL_DEF}
            onGridReady={this.onGridReady}
            onRowSelected={this.onRowSelected}
            isRowSelectable={this.isRowSelectable}
            suppressRowClickSelection={true}
          />
        </div>

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
    const tabs: ITabTableData[] = [
      {
        key: 'order-book',
        title: t('Order Book'),
        default: true,
        component: renderItems,
      },
    ];

    return (
      <div className={styles.OrderBookSection}>
        <TabTable data={tabs} />
      </div>
    );
  }

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

  private onHideCancelMultiOrderModal = () => {
    this.setState({ isCancelMultiOrderModalOpened: false });
  };

  private onHideOrderInfoModal = () => {
    this.setState({ isOrderInfoModalOpened: false, selectedOrder: undefined });
  };

  private isRowSelectable = (node: RowNode) =>
    (node.data as IEquityOrderBookResponse)?.cancellable;

  private onRowSelected = () => {
    this.setState({
      isCancelMultiOrderEnabled:
        this.localGridApi != null &&
        this.localGridApi.getSelectedRows().length > 1,
    });
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

  private onChangeAccount = (account: IAccount | string) => {
    if (typeof account === 'string') {
      this.setState({ accountNumber: account });
    }
  };

  private onSymbolSearch = (code: string | null) => {
    this.setState({ symbolCode: code || '' });
  };

  private onSelectBuySell = (data: SellBuyType) => {
    this.setState({ sellBuyType: data.toUpperCase() });
  };

  private onSelectOrderStatus = (data: OrderStatus) => {
    this.setState({ orderStatus: data });
  };

  private onGridReady = (event: GridReadyEvent) => {
    this.localGridApi = event.api;
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

  private onChangeLang = () => {
    setTimeout(() => {
      this.localGridApi?.sizeColumnsToFit();
    });
  };

  private onClickQuery = () => {
    this.queryOrderBook();
  };

  private queryOrderBook = () => {
    if (this.props.selectedAccount != null) {
      this.props.queryOrderBook({
        accountNumber: this.props.selectedAccount.accountNumber,
        systemType: this.props.selectedAccount.type,
        stockSymbol: this.state.symbolCode,
        sellBuyType: this.state.sellBuyType as SellBuyType,
        status: this.state.orderStatus,
        validity: '',
      });
    }
  };
}

const mapStateToProps = (state: IState) => ({
  selectedAccount: state.selectedAccount,
  orderBook: state.orderBook,
});

const mapDispatchToProps = {
  queryOrderBook,
  cancelOrder,
  cancelDerivativesOrder,
  subscribeOrderMatch,
  unsubscribeOrderMatch,
};

const OrderBookSection = withErrorBoundary(
  withNamespaces('common')(
    connect(mapStateToProps, mapDispatchToProps)(OrderBookSectionComponent)
  ),
  Fallback,
  handleError
);

export default OrderBookSection;
