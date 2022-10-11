import * as React from 'react';
import * as _ from 'lodash';
import * as configColumnDefs from './config';
import * as globalStyles from 'styles/style.scss';
import * as styles from './styles.scss';
import { DatePicker, Fallback, SheetData, TabTable } from 'components/common';
import { GridApi, GridReadyEvent } from 'ag-grid-community';
import { IState } from 'redux/global-reducers';
import { RouteComponentProps, withRouter } from 'react-router';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { handleError } from 'utils/common';
import { onSubmmitConfirmDebt, queryEquityConfirmDebt } from './action';
import { queryClientDetail } from 'redux/global-actions';
import { withErrorBoundary } from 'react-error-boundary';
import configEnv from 'config';

interface IConfirmDebtProps
  extends React.ClassAttributes<ConfirmDebtComponent>,
    WithNamespaces,
    RouteComponentProps {
  readonly selectedAccount: IState['selectedAccount'];
  readonly accountList: IState['accountList'];
  readonly clientDetail: IState['clientDetail'];
  readonly equityConfirmDebt: IState['equityConfirmDebt'];
  readonly equitySubmitConfirmDebt: IState['equitySubmitConfirmDebt'];
  readonly queryClientDetail: typeof queryClientDetail;
  readonly queryEquityConfirmDebt: typeof queryEquityConfirmDebt;
  readonly onSubmmitConfirmDebt: typeof onSubmmitConfirmDebt;
}

interface IConfirmDebtState {
  readonly fromDate: Date;
}

class ConfirmDebtComponent extends React.Component<
  IConfirmDebtProps,
  IConfirmDebtState
