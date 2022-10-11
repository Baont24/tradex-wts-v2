import * as React from 'react';
import * as config from './config';
import * as globalStyles from 'styles/style.scss';
import * as styles from './styles.scss';
import {
  AccountDropdown,
  DateRangePicker,
  Dropdown,
  Fallback,
  OtpModal,
  SheetData,
  TabTable,
} from 'components/common';
import { AccountRoutes, Routes } from 'constants/routes';
import { GridApi, GridReadyEvent, RowSelectedEvent } from 'ag-grid-community';
import { IAccount } from 'interfaces/common';
import { IState } from 'redux/global-reducers';
import { IStockTransferSubmitParams } from 'interfaces/api';
import { QUERY_FETCH_COUNT } from 'constants/main';
import { RouteComponentProps, withRouter } from 'react-router';
import { SystemType } from 'constants/enum';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { formatDateToString, getDateAMonthAgo } from 'utils/datetime';
import { formatNumber, handleError } from 'utils/common';
import { portfolioTab } from '../config';
import {
  queryStockTransfer,
  queryStockTransferHistory,
  submitStockTransfer,
} from './actions';
import { withErrorBoundary } from 'react-error-boundary';

interface IStockTransferProps
  extends React.ClassAttributes<StockTransferComponent>,
    WithNamespaces,
    RouteComponentProps {
  readonly selectedAccount: IState['selectedAccount'];
  readonly stockTransfer: IState['stockTransfer'];
  readonly stockTransferHistory: IState['stockTransferHistory'];
  readonly stockTransferSubmit: IState['stockTransferSubmit'];
  readonly accountList: IState['accountList'];

  readonly queryStockTransfer: typeof queryStockTransfer;
  readonly queryStockTransferHistory: typeof queryStockTransferHistory;
  readonly submitStockTransfer: typeof submitStockTransfer;
}

interface IStockTransferState {
  readonly beneficaryAccount?: IAccount;
  readonly startDate?: Date;
  readonly endDate?: Date;
  readonly isConfirmModalOpened?: boolean;
}

class StockTransferComponent extends React.Component<
  IStockTransferProps,
  IStockTransferState
