import * as classNames from 'classnames';
import * as config from './config';
// import * as globalStyles from 'styles/style.scss';
import * as React from 'react';
import * as styles from './styles.scss';
import {
  AccountDropdown,
  Fallback,
  NumericInput,
  OtpModal,
  SheetData,
  TabTable,
} from 'components/common';
import { AccountRoutes, Routes } from 'constants/routes';
import { FaExclamationCircle } from 'react-icons/fa';
import { GridApi, GridReadyEvent } from 'ag-grid-community';
import { IAccount } from 'interfaces/common';
import { IEquityCashAdvancedAmountResponse } from 'interfaces/api';
import { IEquityCashAdvancedPaymentAction } from 'interfaces/actions';
import { IState } from 'redux/global-reducers';
import { MdFileDownload } from 'react-icons/md';
import { QUERY_FETCH_COUNT } from 'constants/main';
import { RouteComponentProps, withRouter } from 'react-router';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { assetManagementTab } from '../config';
import { connect } from 'react-redux';
import { formatNumber, handleError, multiplyBy1 } from 'utils/common';
import {
  queryEquityCalculateInterestAmt,
  queryEquityCashAdvanced,
  queryEquityCashAdvancedAmount,
  queryEquityCashAdvancedHistory,
  queryEquityCashAdvancedPayment,
  queryEquityCashAdvancedPaymentTime,
} from './actions';
import { withErrorBoundary } from 'react-error-boundary';

interface ICashAdvancedProps
  extends React.ClassAttributes<CashAdvancedComponent>,
    WithNamespaces,
    RouteComponentProps {
  readonly selectedAccount: IState['selectedAccount'];
  readonly equityCashAdvanced: IState['equityCashAdvanced'];
  readonly equityCashAdvancedHistory: IState['equityCashAdvancedHistory'];
  readonly equityCashAdvancedAmount: IState['equityCashAdvancedAmount'];
  readonly equityCashAdvancedPayment: IState['equityCashAdvancedPayment'];
  readonly equityCashAdvancedInterestAmt: IState['equityCashAdvancedInterestAmt'];
  readonly accountList: IState['accountList'];

  readonly queryEquityCashAdvanced: typeof queryEquityCashAdvanced;
  readonly queryEquityCashAdvancedHistory: typeof queryEquityCashAdvancedHistory;
  readonly queryEquityCashAdvancedAmount: typeof queryEquityCashAdvancedAmount;
  readonly queryEquityCashAdvancedPayment: typeof queryEquityCashAdvancedPayment;
  readonly queryEquityCashAdvancedPaymentTime: typeof queryEquityCashAdvancedPaymentTime;
  readonly queryEquityCalculateInterestAmt: typeof queryEquityCalculateInterestAmt;
}

interface ICashAdvancedState {
  readonly requiredAdvanceAmount: number;
  readonly status?: string;
  readonly startDate?: Date;
  readonly endDate?: Date;
  readonly isConfirmModalOpened?: boolean;
  readonly itemSelectedArr?: IEquityCashAdvancedPaymentAction['itemSelected'];
}

const MIN_FEE_TRANSFER = 30000;

class CashAdvancedComponent extends React.Component<
  ICashAdvancedProps,
  ICashAdvancedState
