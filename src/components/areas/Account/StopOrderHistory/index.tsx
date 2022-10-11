import * as React from 'react';
import * as config from './config';
import * as globalStyles from 'styles/style.scss';
import * as styles from './styles.scss';
import {
  AccountDropdown,
  DateRangePicker,
  Dropdown,
  Fallback,
  ModifyOrderForm,
  SheetData,
  SymbolSearch,
  TabTable,
} from 'components/common';
import { AccountRoutes, Routes } from 'constants/routes';
import { FaExclamationCircle } from 'react-icons/fa';
import { GridApi, GridReadyEvent, RowNode } from 'ag-grid-community';
import { IState } from 'redux/global-reducers';
import { IStopOrderHistoryResponse } from 'interfaces/api';
import {
  OrderFormActionMode,
  OrderKind,
  SellBuyType,
  StopOrderStatus,
} from 'constants/enum';
import { RouteComponentProps, withRouter } from 'react-router';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { cancelStopOrder } from 'components/common/OrderForm/actions';
import { connect } from 'react-redux';
import { handleError } from 'utils/common';
import { orderBookTab } from '../config';
import { queryStopOrderHistory, setStopOrderHistoryParams } from './actions';
import { sellBuyDropdown, stopOrderStatusDropdown } from '../OrderHistory/enum';
import {
  setCurrentSymbol,
  subscribeOrderMatch,
  unsubscribeOrderMatch,
} from 'redux/global-actions';
import { withErrorBoundary } from 'react-error-boundary';
import CancelMultiOrderModal, { SCREEN } from '../OrderBook/CancelMultiOrder';

interface IStopOrderHistoryProps
  extends React.ClassAttributes<StopOrderHistoryComponent>,
    WithNamespaces,
    RouteComponentProps {
  readonly selectedAccount: IState['selectedAccount'];
  readonly stopOrderHistory: IState['stopOrderHistory'];
  readonly modifyOrderResult: IState['modifyOrderResult'];
  readonly cancelOrderResult: IState['cancelOrderResult'];
  readonly placeOrderResult: IState['placeOrderResult'];
  readonly modifySpeedOrderResult: IState['modifySpeedOrderResult'];
  readonly cancelSpeedOrderResult: IState['cancelSpeedOrderResult'];

  readonly queryStopOrderHistory: typeof queryStopOrderHistory;
  readonly setStopOrderHistoryParams: typeof setStopOrderHistoryParams;
  readonly subscribeOrderMatch: typeof subscribeOrderMatch;
  readonly unsubscribeOrderMatch: typeof unsubscribeOrderMatch;
  readonly setCurrentSymbol: typeof setCurrentSymbol;
  readonly cancelStopOrder: typeof cancelStopOrder;
}

interface IStopOrderHistoryState {
  readonly isCancelMultiOrderEnabled?: boolean;
  readonly selectedOrder?: IStopOrderHistoryResponse;
  readonly isModifyOrderModalOpened?: boolean;
  readonly isCancelOrderModalOpened?: boolean;
  readonly isCancelMultiOrderModalOpened?: boolean;
}

class StopOrderHistoryComponent extends React.Component<
  IStopOrderHistoryProps,
  IStopOrderHistoryState