> {
  private localGridApi?: GridApi;
  private localGridApi2?: GridApi;

  constructor(props: IStockTransferProps) {
    super(props);

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);

    this.state = {
      startDate: getDateAMonthAgo(),
      endDate,
    };
  }

  componentDidMount() {
    if (this.props.selectedAccount) {
      this.props.queryStockTransfer({
        accountNo: this.props.selectedAccount.accountNumber,
      });
      const beneficaryAccount = this.props.accountList.find(
        (accounts) =>
          accounts.account !== this.props.selectedAccount?.account &&
          accounts.type === this.props.selectedAccount?.type
      );
      if (beneficaryAccount) {
        this.setState({ beneficaryAccount });
      }
    }
    this.queryStockTransferHistory();
    this.props.i18n.on('languageChanged', this.onChangeLang);
  }

  componentDidUpdate(prevProps: IStockTransferProps) {
    if (
      this.props.stockTransferSubmit !== prevProps.stockTransferSubmit &&
      this.props.stockTransferSubmit.status.isSucceeded
    ) {
      if (this.props.selectedAccount) {
        this.props.queryStockTransfer({
          accountNo: this.props.selectedAccount.accountNumber,
        });
      }
      this.queryStockTransferHistory();
    }
  }

  componentWillUnmount() {
    this.props.i18n.off('languageChanged', this.onChangeLang);
  }

  render() {
    const { t, stockTransfer, stockTransferHistory } = this.props;

    const beneficaryAccountList = this.props.accountList
      .filter(
        (account) =>
          account.account !== this.props.selectedAccount?.account &&
          account.type === this.props.selectedAccount?.type
      )
      .map((beneficaryAccounts) => ({
        title: beneficaryAccounts.account,
        value: beneficaryAccounts.account,
      }));

    const RenderItem = (
      <div className={styles.StockTransferTab}>
        <div className={styles.StockTransferFilter}>
          <div className={styles.Left}>
            <span>{t('Transfer Securities from Account No.')}</span>
            <AccountDropdown
              isForm={true}
              onChange={this.onAccountChange}
              type={SystemType.EQUITY}
            />
            <span className="ml-1 mr-4">{t('to 1')}</span>
            <span>{t('Beneficary acc.')}</span>
            <Dropdown
              isForm={true}
              onSelect={this.onBeneficaryAccountChange}
              activeItem={this.state.beneficaryAccount?.account}
              data={beneficaryAccountList}
            />
          </div>
        </div>
        <div className={styles.StockTransferBoard}>
          <SheetData
            rowData={stockTransfer.data}
            columnDefs={config.stockTransferColumnDefs()}
            status={stockTransfer.status}
            rowSelection="multiple"
            rowDeselection={true}
            rowMultiSelectWithClick={true}
            defaultColDef={config.DEFAULT_COL_DEF}
            suppressRowClickSelection={true}
            onRowSelected={this.onRowSelected}
            onGridReady={this.onGridReady}
          />
        </div>
        <div className={styles.StockTransferButton}>
          <button
            className={styles.ConfirmButton}
            disabled={
              this.props.selectedAccount == null ||
              this.state.beneficaryAccount == null ||
              this.props.selectedAccount.accountNumber ===
                this.state.beneficaryAccount.accountNumber
            }
            onClick={this.onOpenModal}
          >
            {t('Apply 2')}
          </button>
        </div>
        <div className={styles.StockTransferHistoryTab}>
          <div>
            {t('Stock Transfer History')}
            <div className={styles.ActiveTab} />
          </div>
        </div>
        <div className={styles.StockTransferHistoryFilter}>
          <div className={styles.Left}>
            <span>{t('Date')}</span>
            <DateRangePicker
              onChangeStartDate={this.onChangeStartDate}
              onChangeEndDate={this.onChangeEndDate}
              startDate={this.state.startDate}
              endDate={this.state.endDate}
            />
            <button
              className={globalStyles.QueryButton}
              onClick={this.onClickQuery}
            >
              {t('Query')}
            </button>
          </div>
        </div>
        <div className={styles.StockTransferHistoryBoard}>
          <SheetData
            rowData={stockTransferHistory.data}
            columnDefs={config.stockTransferHistoryColumnDefs()}
            defaultColDef={config.DEFAULT_COL_DEF}
            status={stockTransferHistory.status}
            onGridReady={this.onGridReady2}
            onLoadMore={this.onLoadMore}
          />
        </div>
      </div>
    );

    return (
      <div className={styles.StockTransfer}>
        <TabTable
          data={portfolioTab(
            AccountRoutes.STOCK_TRANSFER,
            RenderItem,
            this.props.selectedAccount?.type
          )}
          onSelect={this.onSelect}
        />

        <OtpModal
          className={styles.StockTransferConfirmModal}
          dialogClassName={styles.StockTransferConfirmDialog}
          show={this.state.isConfirmModalOpened}
          onHide={this.onHideModal}
          horizontal={true}
          onSubmit={this.onSubmit}
          isSubmitDisabled={this.localGridApi
            ?.getSelectedRows()
            .every((val: config.IStockTransferBoard) => !val.transferVolume)}
        >
          <div className={styles.StockTransferConfirm}>
            <div className={styles.Title}>{t('Stock transfer request')}</div>
            <div className={styles.StockTransferConfirmTable}>
              <table>
                <thead>
                  <tr>
                    <th>{t('Stock Symbol')}</th>
                    <th>{t('Stock Type')}</th>
                    <th>{t('Transfer value MAS')}</th>
                  </tr>
                </thead>
                <tbody>
                  {this.localGridApi?.getSelectedRows().map(
                    (val: config.IStockTransferBoard, idx) =>
                      val.transferVolume && (
                        <tr key={idx}>
                          <td>{val.stockSymbol}</td>
                          <td>{val.stockType}</td>
                          <td>{formatNumber(val.transferVolume)}</td>
                        </tr>
                      )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </OtpModal>
      </div>
    );
  }

  private onSelect = (eventKey: string) => {
    this.props.history.push(`/${Routes.ACCOUNT}/${eventKey}`);
  };

  private onGridReady = (event: GridReadyEvent) => {
    this.localGridApi = event.api;
  };

  private onGridReady2 = (event: GridReadyEvent) => {
    this.localGridApi2 = event.api;
  };

  private onAccountChange = (account?: IAccount) => {
    if (account) {
      this.props.queryStockTransfer({
        accountNo: account.accountNumber,
      });
      this.props.queryStockTransferHistory({
        accountNumber: account.accountNumber,
        fromDate: formatDateToString(this.state.startDate) || '',
        toDate: formatDateToString(this.state.endDate) || '',
        symbol: 'ALL',
      });

      const beneficaryAccount = this.props.accountList.find(
        (accounts) =>
          accounts.account !== account.account &&
          accounts.type === account?.type
      );
      if (beneficaryAccount) {
        this.setState({ beneficaryAccount });
      }
    }
  };

  private onBeneficaryAccountChange = (title: string, value: string) => {
    const beneficaryAccount = this.props.accountList.find(
      (accounts) => accounts.account === value
    );
    this.setState({ beneficaryAccount });
  };

  private onChangeStartDate = (date: Date) => {
    this.setState({ startDate: date });
  };

  private onChangeEndDate = (date: Date) => {
    this.setState({ endDate: date });
  };

  private onRowSelected = (event: RowSelectedEvent) => {
    if (!event.node.isSelected()) {
      event.node.setDataValue('transferVolume', undefined);
    }
  };

  private onOpenModal = () => {
    this.setState({ isConfirmModalOpened: true });
  };

  private onHideModal = () => {
    this.setState({ isConfirmModalOpened: false });
  };

  private onSubmit = () => {
    this.setState({ isConfirmModalOpened: false }, () => {
      if (this.props.selectedAccount && this.state.beneficaryAccount) {
        const mutableParams: IStockTransferSubmitParams[] = [];
        this.localGridApi
          ?.getSelectedRows()
          .forEach((val: config.IStockTransferBoard) => {
            if (val.transferVolume) {
              mutableParams.push({
                marketID: val.marketID,
                senderAccountNo: this.props.selectedAccount
                  ?.accountNumber as string,
                receiverAccountNo: this.state.beneficaryAccount
                  ?.accountNumber as string,
                stockSymbol: val.stockSymbol,
                transferVolume: val.transferVolume,
              });
            }
          });
        this.props.submitStockTransfer(mutableParams);
      }
    });
  };

  private queryStockTransferHistory = (
    offset?: number,
    fetchCount?: number
  ) => {
    if (this.props.selectedAccount) {
      this.props.queryStockTransferHistory({
        accountNumber: this.props.selectedAccount.accountNumber,
        fromDate: formatDateToString(this.state.startDate) || '',
        toDate: formatDateToString(this.state.endDate) || '',
        offset: offset || 0,
        fetchCount: fetchCount || QUERY_FETCH_COUNT,
        symbol: 'ALL',
      });
    }
  };

  private onClickQuery = () => {
    this.queryStockTransferHistory();
  };

  private onLoadMore = (offset?: number, fetchCount?: number) => {
    this.queryStockTransferHistory(offset, fetchCount);
  };

  private onChangeLang = () => {
    setTimeout(() => {
      this.localGridApi?.sizeColumnsToFit();
      this.localGridApi2?.sizeColumnsToFit();
    });
  };
}

const mapStateToProps = (state: IState) => ({
  selectedAccount: state.selectedAccount,
  stockTransfer: state.stockTransfer,
  stockTransferHistory: state.stockTransferHistory,
  stockTransferSubmit: state.stockTransferSubmit,
  accountList: state.accountList,
});

const mapDispatchToProps = {
  queryStockTransfer,
  queryStockTransferHistory,
  submitStockTransfer,
};

const StockTransfer = withRouter(
  withErrorBoundary(
    withNamespaces('common')(
      connect(mapStateToProps, mapDispatchToProps)(StockTransferComponent)
    ),
    Fallback,
    handleError
  )
);

export default StockTransfer;
