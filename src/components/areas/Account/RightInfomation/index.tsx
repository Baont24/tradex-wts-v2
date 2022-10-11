import * as React from 'react';
import * as config from './config';
import * as globalStyles from 'styles/style.scss';
import * as styles from './styles.scss';
import {
  AccountDropdown,
  DateRangePicker,
  Dropdown,
  Fallback,
  NumericInput,
  OtpModal,
  SheetData,
  SymbolSearch,
} from 'components/common';
import { AccountType, RightSubsHistoryStatus } from 'constants/enum';
import { CellClickedEvent, GridApi, GridReadyEvent } from 'ag-grid-community';
import { FaExclamationCircle } from 'react-icons/fa';
import { Form } from 'react-bootstrap';
import { IAccount } from 'interfaces/common';
import {
  IEquityRightInformationResponse,
  IEquityRightSubsHistoryParams,
} from 'interfaces/api';
import { IState } from 'redux/global-reducers';
import { QUERY_FETCH_COUNT } from 'constants/main';
import { RightSubsHistoryStatusDropdown } from './enum';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import {
  formatDateToDisplay,
  formatDateToString,
  getDateAMonthAgo,
} from 'utils/datetime';
import { formatNumber, handleError, multiplyBy1000 } from 'utils/common';
import { isString } from 'lodash';
import {
  postRightInforRegister,
  queryAvailablePowerExerciseRight,
  queryInforOnPopUp,
  queryRightInformation,
  queryRightSubsHistory,
} from './actions';
import { withErrorBoundary } from 'react-error-boundary';

interface IRightInfomationProps
  extends React.ClassAttributes<RightInfomationComponent>,
    WithNamespaces {
  readonly selectedAccount: IState['selectedAccount'];
  readonly accountList: IState['accountList'];
  readonly equityRightInformation: IState['equityRightInformation'];
  readonly equityRightSubsHistory: IState['equityRightSubsHistory'];
  readonly equityRightInforOnPopUp: IState['equityRightInforOnPopUp'];
  readonly equityAvailablePowerExercise: IState['equityAvailablePowerExercise'];
  readonly statusRightInforResgisterPost: IState['statusRightInforResgisterPost'];

  readonly queryRightInformation: typeof queryRightInformation;
  readonly queryRightSubsHistory: typeof queryRightSubsHistory;
  readonly queryInforOnPopUp: typeof queryInforOnPopUp;
  readonly postRightInforRegister: typeof postRightInforRegister;
  readonly queryAvailablePowerExerciseRight: typeof queryAvailablePowerExerciseRight;
}

interface IRightInfomationState {
  readonly fromDate: Date;
  readonly toDate: Date;
  readonly statusCode?: string;
  readonly rowDataPopUp?: IEquityRightInformationResponse;
  readonly selectedAccount?: string;
  readonly RightSubsHistoryStatus?: RightSubsHistoryStatus;
  readonly symbolCode?: string;
  readonly isOpenModal: boolean;
  readonly registerQuantity: number;
  readonly errorRegister: string;
}
class RightInfomationComponent extends React.Component<
  IRightInfomationProps,
  IRightInfomationState