> {
  private localGridApi?: GridApi;

  constructor(props: IConfirmDebtProps) {
    super(props);
    this.state = {
      fromDate: new Date(),
    };
  }

  componentDidMount() {
    this.queryConfirmDebt();
    if (!this.props.clientDetail?.customerProfile) {
      this.props.queryClientDetail({
        clientID: this.props.selectedAccount?.username,
      });
    }
    this.props.i18n.on('languageChanged', this.onChangeLang);
  }

  componentDidUpdate(prevProps: IConfirmDebtProps) {
    if (
      this.props.selectedAccount !== prevProps.selectedAccount ||
      (this.props.equitySubmitConfirmDebt !==
        prevProps.equitySubmitConfirmDebt &&
        this.props.equitySubmitConfirmDebt.status.isSucceeded)
    ) {
      this.queryConfirmDebt();
    }

    if (
      this.props.equityConfirmDebt !== prevProps.equityConfirmDebt &&
      this.props.equityConfirmDebt.data?.callAPi ===
        'First_Time_Signed_Equal_False' &&
      _.isEmpty(this.props.equityConfirmDebt.data.resConfirmDebt)
    ) {
      this.queryConfirmDebt(true);
    }
  }

  componentWillUnmount() {
    this.props.i18n.off('languageChanged', this.onChangeLang);
  }

  render() {
    const {
      t,
      equityConfirmDebt: { data, status },
      clientDetail: { customerProfile },
    } = this.props;
    const customerInfor = [
      { title: 'Full name', data: customerProfile?.userName },
      { title: 'Account number', data: customerProfile?.accountNo },
      { title: 'ID_PASSPORT_NO', data: customerProfile?.customerID },
      { title: 'Address', data: customerProfile?.address },
    ];

    const debtMarginInforData =
      configEnv.hideConfirmDebtProfitFields === true
        ? [
            {
              content: 'Ending Balance 2',
              transactionAmount: data?.resConfirmDebt.endingBalance,
            },
          ]
        : [
            {
              content: 'Beginning Balance 2',
              transactionAmount: data?.resConfirmDebt.beginningBalance,
            },
            {
              content: 'Additional Disbursement',
              transactionAmount: data?.resConfirmDebt.additionalDisbursement,
            },
            {
              content: 'Repayment Amount',
              transactionAmount: data?.resConfirmDebt.repaymentAmount,
            },
            {
              content: 'Ending Balance 2',
              transactionAmount: data?.resConfirmDebt.endingBalance,
            },
            {
              content: 'Outstanding Interest',
              transactionAmount: data?.resConfirmDebt.outstandingInterest,
            },
            {
              content: 'Outstanding Debt',
              transactionAmount: data?.resConfirmDebt.outstandingDept,
            },
          ];

    const debtMarginInformationData = (
      <SheetData
        rowData={debtMarginInforData}
        columnDefs={configColumnDefs.debtMarginInfor()}
        status={status}
        onGridReady={this.onGridReady}
      />
    );

    const debtConfirmationHistory = (
      <>
        <div className={styles.ConfirmDebtFilter}>
          <div className={styles.ConfirmDebtDate}>
            <p>{t('Date')}</p>
            <DatePicker
              selected={this.state.fromDate}
              onChange={this.onChangeFromDate}
              dateFormat="MM/yyyy"
              minDate={
                new Date(new Date().setMonth(new Date().getMonth() - 12))
              }
              maxDate={new Date()}
              showMonthYearPicker
              showFullMonthYearPicker
              showTwoColumnMonthYearPicker
              popperModifiers={{
                flip: {
                  behavior: ['bottom'],
                  flipVariations: true,
                },
                preventOverflow: {
                  enabled: false,
                },
              }}
            />
          </div>
        </div>
        <SheetData
          rowData={
            _.isEmpty(data?.resConfirmDebt) || data?.resConfirmDebt == null
              ? []
              : [data.resConfirmDebt]
          }
          columnDefs={configColumnDefs.debtConfirmationHistory()}
          status={status}
          onGridReady={this.onGridReady}
        />
      </>
    );

    const customerInfo = customerInfor.map((info) => (
      <div className={styles.InformationTableRow} key={info.title}>
        <p className={styles.InformationTableRowTitle}>{t(info.title)}</p>
        <p>{info.data}</p>
      </div>
    ));

    const RenderItem = (
      <div className={styles.ConfirmDebt}>
        <div className={styles.ConfirmDebtData}>
          <div className={styles.DebtMarginContainer}>
            <TabTable
              data={[
                {
                  key: 'Debt Margin Information',
                  title: 'Debt Margin Information',
                  component: debtMarginInformationData,
                },
              ]}
            />
          </div>

          <div className={styles.CustomerInformation}>
            <TabTable
              data={[
                {
                  key: 'Customer Information',
                  title: 'Customer Information',
                  component: customerInfo,
                },
              ]}
            />
          </div>
        </div>
        <p>
          {t('NOTE_CONFIRMDEBT 2')}
          <span className={styles.ButtonContainer}>
            <button
              className={globalStyles.QueryButton}
              onClick={this.onClickConfirm}
              disabled={
                _.isEmpty(data?.resConfirmDebt) || data?.resConfirmDebt.status
              }
            >
              {t('Confirm')}
            </button>
          </span>
        </p>
        <p className={globalStyles.Down}>{t('NOTE_CONFIRMDEBT')}</p>

        <div className={styles.DebtConfirmationHistoryContainer}>
          <TabTable
            data={[
              {
                key: 'Debt Confirmation History',
                title: 'Debt Confirmation History',
                component: debtConfirmationHistory,
              },
            ]}
          />
        </div>
      </div>
    );

    return RenderItem;
  }

  private queryConfirmDebt = (signed?: boolean) => {
    if (this.props.selectedAccount?.account) {
      this.props.queryEquityConfirmDebt({
        accountNumber: this.props.selectedAccount?.account,
        historyBy: this.state.fromDate.getMonth(),
        signed: signed ?? false,
      });
    }
  };

  private onClickConfirm = () => {
    const {
      equityConfirmDebt: { data },
    } = this.props;
    if (data?.resConfirmDebt) {
      this.props.onSubmmitConfirmDebt({
        accountNumber: data.resConfirmDebt.accountNumber,
        endingBalance: data.resConfirmDebt.endingBalance,
        outstandingInterest: data.resConfirmDebt.outstandingInterest,
        status: data.resConfirmDebt.status,
        dateConfirm: data.resConfirmDebt.dateConfirm,
        signable: data.resConfirmDebt.signable,
        applicationID: data.resConfirmDebt.applicationID,
        applicationDate: data.resConfirmDebt.applicationDate,
      });
    }
  };

  private onChangeFromDate = (date: Date) => {
    this.setState({ fromDate: date }, () => {
      this.queryConfirmDebt(false);
    });
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
  accountList: state.accountList,
  clientDetail: state.clientDetail,
  equityConfirmDebt: state.equityConfirmDebt,
  equitySubmitConfirmDebt: state.equitySubmitConfirmDebt,
});

const mapDispatchToProps = {
  queryClientDetail,
  queryEquityConfirmDebt,
  onSubmmitConfirmDebt,
};

const ConfirmDebt = withRouter(
  withErrorBoundary(
    withNamespaces('common')(
      connect(mapStateToProps, mapDispatchToProps)(ConfirmDebtComponent)
    ),
    Fallback,
    handleError
  )
);

export default ConfirmDebt;