> {
  private localGridApi?: GridApi;
  private localGridApi2?: GridApi;
  constructor(props: ICashAdvancedProps) {
    super(props);

    this.state = {
      requiredAdvanceAmount: 0,
    };
  }

  componentDidMount() {
    if (this.props.selectedAccount != null) {
      this.props.queryEquityCashAdvanced({
        accountNo: this.props.selectedAccount.accountNumber,
      });
      this.props.queryEquityCashAdvancedHistory({
        accountNo: this.props.selectedAccount.accountNumber,
      });
      this.props.queryEquityCashAdvancedAmount({
        accountNo: this.props.selectedAccount.accountNumber,
      });
    }
    this.props.i18n.on('languageChanged', this.onChangeLang);
  }

  componentDidUpdate(prevProps: ICashAdvancedProps) {
    this.onChangeLang();
    if (
      this.props.selectedAccount !== prevProps.selectedAccount &&
      this.props.selectedAccount
    ) {
      this.queryDataCashAdvanced();
      this.queryEquityCashAdvancedHistory();
      this.props.queryEquityCashAdvancedAmount({
        accountNo: this.props.selectedAccount.accountNumber,
      });
    }
    if (
      this.props.equityCashAdvancedPayment !==
        prevProps.equityCashAdvancedPayment &&
      this.props.equityCashAdvancedPayment.status.isSucceeded &&
      prevProps.selectedAccount &&
      this.props.selectedAccount
    ) {
      this.queryDataCashAdvanced();
      this.queryEquityCashAdvancedHistory();
      this.props.queryEquityCashAdvancedAmount({
        accountNo: this.props.selectedAccount.accountNumber,
      });
      this.setState(
        {
          itemSelectedArr: [],
          requiredAdvanceAmount: 0,
        },
        () => {
          this.onChangeFee();
        }
      );
    }
  }

  componentWillUnmount() {
    this.props.i18n.off('languageChanged', this.onChangeLang);
  }

  render() {
    const {
      t,
      equityCashAdvanced,
      equityCashAdvancedHistory,
      equityCashAdvancedAmount,
    } = this.props;
    const isIICA = this.props.selectedAccount?.isIICA;
    const fee =
      this.props.equityCashAdvancedInterestAmt.data?.mvInterestAmt || 0;
    const isSubmitDisabled =
      this.state.requiredAdvanceAmount <= 0 ||
      (this.props.selectedAccount?.isIICA
        ? this.state.requiredAdvanceAmount >
          (this.state.itemSelectedArr?.reduce(this.getReduce, 0) || 0)
        : equityCashAdvancedAmount.data == null ||
          this.state.requiredAdvanceAmount >
            equityCashAdvancedAmount?.data?.availableCashAdvance);
    const RenderItem = (
      <div className={styles.CashAdvancedTab}>
        <div className={styles.CashAdvancedBoard}>
          <div className={styles.Left}>
            <div className={styles.Row}>
              <div className={styles.Col}>
                <span>{t('Account No')}</span>
              </div>
              <div className={styles.Col}>
                <div className={styles.Input}>
                  <AccountDropdown
                    isForm={true}
                    onChange={this.onAccountChange}
                    unshowAccounts={this.props.accountList
                      .filter((val) => val.isDerivatives)
                      .map((val) => val.accountNumber)}
                  />
                </div>
              </div>
            </div>
            <div className={styles.Row}>
              <div className={styles.Col}>
                <span>{t('Available Cash In Advance')}</span>
              </div>
              <div className={styles.Col}>
                <div className={styles.Input}>
                  <NumericInput
                    disabled={true}
                    hideButton={true}
                    value={
                      isIICA
                        ? this.state.itemSelectedArr?.reduce(this.getReduce, 0)
                        : equityCashAdvancedAmount.data?.availableCashAdvance
                    }
                  />
                </div>
              </div>
            </div>
            <div className={styles.Row}>
              <div className={styles.Col}>
                <span>{t('Required Advance Amount')}</span>
              </div>
              <div className={styles.Col}>
                <div className={styles.Input}>
                  <NumericInput
                    hideButton={true}
                    value={this.state.requiredAdvanceAmount}
                    min={0}
                    onBlur={this.onInputBlur}
                    max={
                      isIICA
                        ? this.state.itemSelectedArr?.reduce(this.getReduce, 0)
                        : equityCashAdvancedAmount.data?.availableCashAdvance
                    }
                    onNumberChange={this.onAmountChange}
                  />
                  <div
                    className={classNames(styles.Icon, {
                      [styles.Loading]:
                        equityCashAdvancedAmount.status.isLoading,
                    })}
                    onClick={this.onGetAvailableAmount}
                  >
                    <MdFileDownload size={18} />
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.Row}>
              <div className={styles.Col}>
                <span>{t('Fee')}</span>
              </div>
              <div className={styles.Col}>
                <div className={styles.Input}>
                  <NumericInput
                    disabled={true}
                    hideButton={true}
                    value={formatNumber(this.feeMinCalculation(fee))}
                  />
                </div>
              </div>
            </div>
            <div className={styles.Row}>
              <div className={styles.CashAdvancedButton}>
                <button
                  className={styles.ConfirmButton}
                  onClick={this.onShowConfirmModal}
                  disabled={isSubmitDisabled}
                >
                  {t('Apply 2')}
                </button>
                <button
                  className={styles.CancelButton}
                  onClick={this.onResetAmount}
                >
                  {t('Cancel')}
                </button>
              </div>
            </div>
          </div>
          <div className={styles.Right}>
            <div className={styles.Title}>
              {t('Transaction detail of awaiting receivable')}
            </div>
            {isIICA && (
              <div className={styles.TextInstruction}>
                {t('*Please select transaction for requiring cash in advance')}
              </div>
            )}
            <SheetData
              rowData={equityCashAdvanced.data}
              columnDefs={config.cashAdvancedColumnDefs(isIICA)}
              rowSelection="multiple"
              rowDeselection={true}
              rowMultiSelectWithClick={true}
              defaultColDef={config.DEFAULT_COL_DEF}
              status={equityCashAdvanced.status}
              onGridReady={this.onGridReady}
              onLoadMore={this.queryDataCashAdvanced}
              onRowSelected={this.onRowSelected}
            />
          </div>
        </div>
        <div className={styles.CashAdvancedHistoryTab}>
          <div>
            {t('Cash In Advanced History')}
            <div className={styles.ActiveTab} />
          </div>
        </div>
        <div className={styles.CashAdvancedHistoryFilter}>
          {/* <div className={styles.Left}>
            <span>{t('Status')}</span>
            <Dropdown isForm={true} data={[]} onSelect={this.onSelectStatus} disabled={true} />
            <span>{t('Date')}</span>
            <DateRangePicker
              onChangeStartDate={this.onChangeStartDate}
              onChangeEndDate={this.onChangeEndDate}
              startDate={this.state.startDate}
              endDate={this.state.endDate}
              disabled={true}
            />
            <div className={styles.CashAdvancedHistoryQuery}>
              <button className={globalStyles.QueryButton} onClick={this.onClickQuery}>
                {t('Query')}
              </button>
            </div>
          </div> */}
        </div>
        <div className={styles.CashAdvancedHistoryBoard}>
          <SheetData
            rowData={equityCashAdvancedHistory.data}
            columnDefs={config.cashAdvancedHistoryColumnDefs(isIICA)}
            defaultColDef={config.DEFAULT_COL_DEF}
            status={equityCashAdvancedHistory.status}
            onGridReady={this.onGridReady2}
            onLoadMore={this.queryEquityCashAdvancedHistory}
          />
        </div>
        <div className={styles.CashAdvancedFooter}>
          <div className={styles.Note}>
            {`(${t('If the request is rejected, please move on')}`}
            <FaExclamationCircle className={styles.ErrorIcon} size={17} />
            {`${t('to see the rejected reason')}.)`}
          </div>
        </div>

        <OtpModal
          show={this.state.isConfirmModalOpened}
          onHide={this.onHideConfirmModal}
          horizontal={true}
          isSubmitDisabled={isSubmitDisabled}
          dialogClassName={styles.CashAdvancedModalDialog}
          onSubmit={this.onSubmit}
        >
          <div className={styles.CashAdvancedModal}>
            <div className={styles.Title}>{t('Cash In Advance Request')}</div>
            <table>
              <colgroup>
                <col style={{ width: '40%' }} />
                <col style={{ width: '30%' }} />
                {/* <col style={{ width: '30%' }} /> */}
              </colgroup>
              <thead>
                <tr>
                  <th>{t('Require advanced amount')}</th>
                  <th>{t('Fee')}</th>
                  {/* <th>{t('Tax')}</th> */}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{formatNumber(this.state.requiredAdvanceAmount, 2)}</td>
                  <td>
                    {formatNumber(
                      this.props.selectedAccount?.isIICA
                        ? this.feeMinCalculation(
                            this.props?.equityCashAdvancedInterestAmt?.data
                              ?.mvInterestAmt || 0
                          )
                        : this.feeMinCalculation(fee)
                    )}
                  </td>
                  {/* <td>
                    {formatNumber(this.state.requiredAdvanceAmount * 0.001, 2)}
                  </td> */}
                </tr>
              </tbody>
            </table>
            <br />
            <p>{t('Note: Minimum advance fee of 30,000VNĐ/time')}</p>
          </div>
        </OtpModal>
      </div>
    );

    return (
      <div className={styles.CashAdvanced}>
        <TabTable
          data={assetManagementTab(
            AccountRoutes.CASH_IN_ADVANCED,
            RenderItem,
            this.props.selectedAccount?.type
          )}
          onSelect={this.onSelect}
        />
      </div>
    );
  }

  private feeMinCalculation = (fee: string | number) => {
    if (multiplyBy1(fee) < MIN_FEE_TRANSFER) {
      return MIN_FEE_TRANSFER;
    } else {
      return multiplyBy1(fee);
    }
  };

  private getReduce = (
    accumulator: number,
    item: { readonly mvAvailableAmount: number }
  ) => {
    return accumulator + Number(item?.mvAvailableAmount);
  };

  private onRowSelected = () => {
    if (this.localGridApi) {
      if (this.localGridApi.getSelectedRows()) {
        if (this.localGridApi.getSelectedRows().length === 0) {
          this.onResetAmount();
          this.onChangeFee();
        }
        this.setState(
          {
            itemSelectedArr: this.localGridApi?.getSelectedRows() || [],
          },
          () => {
            if (
              (this.state.itemSelectedArr || [])?.reduce(this.getReduce, 0) <
              this.state.requiredAdvanceAmount
            ) {
              this.onAmountChange(
                (this.state.itemSelectedArr || [])?.reduce(this.getReduce, 0)
              );
            }
          }
        );
      }
    }
  };

  private onGridReady = (event: GridReadyEvent) => {
    this.localGridApi = event.api;
  };

  private onGridReady2 = (event: GridReadyEvent) => {
    this.localGridApi2 = event.api;
  };

  private onChangeLang = () => {
    setTimeout(() => {
      this.localGridApi?.sizeColumnsToFit();
      this.localGridApi2?.sizeColumnsToFit();
    });
  };

  private onSelect = (eventKey: string) => {
    this.props.history.push(`/${Routes.ACCOUNT}/${eventKey}`);
  };

  private onAccountChange = (account?: IAccount) => {
    if (account) {
      return;
    }
  };

  private onChangeFee = () => {
    if (this.props.selectedAccount !== null) {
      const mvAmount = this.props.selectedAccount?.isIICA
        ? this.state.requiredAdvanceAmount / 1000
        : this.state.requiredAdvanceAmount;
      if (this.props.equityCashAdvancedAmount.data) {
        this.props.queryEquityCalculateInterestAmt({
          subAccountID: this.props.selectedAccount.accountNumber,
          mvAmount: `${mvAmount}`,
          mvSettlement: this.getMvSettlement(
            this.props.equityCashAdvancedAmount.data,
            this.state.requiredAdvanceAmount
          ),
        });
      }
    }
  };

  private getMvSettlement = (
    equityCashAdvancedAmount: IEquityCashAdvancedAmountResponse,
    requiredAdvanceAmount: number
  ) => {
    if (equityCashAdvancedAmount.t2AdvAvailable >= requiredAdvanceAmount) {
      return '1';
    } else if (
      equityCashAdvancedAmount.t2AdvAvailable +
        equityCashAdvancedAmount.t1AdvAvailable >=
      requiredAdvanceAmount
    ) {
      return '2';
    }
    return '3';
  };

  // private onSelectStatus = (title: string, value: string) => {
  //   this.setState({ status: value });
  // };

  // private onChangeStartDate = (date: Date) => {
  //   this.setState({ startDate: date });
  // };

  // private onChangeEndDate = (date: Date) => {
  //   this.setState({ endDate: date });
  // };

  // private onClickQuery = () => {
  //   console.log('Do something here');
  // };

  private onShowConfirmModal = () => {
    this.setState({ isConfirmModalOpened: true });
  };

  private onHideConfirmModal = () => {
    this.setState({ isConfirmModalOpened: false });
  };

  private onAmountChange = (value?: number) => {
    this.setState(
      {
        requiredAdvanceAmount: value || 0,
      },
      () => {
        this.onChangeFee();
      }
    );
  };

  private onResetAmount = () => {
    this.setState({
      requiredAdvanceAmount: 0,
    });
  };

  private onGetAvailableAmount = () => {
    this.setState(
      {
        requiredAdvanceAmount: this.props.selectedAccount?.isIICA
          ? this.state.itemSelectedArr?.reduce(this.getReduce, 0) || 0
          : this.props.equityCashAdvancedAmount.data?.availableCashAdvance || 0,
      },
      () => {
        this.onChangeFee();
      }
    );
  };

  private onInputBlur = (
    event: React.FocusEvent<HTMLInputElement | HTMLDivElement>
  ) => {
    const isIICA = this.props.selectedAccount?.isIICA;
    const availableCashAdvance = isIICA
      ? (this.state.itemSelectedArr || []).reduce(this.getReduce, 0)
      : this.props.equityCashAdvancedAmount.data?.availableCashAdvance;
    event.stopPropagation();
    if (this.state.requiredAdvanceAmount > (availableCashAdvance || 0)) {
      this.setState(
        {
          requiredAdvanceAmount: availableCashAdvance || 0,
        },
        () => {
          this.onChangeFee();
        }
      );
    }
  };

  private onSubmit = () => {
    this.setState({ isConfirmModalOpened: false }, () => {
      if (
        this.props.selectedAccount &&
        this.props.equityCashAdvancedAmount.data &&
        this.state.requiredAdvanceAmount
      ) {
        this.props.queryEquityCashAdvancedPayment({
          accountNo: this.props.selectedAccount.accountNumber,
          availableAmount: this.props.equityCashAdvancedAmount.data
            .availableCashAdvance,
          submitAmount: this.state.requiredAdvanceAmount,
          itemSelected: this.state.itemSelectedArr,
        });
      }
    });
  };

  private queryDataCashAdvanced(offset?: number, fetchCount?: number) {
    if (this.props?.selectedAccount) {
      this.props.queryEquityCashAdvanced({
        accountNo: this.props.selectedAccount.accountNumber,
        offset: offset || 0,
        fetchCount: fetchCount || QUERY_FETCH_COUNT,
      });
    }
  }

  private queryEquityCashAdvancedHistory(offset?: number, fetchCount?: number) {
    if (this.props?.selectedAccount != null) {
      this.props.queryEquityCashAdvancedHistory({
        accountNo: this.props.selectedAccount.accountNumber,
        offset: offset || 0,
        fetchCount: fetchCount || QUERY_FETCH_COUNT,
      });
    }
  }
}

const mapStateToProps = (state: IState) => ({
  selectedAccount: state.selectedAccount,
  equityCashAdvanced: state.equityCashAdvanced,
  equityCashAdvancedHistory: state.equityCashAdvancedHistory,
  equityCashAdvancedAmount: state.equityCashAdvancedAmount,
  equityCashAdvancedPayment: state.equityCashAdvancedPayment,
  equityCashAdvancedInterestAmt: state.equityCashAdvancedInterestAmt,
  accountList: state.accountList,
});

const mapDispatchToProps = {
  queryEquityCashAdvanced,
  queryEquityCashAdvancedHistory,
  queryEquityCashAdvancedAmount,
  queryEquityCashAdvancedPayment,
  queryEquityCashAdvancedPaymentTime,
  queryEquityCalculateInterestAmt,
};

const CashAdvanced = withRouter(
  withErrorBoundary(
    withNamespaces('common')(
      connect(mapStateToProps, mapDispatchToProps)(CashAdvancedComponent)
    ),
    Fallback,
    handleError
  )
);

export default CashAdvanced;