> {
  private localGridApi?: GridApi;
  private localGridApi2?: GridApi;
  constructor(props: IRightInfomationProps) {
    super(props);

    this.state = {
      fromDate: getDateAMonthAgo(),
      toDate: new Date(),
      statusCode: 'All',
      symbolCode: 'All',
      RightSubsHistoryStatus: RightSubsHistoryStatus.All,
      isOpenModal: false,
      registerQuantity: 0,
      errorRegister: '',
    };
  }

  componentDidMount() {
    if (this.props.selectedAccount != null) {
      this.props.queryRightInformation({
        accountNumber: this.props.selectedAccount.accountNumber,
      });
      this.props.queryAvailablePowerExerciseRight({
        accountNumber: this.props.selectedAccount.accountNumber,
      });
    }
    this.queryEquityRightSubsHistory();
    this.props.i18n.on('languageChanged', this.onChangeLang);
  }

  componentDidUpdate(prevProps: IRightInfomationProps) {
    if (
      this.props.selectedAccount !== prevProps.selectedAccount &&
      this.props.selectedAccount
    ) {
      this.queryRightInformation();
      this.props.queryAvailablePowerExerciseRight({
        accountNumber: this.props.selectedAccount.accountNumber,
      });
      this.queryEquityRightSubsHistory();
      this.onChangeLang();
    }
    if (
      this.props.statusRightInforResgisterPost !==
        prevProps.statusRightInforResgisterPost &&
      this.props.statusRightInforResgisterPost.status.isSucceeded &&
      this.props.selectedAccount
    ) {
      this.queryEquityRightSubsHistory();
      this.props.queryRightInformation({
        accountNumber: this.props.selectedAccount.accountNumber,
      });
      this.onCloseModal();
    }
  }

  componentWillUnmount() {
    this.props.i18n.off('languageChanged', this.onChangeLang);
  }

  render() {
    const {
      t,
      equityAvailablePowerExercise,
      selectedAccount,
      statusRightInforResgisterPost,
    } = this.props;
    const { rowDataPopUp, registerQuantity } = this.state;
    const isIICA = selectedAccount?.isIICA;
    const rightInforOnPopUp = this.props.equityRightInforOnPopUp.data;
    return (
      <div className={styles.RightInfomation}>
        <div className={styles.RightSubsInfor}>
          <div className={styles.RightSubsAccount}>
            <p>{t('Account No')}</p>
            <AccountDropdown
              unshowAccounts={this.props.accountList
                .filter(
                  (account) => account.accountType === AccountType.DERIVATIVES
                )
                .map((acc) => acc.account)}
              isForm={true}
              onChange={this.onChangeAccount}
            />
            <p>{` ${t('Available power to exercise right:')} VND ${
              isIICA
                ? formatNumber(
                    multiplyBy1000(Number(equityAvailablePowerExercise.data))
                  )
                : formatNumber(Number(equityAvailablePowerExercise.data))
            }`}</p>
          </div>
          <div className={styles.RightSubsTable}>
            <SheetData
              rowData={this.props.equityRightInformation.data}
              columnDefs={config.rightInforColumnDefs(
                this.registerBtnCellClicked
              )}
              status={this.props.equityRightInformation.status}
              onGridReady={this.onGridReady}
              defaultColDef={config.DEFAULT_COL_DEF}
              onLoadMore={this.queryRightInformation}
            />
          </div>
        </div>
        {/* Table 2 */}
        <div className={styles.RightSubsHistory}>
          <div className={styles.RightTitle}>
            <span>
              <p>{t('Right Subscription History')}</p>
            </span>
          </div>
          <div className={styles.RightSubsHistoryFilter}>
            <div className={styles.RightSubsHistoryStockSymbol}>
              <p>{t('Stock Symbol')}</p>
              <div className={styles.RightSubsHistorySymbolPicker}>
                <SymbolSearch
                  placeholder={this.state.symbolCode}
                  onSymbolSearch={this.onSymbolSearch}
                  isClearable={true}
                  isForm={true}
                />
              </div>
            </div>
            <div className={styles.RightSubsHistoryDropdown}>
              <p>{t('Status')}</p>
              <Dropdown
                placeholder={this.state.statusCode}
                isForm={true}
                data={RightSubsHistoryStatusDropdown}
                onSelect={this.onSelectOrderStatus}
                activeItem={this.state.RightSubsHistoryStatus}
              />
            </div>
            <div className={styles.RightSubsHistoryDate}>
              <p>{t('Date')}</p>
              <DateRangePicker
                onChangeStartDate={this.onChangeFromDate}
                onChangeEndDate={this.onChangeToDate}
                startDate={this.state.fromDate}
                endDate={this.state.toDate}
              />
            </div>
            <div className={styles.RightSubsHistoryQuery}>
              <button
                className={globalStyles.QueryButton}
                onClick={this.onClickQuery}
              >
                {t('Query')}
              </button>
            </div>
          </div>
          <div className={styles.RightSubsHistoryTable}>
            <SheetData
              rowData={this.props.equityRightSubsHistory.data}
              columnDefs={config.rightSubsColumnDefs()}
              status={this.props.equityRightSubsHistory.status}
              onGridReady={this.onGridReady2}
              defaultColDef={config.DEFAULT_COL_DEF}
              onLoadMore={this.queryEquityRightSubsHistory}
            />
          </div>
        </div>
        <div className={styles.RightInforFooter}>
          <div className={styles.Note}>
            {`(${t('If the request is rejected, please move on')}`}
            <FaExclamationCircle className={styles.ErrorIcon} size={17} />
            {`${t('to see the rejected reason')}.)`}
          </div>
        </div>
        <OtpModal
          size={'sm'}
          show={this.state.isOpenModal}
          onHide={this.onCloseModal}
          onSubmit={this.onConfirmRegister}
          isSubmitDisabled={statusRightInforResgisterPost.status.isLoading}
        >
          <Form>
            <div className={styles.ResgisterBtnModal}>
              <table>
                <thead>
                  <tr>
                    <th colSpan={2}>{t('Right Subscription Registration')}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{t('Account name')}</td>
                    <td>{rightInforOnPopUp?.bankAccountNumber}</td>
                  </tr>
                  <tr>
                    <td>{t('Account No.:')}</td>
                    <td>{rightInforOnPopUp?.accountName}</td>
                  </tr>
                  <tr>
                    <td>{t('Cash Available')}</td>
                    <td>
                      {isIICA
                        ? formatNumber(
                            multiplyBy1000(
                              Number(equityAvailablePowerExercise.data)
                            )
                          )
                        : formatNumber(
                            Number(equityAvailablePowerExercise.data)
                          )}
                    </td>
                  </tr>
                  <tr>
                    <td>{t('Symbol Code:')}</td>
                    <td>{rightInforOnPopUp?.symbolCode}</td>
                  </tr>
                  <tr>
                    <td>{t('Company Name:')}</td>
                    <td>{rightInforOnPopUp?.companyName}</td>
                  </tr>
                  <tr>
                    <td>{t('Securitites Type:')}</td>
                    <td>{rightInforOnPopUp?.securitiesType ?? '—'}</td>
                  </tr>
                  <tr>
                    <td>{t('Closed Date:')}</td>
                    <td>{formatDateToDisplay(rowDataPopUp?.closedDate)}</td>
                  </tr>
                  <tr>
                    <td>{t('Ratio:')}</td>
                    <td>{`${formatNumber(
                      rowDataPopUp?.ratioLeft,
                      5
                    )} : ${formatNumber(rowDataPopUp?.ratioRight, 5)}`}</td>
                  </tr>
                  <tr>
                    <td>{t('Offering Price:')}</td>
                    <td>
                      {formatNumber(
                        rightInforOnPopUp?.offeringPrice,
                        0,
                        undefined,
                        undefined,
                        '—'
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td>{t('Right Qty:')}</td>
                    <td>
                      {formatNumber(
                        rowDataPopUp?.availableRightQty,
                        0,
                        undefined,
                        undefined,
                        '—'
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td>{t('Register Qty:')}</td>
                    <td>
                      <NumericInput
                        value={registerQuantity}
                        min={0}
                        max={rowDataPopUp?.availableRightQty}
                        onNumberChange={this.onAmountChange}
                      />
                      <p>{t(this.state.errorRegister)}</p>
                    </td>
                  </tr>
                  <tr>
                    <td>{t('Total Amount:')}</td>
                    <td>
                      {rightInforOnPopUp !== null &&
                        formatNumber(
                          registerQuantity * rightInforOnPopUp?.offeringPrice
                        )}
                    </td>
                  </tr>
                </tbody>
              </table>
              {this.isDisableRegister() && (
                <p>{t('Insufficient purchasing power')}</p>
              )}
            </div>
          </Form>
        </OtpModal>
      </div>
    );
  }

  private onGridReady = (event: GridReadyEvent) => {
    this.localGridApi = event.api;
  };

  private onChangeLang = () => {
    setTimeout(() => {
      this.localGridApi?.sizeColumnsToFit();
      this.localGridApi2?.sizeColumnsToFit();
    });
  };

  private onGridReady2 = (event: GridReadyEvent) => {
    this.localGridApi2 = event.api;
  };

  private onAmountChange = (value = undefined) => {
    this.setState({
      registerQuantity: value || 0,
    });
  };

  private onChangeFromDate = (date: Date) => {
    this.setState({ fromDate: date });
  };

  private onChangeToDate = (date: Date) => {
    this.setState({ toDate: date });
  };

  private onChangeAccount = (account: IAccount | string) => {
    if (isString(account)) {
      this.setState({ selectedAccount: account });
    } else {
      this.setState({ selectedAccount: account.account });
    }
  };

  private onSelectOrderStatus = (
    title: RightSubsHistoryStatus,
    value: RightSubsHistoryStatus
  ) => {
    this.setState({ RightSubsHistoryStatus: value });
  };

  private onSymbolSearch = (code: string) => {
    this.setState({ symbolCode: code });
  };

  private onClickQuery = () => {
    this.queryEquityRightSubsHistory();
  };

  private onConfirmRegister = (event: React.SyntheticEvent): void => {
    if (
      this.props.selectedAccount != null &&
      this.props.equityRightInforOnPopUp.data !== null &&
      this.state.rowDataPopUp !== undefined
    ) {
      const rightInforOnPopUp = this.props.equityRightInforOnPopUp.data;
      const rowDataPopUp = this.state.rowDataPopUp;
      const { registerQuantity } = this.state;
      if (
        registerQuantity <= 0 ||
        registerQuantity > rowDataPopUp.availableRightQty
      ) {
        if (registerQuantity <= 0) {
          this.setState({ errorRegister: 'Quantity must be greater than 0' });
        } else {
          this.setState({ errorRegister: 'Register qty exceeds Right Qty' });
        }
      } else {
        const params = {
          accountNumber: this.props.selectedAccount.accountNumber,
          entitlementId: rightInforOnPopUp?.entitlementId,
          locationId: rightInforOnPopUp?.locationId,
          marketId: rightInforOnPopUp?.marketId,
          registerQuantity: String(registerQuantity),
          bankAccountNumber: rightInforOnPopUp?.bankAccountNumber,
          symbolCode: rightInforOnPopUp?.symbolCode,
          interfaceSeq: rightInforOnPopUp?.interfaceSeq,
        };
        this.props.postRightInforRegister(params);
      }
    }
  };

  private queryEquityRightSubsHistory = (
    offset?: number,
    fetchCount?: number
  ) => {
    if (this.props.selectedAccount != null) {
      const params: IEquityRightSubsHistoryParams = {
        accountNumber: this.props.selectedAccount.accountNumber,
        symbol: this.state.symbolCode,
        fromDate: formatDateToString(this.state.fromDate) || '',
        toDate: formatDateToString(this.state.toDate) || '',
        offset: offset || 0,
        fetchCount: fetchCount || QUERY_FETCH_COUNT,
      };
      this.props.queryRightSubsHistory(params);
    }
  };

  private queryRightInformation = (offset?: number, fetchCount?: number) => {
    if (this.props.selectedAccount != null) {
      this.props.queryRightInformation({
        accountNumber: this.props.selectedAccount.accountNumber,
        offset: offset || 0,
        fetchCount: fetchCount || QUERY_FETCH_COUNT,
      });
    }
  };

  private onCloseModal = () => {
    this.setState({
      isOpenModal: false,
      registerQuantity: 0,
      errorRegister: '',
    });
  };

  private registerBtnCellClicked = (event: CellClickedEvent) => {
    if (this.props.selectedAccount != null) {
      this.props.queryInforOnPopUp({
        accountNumber: this.props.selectedAccount.accountNumber,
        entitlementID: event.data.entitlementId,
      });
    }
    this.setState({
      isOpenModal: true,
      rowDataPopUp: event.data,
      errorRegister: '',
      registerQuantity: 0,
    });
  };

  private isDisableRegister = () => {
    if (this.props.equityRightInforOnPopUp.data !== null) {
      const equityAvailablePowerExercise = this.props.selectedAccount?.isIICA
        ? Number(this.props.equityAvailablePowerExercise.data) * 1000
        : this.props.equityAvailablePowerExercise.data;
      return (
        this.state.registerQuantity *
          this.props.equityRightInforOnPopUp.data.offeringPrice >
        equityAvailablePowerExercise
      );
    }
    return false;
  };
}

const mapStateToProps = (state: IState) => ({
  selectedAccount: state.selectedAccount,
  accountList: state.accountList,
  equityRightInformation: state.equityRightInformation,
  equityRightSubsHistory: state.equityRightSubsHistory,
  equityRightInforOnPopUp: state.equityRightInforOnPopUp,
  equityAvailablePowerExercise: state.equityAvailablePowerExercise,
  statusRightInforResgisterPost: state.statusRightInforResgisterPost,
});

const mapDispatchToProps = {
  queryRightInformation,
  queryRightSubsHistory,
  queryInforOnPopUp,
  postRightInforRegister,
  queryAvailablePowerExerciseRight,
};

const RightInfomation = withErrorBoundary(
  withNamespaces('common')(
    connect(mapStateToProps, mapDispatchToProps)(RightInfomationComponent)
  ),
  Fallback,
  handleError
);

export default RightInfomation;