> {
  private localGridApi?: GridApi;
  constructor(props: IStopOrderHistoryProps) {
    super(props);

    this.state = {};
  }

  componentDidMount() {
    if (this.props.selectedAccount) {
      this.props.queryStopOrderHistory();
    }
    this.props.i18n.on('languageChanged', this.onChangeLang);
    this.props.subscribeOrderMatch();
  }

  componentDidUpdate(
    prevProps: IStopOrderHistoryProps,
    prevState: IStopOrderHistoryState
  ) {
    if (
      this.props.selectedAccount &&
      (this.props.selectedAccount !== prevProps.selectedAccount ||
        (this.props.modifyOrderResult !== prevProps.modifyOrderResult &&
          (this.props.modifyOrderResult.status.isSucceeded ||
            this.props.modifyOrderResult.status.isFailed)) ||
        (this.props.cancelOrderResult !== prevProps.cancelOrderResult &&
          (this.props.cancelOrderResult.status.isSucceeded ||
            this.props.cancelOrderResult.status.isFailed)) ||
        (this.props.placeOrderResult !== prevProps.placeOrderResult &&
          (this.props.placeOrderResult.status.isSucceeded ||
            this.props.placeOrderResult.status.isFailed)) ||
        (this.props.modifySpeedOrderResult !==
          prevProps.modifySpeedOrderResult &&
          (this.props.modifySpeedOrderResult.status.isSucceeded ||
            this.props.modifySpeedOrderResult.status.isFailed)) ||
        (this.props.cancelSpeedOrderResult !==
          prevProps.cancelSpeedOrderResult &&
          (this.props.cancelSpeedOrderResult.status.isSucceeded ||
            this.props.cancelSpeedOrderResult.status.isFailed)))
    ) {
      this.props.queryStopOrderHistory();
    }
    if (
      this.state.selectedOrder?.code !== prevState.selectedOrder?.code &&
      this.state.selectedOrder?.code
    ) {
      this.props.setCurrentSymbol({
        code: this.state.selectedOrder?.code,
        forceUpdate: true,
        resetData: true,
      });
    }
  }

  componentWillUnmount() {
    this.props.i18n.off('languageChanged', this.onChangeLang);
    this.props.unsubscribeOrderMatch();
  }

  render() {
    const { t, stopOrderHistory } = this.props;
    const columnDefs = config.getColumnDefs(
      this.onClickEdit,
      this.onClickDelete
    );
    const RenderItem = (
      <div className={styles.StopOrderHistoryTab}>
        <div className={styles.StopOrderHistoryFilter}>
          <div className={styles.StopOrderHistoryAccount}>
            <p>{t('Account No.')}</p>
            <AccountDropdown isForm={true} />
          </div>
          <div className={styles.StopOrderHistoryStockSymbol}>
            <p>{t('Stock Symbol')}</p>
            <div className={styles.StopOrderHistorySymbolPicker}>
              <SymbolSearch
                placeholder={stopOrderHistory.params?.code}
                onSymbolSearch={this.onSymbolSearch}
                icon={false}
                isForm={true}
              />
            </div>
          </div>
          <div className={styles.StopOrderHistoryDropdown}>
            <p>{t('Buy/Sell')}</p>
            <Dropdown
              placeholder={stopOrderHistory.params?.sellBuyType}
              isForm={true}
              data={sellBuyDropdown}
              onSelect={this.onSelectBuySell}
              activeItem={stopOrderHistory.params?.sellBuyType}
            />
          </div>
          <div className={styles.StopOrderHistoryDropdown}>
            <p>{t('Status')}</p>
            <Dropdown
              placeholder={stopOrderHistory.params?.status}
              isForm={true}
              data={stopOrderStatusDropdown}
              onSelect={this.onSelectOrderStatus}
              activeItem={stopOrderHistory.params?.status}
            />
          </div>
          <div className={styles.StopOrderHistoryDate}>
            <p>{t('Date')}</p>
            <DateRangePicker
              onChangeStartDate={this.onChangeFromDate}
              onChangeEndDate={this.onChangeToDate}
              startDate={stopOrderHistory.params?.fromDate}
              endDate={stopOrderHistory.params?.toDate}
            />
          </div>
          <div className={styles.StopOrderHistoryDate}>
            <button
              className={globalStyles.QueryButton}
              onClick={this.onClickConfirm}
            >
              {t('Query')}
            </button>
          </div>
        </div>
        <div className={styles.StopOrderHistoryTable}>
          <SheetData
            rowData={this.props.stopOrderHistory.data}
            defaultColDef={config.DEFAULT_COL_DEF}
            status={this.props.stopOrderHistory.status}
            columnDefs={columnDefs}
            onGridReady={this.onGridReady}
            onLoadMore={this.onLoadMore}
            rowSelection="multiple"
            rowDeselection={true}
            rowMultiSelectWithClick={true}
            onRowSelected={this.onRowSelected}
            isRowSelectable={this.isRowSelectable}
            suppressRowClickSelection={true}
          />
        </div>
        <div className={styles.StopOrderHistoryFooter}>
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
        <CancelMultiOrderModal
          isStopOrderHistory
          data={this.localGridApi?.getSelectedRows().map((val) => ({
            ...val,
            symbol: val.code,
            buySellOrder: val.sellBuyType,
            orderQty: val.orderQuantity,
            orderStatus: val.status,
            orderTime: val.createTime,
          }))}
          screen={SCREEN.STOP_ORDER_HISTORY}
          show={this.state.isCancelMultiOrderModalOpened}
          onHide={this.onHideCancelMultiOrderModal}
          onSubmit={this.onSubmitCancelMultiOrder}
        />
      </div>
    );

    return (
      <div className={styles.StopOrderHistory}>
        <TabTable
          data={orderBookTab(AccountRoutes.STOP_ORDER_HISTORY, RenderItem)}
          onSelect={this.onSelect}
        />

        <ModifyOrderForm
          action={OrderFormActionMode.MODIFY}
          data={this.state.selectedOrder}
          show={this.state.isModifyOrderModalOpened}
          onHide={this.onHideModifyOrderModal}
          onSubmit={this.onHideModifyOrderModal}
          orderKind={OrderKind.STOP_LIMIT_ORDER}
        />

        <ModifyOrderForm
          action={OrderFormActionMode.CANCEL}
          data={this.state.selectedOrder}
          show={this.state.isCancelOrderModalOpened}
          onHide={this.onHideCancelOrderModal}
          onSubmit={this.onHideCancelOrderModal}
          orderKind={OrderKind.STOP_LIMIT_ORDER}
        />
      </div>
    );
  }

  private onClickCancelMultiOrder = () => {
    this.setState({ isCancelMultiOrderModalOpened: true });
  };

  private onHideCancelMultiOrderModal = () => {
    this.setState({ isCancelMultiOrderModalOpened: false });
  };

  private onSubmitCancelMultiOrder = () => {
    this.setState({ isCancelMultiOrderModalOpened: false }, () => {
      if (
        this.localGridApi != null &&
        this.localGridApi?.getSelectedRows().length > 0
      ) {
        this.props.cancelStopOrder({
          idList: (this.localGridApi?.getSelectedRows() as IStopOrderHistoryResponse[]).map(
            (val) => `${val.stopOrderId}`
          ),
        });
      }
    });
  };

  private onSymbolSearch = (code: string) => {
    this.props.setStopOrderHistoryParams({ code });
  };

  private onSelect = (eventKey: string) => {
    this.props.history.push(`/${Routes.ACCOUNT}/${eventKey}`);
  };

  private onChangeFromDate = (date: Date) => {
    this.props.setStopOrderHistoryParams({ fromDate: date });
  };

  private onChangeToDate = (date: Date) => {
    this.props.setStopOrderHistoryParams({ toDate: date });
  };

  private onSelectBuySell = (title: SellBuyType, value: SellBuyType) => {
    this.props.setStopOrderHistoryParams({ sellBuyType: value });
  };

  private onSelectOrderStatus = (
    title: StopOrderStatus,
    value: StopOrderStatus
  ) => {
    this.props.setStopOrderHistoryParams({ status: value });
  };

  private onClickConfirm = () => {
    this.props.queryStopOrderHistory();
  };

  private onGridReady = (event: GridReadyEvent) => {
    this.localGridApi = event.api;
  };

  private onRowSelected = () => {
    this.setState({
      isCancelMultiOrderEnabled: this.localGridApi
        ? this.localGridApi.getSelectedRows().length > 0
        : true,
    });
  };

  private isRowSelectable = (node: RowNode) =>
    (node.data as IStopOrderHistoryResponse)?.status ===
    StopOrderStatus.PENDING;

  private onChangeLang = () => {
    setTimeout(() => {
      this.localGridApi?.sizeColumnsToFit();
    });
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

  private onClickEdit = (data: IStopOrderHistoryResponse) => {
    this.setState({ isModifyOrderModalOpened: true, selectedOrder: data });
  };

  private onClickDelete = (data: IStopOrderHistoryResponse) => {
    this.setState({ isCancelOrderModalOpened: true, selectedOrder: data });
  };

  private onLoadMore = (offset: number, fetchCount: number) => {
    console.log('offset', offset);
    console.log('fetchCount', fetchCount);
  };
}

const mapStateToProps = (state: IState) => ({
  selectedAccount: state.selectedAccount,
  stopOrderHistory: state.stopOrderHistory,
  modifyOrderResult: state.modifyOrderResult,
  cancelOrderResult: state.cancelOrderResult,
  placeOrderResult: state.placeOrderResult,
  modifySpeedOrderResult: state.modifySpeedOrderResult,
  cancelSpeedOrderResult: state.cancelSpeedOrderResult,
});

const mapDispatchToProps = {
  queryStopOrderHistory,
  setStopOrderHistoryParams,
  subscribeOrderMatch,
  unsubscribeOrderMatch,
  setCurrentSymbol,
  cancelStopOrder,
};

const StopOrderHistory = withRouter(
  withErrorBoundary(
    withNamespaces('common')(
      connect(mapStateToProps, mapDispatchToProps)(StopOrderHistoryComponent)
    ),
    Fallback,
    handleError
  )
);

export default StopOrderHistory;
