import * as React from 'react';
import * as config from './config';
import * as globalStyles from 'styles/style.scss';
import * as styles from './styles.scss';
import {
  AccountDropdown,
  DateRangePicker,
  Fallback,
  Modal,
  SheetData,
} from 'components/common';
import { AccountType } from 'constants/enum';
import { GridApi, GridReadyEvent, RowClickedEvent } from 'ag-grid-community';
import { ILoanContractResponse } from 'interfaces/api';
import { IState } from 'redux/global-reducers';
import { RouteComponentProps, withRouter } from 'react-router';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { formatDateToString, getDateAMonthAgo } from 'utils/datetime';
import { handleError } from 'utils/common';
import { queryEquityLoanContract } from './action';
import { withErrorBoundary } from 'react-error-boundary';

interface ILoanContractProps
  extends React.ClassAttributes<LoanContractComponent>,
    WithNamespaces,
    RouteComponentProps {
  readonly selectedAccount: IState['selectedAccount'];
  readonly accountList: IState['accountList'];

  readonly equityLoanContract: IState['equityLoanContract'];
  readonly queryEquityLoanContract: typeof queryEquityLoanContract;
}

interface ILoanContractState {
  readonly fromDate: Date;
  readonly toDate: Date;
  readonly isShowModal: boolean;
  readonly modalData: ILoanContractResponse;
}

class LoanContractComponent extends React.Component<
  ILoanContractProps,
  ILoanContractState
> {
  private localGridApi?: GridApi;
  private localModalGridApi?: GridApi;

  constructor(props: ILoanContractProps) {
    super(props);

    this.state = {
      fromDate: getDateAMonthAgo(),
      toDate: new Date(),
      isShowModal: false,
      modalData: {},
    };
  }

  componentDidMount() {
    this.queryLoanContract();
    this.props.i18n.on('languageChanged', this.onChangeLang);
  }

  shouldComponentUpdate(nextProps: ILoanContractProps) {
    if (
      this.props.selectedAccount !== nextProps.selectedAccount &&
      nextProps.selectedAccount &&
      nextProps.selectedAccount.accountType === AccountType.MARGIN
    ) {
      this.queryLoanContract();
    }
    return true;
  }

  componentWillUnmount() {
    this.props.i18n.off('languageChanged', this.onChangeLang);
  }

  render() {
    const { t } = this.props;
    // const lastRowData = this.props.equityLoanContract.data?.reduce(
    //   (val, curr) => ({
    //     no: 'Total',
    //     beginningOutstandingLoan: val.beginningOutstandingLoan + curr.beginningOutstandingLoan,
    //     newDebtIncrease: val.newDebtIncrease + curr.newDebtIncrease,
    //     paidAmountDecrease: val.paidAmountDecrease + curr.paidAmountDecrease,
    //     totalDebt: val.totalDebt + curr.totalDebt,
    //   }),
    //   {
    //     no: 'Total',
    //     beginningOutstandingLoan: 0,
    //     newDebtIncrease: 0,
    //     paidAmountDecrease: 0,
    //     totalDebt: 0,
    //   }
    // );
    const RenderItem = (
      <div className={styles.LoanContractData}>
        <div className={styles.LoanContractFilter}>
          <div className={styles.LoanContractAccount}>
            <p>{t('Account No.')}</p>
            <AccountDropdown
              isForm={true}
              unshowAccounts={this.props.accountList
                .filter((account) => account.accountType !== AccountType.MARGIN)
                .map((acc) => acc.account)}
            />
          </div>
          <div className={styles.LoanContractDate}>
            <p>{t('Date')}</p>
            <DateRangePicker
              onChangeStartDate={this.onChangeFromDate}
              onChangeEndDate={this.onChangeToDate}
              startDate={this.state.fromDate}
              endDate={this.state.toDate}
            />
          </div>
          <div className={styles.LoanContractDate}>
            <button
              className={globalStyles.QueryButton}
              onClick={this.queryLoanContract}
            >
              {t('Query')}
            </button>
          </div>
        </div>

        <SheetData
          rowData={[]}
          columnDefs={config.getColumnDefs()}
          // lastRowData={[lastRowData]}
          status={this.props.equityLoanContract.status}
          onGridReady={this.onGridReady}
          onRowClicked={this.onRowClicked}
          defaultColDef={config.DEFAULT_COL_DEF}
        />
      </div>
    );

    return (
      <div className={styles.LoanContract}>
        {RenderItem}
        <Modal
          show={this.state.isShowModal}
          isBackgroundBlur={true}
          onHide={this.hideModal}
        >
          <div className={styles.LoanContractModal}>
            <p>{t('Loan Contract Information')}</p>
            <SheetData
              rowData={[this.state.modalData]}
              columnDefs={config.getModalColumnDefs()}
              onGridReady={this.onModalGridReady}
            />
          </div>
        </Modal>
      </div>
    );
  }

  private queryLoanContract = () => {
    this.props.queryEquityLoanContract({
      accountNo: this.props.selectedAccount?.account,
      fromDate: formatDateToString(this.state.fromDate, 'yyyyMMdd'),
      toDate: formatDateToString(this.state.toDate, 'yyyyMMdd'),
    });
  };

  private onChangeFromDate = (date: Date) => {
    this.setState({ fromDate: date });
  };

  private onChangeToDate = (date: Date) => {
    this.setState({ toDate: date });
  };

  private onGridReady = (event: GridReadyEvent) => {
    this.localGridApi = event.api;
    setTimeout(() => {
      event.api.sizeColumnsToFit();
    }, 500);
  };

  private onModalGridReady = (event: GridReadyEvent) => {
    this.localModalGridApi = event.api;
  };

  private onChangeLang = () => {
    setTimeout(() => {
      this.localGridApi?.sizeColumnsToFit();
      this.localModalGridApi?.sizeColumnsToFit();
    });
  };

  private onRowClicked = (e: RowClickedEvent) => {
    this.setState({
      isShowModal: true,
      modalData: e.data,
    });
  };

  private hideModal = () => {
    this.setState({ isShowModal: false });
  };
}

const mapStateToProps = (state: IState) => ({
  selectedAccount: state.selectedAccount,
  accountList: state.accountList,
  equityLoanContract: state.equityLoanContract,
});

const mapDispatchToProps = {
  queryEquityLoanContract,
};

const LoanContract = withRouter(
  withErrorBoundary(
    withNamespaces('common')(
      connect(mapStateToProps, mapDispatchToProps)(LoanContractComponent)
    ),
    Fallback,
    handleError
  )
);

export default LoanContract;
