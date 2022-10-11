import * as React from 'react';
import * as config from './config';
import * as globalStyles from 'styles/style.scss';
import * as styles from './styles.scss';
import {
  AccountDropdown,
  DateRangePicker,
  Fallback,
  OtpModal,
  SheetData,
  SymbolSearch,
  TabTable,
} from 'components/common';
import { AccountRoutes, Routes } from 'constants/routes';
import { FaExclamationCircle } from 'react-icons/fa';
import { GridApi, GridReadyEvent, RowNode } from 'ag-grid-community';
import { IAccount } from 'interfaces/common';
import { IOrderConfirmationResponse } from 'interfaces/api';
import { IState } from 'redux/global-reducers';
import {
  QUERY_FETCH_COUNT,
  TIME_FORMAT_DISPLAY,
  TIME_FORMAT_INPUT,
} from 'constants/main';
import { RouteComponentProps, withRouter } from 'react-router';
import { SystemType } from 'constants/enum';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import {
  formatDateToDisplay,
  formatDateToString,
  formatTimeToDisplay,
  getDateAMonthAgo,
} from 'utils/datetime';
import { formatNumber, handleError } from 'utils/common';
import { orderBookTab } from '../config';
import {
  queryOrderConfirmation,
  queryOrderConfirmationSubmit,
} from './actions';
import { withErrorBoundary } from 'react-error-boundary';

interface IOrderConfirmationProps
  extends React.ClassAttributes<OrderConfirmationComponent>,
    WithNamespaces,
    RouteComponentProps {
  readonly selectedAccount: IState['selectedAccount'];
  readonly orderConfirmation: IState['orderConfirmation'];
  readonly orderConfirmationSubmit: IState['orderConfirmationSubmit'];

  readonly queryOrderConfirmation: typeof queryOrderConfirmation;
  readonly queryOrderConfirmationSubmit: typeof queryOrderConfirmationSubmit;
}

interface IOrderConfirmationState {
  readonly accountNumber?: string;
  readonly symbolCode?: string;
  readonly fromDate: Date;
  readonly toDate: Date;
  readonly isConfirmButtonEnabled?: boolean;
  readonly showConfirmModal?: boolean;
}

class OrderConfirmationComponent extends React.Component<
  IOrderConfirmationProps,
  IOrderConfirmationState
> {
  private localGridApi?: GridApi;

  constructor(props: IOrderConfirmationProps) {
    super(props);

    this.state = {
      accountNumber: props.selectedAccount?.accountNumber,
      fromDate: getDateAMonthAgo(),
      toDate: new Date(),
      symbolCode: '',
    };
  }

  componentDidMount() {
    this.queryData();
    this.props.i18n.on('languageChanged', this.onChangeLang);
  }

  componentDidUpdate(prevProps: IOrderConfirmationProps) {
    if (
      prevProps.selectedAccount !== this.props.selectedAccount ||
      prevProps.orderConfirmationSubmit !== this.props.orderConfirmationSubmit
    ) {
      this.queryData();
      this.localGridApi?.setColumnDefs(
        config.getColumnDefs(
          this.props.selectedAccount?.type === SystemType.DERIVATIVES
        )
      );
    }
  }

  componentWillUnmount() {
    this.props.i18n.off('languageChanged', this.onChangeLang);
  }

  render() {
    const { t, selectedAccount } = this.props;
    const getColumnDefs = config.getColumnDefs(
      selectedAccount?.type === SystemType.DERIVATIVES
    );

    const RenderItem = (
      <div className={styles.OrderConfirmationTab}>
        <div className={styles.OrderConfirmationFilter}>
          <div className={styles.OrderConfirmationAccount}>
            <p>{t('Account No.')}</p>
            <AccountDropdown isForm={true} onChange={this.onChangeAccount} />
          </div>
          <div className={styles.OrderConfirmationStockSymbol}>
            <p>{t('Stock Symbol')}</p>
            <div className={styles.OrderConfirmationSymbolPicker}>
              <SymbolSearch
                placeholder={this.state.symbolCode}
                onSymbolSearch={this.onSymbolSearch}
                icon={false}
                isForm={true}
                disabled={selectedAccount?.type === SystemType.DERIVATIVES}
              />
            </div>
          </div>
          <div className={styles.OrderConfirmationDate}>
            <p>{t('Date')}</p>
            <DateRangePicker
              onChangeStartDate={this.onChangeFromDate}
              onChangeEndDate={this.onChangeToDate}
              startDate={this.state.fromDate}
              endDate={this.state.toDate}
            />
          </div>
          <div className={styles.OrderConfirmationDate}>
            <button
              className={globalStyles.QueryButton}
              onClick={this.onClickQuery}
            >
              {t('Query')}
            </button>
          </div>
        </div>
        <div className={styles.OrderConfirmationTable}>
          <SheetData
            rowData={this.props.orderConfirmation.data}
            columnDefs={getColumnDefs}
            status={this.props.orderConfirmation.status}
            onGridReady={this.onGridReady}
            rowSelection="multiple"
            rowDeselection={true}
            rowMultiSelectWithClick={true}
            defaultColDef={config.DEFAULT_COL_DEF}
            onRowSelected={this.onRowSelected}
            suppressRowClickSelection={true}
            onLoadMore={this.queryData}
            isRowSelectable={this.isRowSelectable}
          />
        </div>
        <div className={styles.OrderConfirmationFooter}>
          <button
            className={styles.ConfirmButton}
            disabled={!this.state.isConfirmButtonEnabled}
            onClick={this.onOpenModal}
          >
            {t('Confirm')}
          </button>
          <div className={styles.Note}>
            {`(${t('If the request is rejected, please move on')}`}
            <FaExclamationCircle className={styles.ErrorIcon} size={17} />
            {`${t('to see the rejected reason')}.)`}
          </div>
        </div>
      </div>
    );

    return (
      <div className={styles.OrderConfirmation}>
        <TabTable
          data={orderBookTab(AccountRoutes.ORDER_CONFIRMATION, RenderItem)}
          onSelect={this.onSelect}
        />
        <OtpModal
          className={styles.ConfirmOrderModal}
          show={this.state.showConfirmModal}
          onHide={this.onHideModal}
          onSubmit={this.onConfirm}
          horizontal={true}
          size="lg"
          isHorizontalOTP={true}
        >
          <div className={styles.Title}>{t('Order Confirmation Request')}</div>
          <div className={styles.OrderTable}>
            <table>
              <thead>
                <tr>
                  <th>{t('Date')}</th>
                  <th>{t('Time')}</th>
                  <th>{t('Account No.')}</th>
                  <th>{t('Order Type')}</th>
                  <th>{t('Stock Symbol')}</th>
                  <th>{t('Volume')}</th>
                  <th>{t('Price')}</th>
                </tr>
              </thead>
              <tbody>
                {(this.localGridApi?.getSelectedRows() as IOrderConfirmationResponse[])?.map(
                  (val, i) => (
                    <tr key={i}>
                      <td>{formatDateToDisplay(val.date)}</td>
                      <td>
                        {formatTimeToDisplay(
                          val.time,
                          TIME_FORMAT_DISPLAY,
                          TIME_FORMAT_INPUT,
                          true
                        )}
                      </td>
                      <td>{val.accountNo}</td>
                      <td>{val.orderType}</td>
                      <td>{val.stockSymbol}</td>
                      <td>{formatNumber(val.volume, 2)}</td>
                      <td>{formatNumber(val.price, 2)}</td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </OtpModal>
      </div>
    );
  }

  private isRowSelectable = (node: RowNode) => {
    return node.data.status !== 'SIGNED';
  };

  private onSelect = (eventKey: string) => {
    this.props.history.push(`/${Routes.ACCOUNT}/${eventKey}`);
  };

  private onSymbolSearch = (code: string) => {
    this.setState({ symbolCode: code });
  };

  private onChangeAccount = (account: IAccount) => {
    if (account.accountNumber) {
      this.setState({ accountNumber: account.accountNumber });
    }
  };

  private onChangeFromDate = (fromDate: Date) => {
    this.setState({ fromDate });
  };

  private onChangeToDate = (toDate: Date) => {
    this.setState({ toDate });
  };

  private onClickQuery = () => {
    this.queryData();
  };

  private onConfirm = () => {
    this.setState({ showConfirmModal: false }, () => {
      if (
        this.localGridApi != null &&
        this.localGridApi?.getSelectedRows().length > 0 &&
        this.state.accountNumber != null &&
        this.props.selectedAccount != null
      ) {
        const data = this.localGridApi?.getSelectedRows() as
          | IOrderConfirmationResponse[]
          | undefined;
        if (data != null) {
          const details =
            this.props.selectedAccount.type === SystemType.DERIVATIVES
              ? data.map((val) => ({
                  orderGroupId: val.orderGroupId,
                  isHistory: val.isHistory,
                  refId: val.refId,
                }))
              : data.map((val) => ({
                  orderGroupId: val.orderNo,
                  isHistory: val.isHistory,
                  refId: val.refID,
                }));

          this.props.queryOrderConfirmationSubmit({
            accountNumber: this.state.accountNumber,
            systemType: this.props.selectedAccount.type,
            details,
          });
        }
      }
    });
  };

  private onRowSelected = () => {
    this.setState({
      isConfirmButtonEnabled: this.localGridApi
        ? this.localGridApi.getSelectedRows().length > 0
        : true,
    });
  };

  private onHideModal = () => {
    this.setState({ showConfirmModal: false });
  };

  private onOpenModal = () => {
    this.setState({ showConfirmModal: true });
  };

  private queryData = (offset?: number, fetchCount?: number) => {
    if (this.props.selectedAccount) {
      this.props.queryOrderConfirmation({
        accountNo: this.props.selectedAccount.accountNumber,
        systemType: this.props.selectedAccount.type,
        fromDate: formatDateToString(this.state.fromDate) || '',
        toDate: formatDateToString(this.state.toDate) || '',
        stockSymbol: this.state.symbolCode || '',
        // channel: this.state.channel,
        // status: this.state.orderStatus,
        offset: offset || 0,
        fetchCount: fetchCount || QUERY_FETCH_COUNT,
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
  orderConfirmation: state.orderConfirmation,
  orderConfirmationSubmit: state.orderConfirmationSubmit,
});

const mapDispatchToProps = {
  queryOrderConfirmation,
  queryOrderConfirmationSubmit,
};

const OrderConfirmation = withRouter(
  withErrorBoundary(
    withNamespaces('common')(
      connect(mapStateToProps, mapDispatchToProps)(OrderConfirmationComponent)
    ),
    Fallback,
    handleError
  )
);

export default OrderConfirmation;
