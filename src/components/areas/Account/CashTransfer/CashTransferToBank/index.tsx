import * as React from 'react';
import * as cashTransferStyle from '../styles.scss';
import { Fallback } from 'components/common';
import {
  IEquityBankInfoResponse,
  IParamsDoInternalTransfer,
} from 'interfaces/api';
import { IState } from 'redux/global-reducers';
import { SystemType, TransferType } from 'constants/enum';
import { ToastType } from 'react-toastify';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { doCashTransfer, doDerivativeBankCashTransfer } from '../action';
import { handleError } from 'utils/common';
import { queryBankInfo, queryBankListInfo } from './action';
import {
  queryDerivativeTransferableAmount,
  queryTransferableAmount,
  showNotification,
} from 'redux/global-actions';
import { withErrorBoundary } from 'react-error-boundary';
import Benificiary, { IDropdownData } from '../Common/Beneficiary';
import CashTransferNote from '../Common/CashTransferNote';
import SendingAccount from '../Common/SendingAccount';

export interface ICashTransferToBankProps
  extends React.ClassAttributes<CashTransferToBankComponent>,
    WithNamespaces {
  readonly selectedAccount: IState['selectedAccount'];
  readonly equityTransferableAmount: IState['equityTransferableAmount'];
  readonly equityBankInfo: IState['equityBankInfo'];
  readonly derivativeTransferableAmount: IState['derivativeTransferableAmount'];
  readonly equityCashTransferResult: IState['equityCashTransferResult'];
  readonly derivativeBankCashTransferResult: IState['derivativeBankCashTransferResult'];
  readonly globalBankInfo: IState['bankInfo'];
  readonly queryTransferableAmount: typeof queryTransferableAmount;
  readonly queryDerivativeTransferableAmount: typeof queryDerivativeTransferableAmount;
  readonly queryBankInfo: typeof queryBankInfo;
  readonly doCashTransfer: typeof doCashTransfer;
  readonly doDerivativeBankCashTransfer: typeof doDerivativeBankCashTransfer;
  readonly onSelectVSD: (bank: boolean, VSD: boolean) => void;
  readonly queryBankListInfo: typeof queryBankListInfo;
  readonly showNotification: typeof showNotification;
}

export interface ICashTransferToBankState {
  readonly transferAmount: number;
  readonly beneficiaryAccountNo: string;
  readonly content: string;
  readonly bankName: string;
  readonly branchId: string;
  readonly branchName: string;
}
class CashTransferToBankComponent extends React.Component<
  ICashTransferToBankProps,
  ICashTransferToBankState
> {
  private localAccountData: IDropdownData[] | [] = [];
  private localIsDerivatives: boolean;
  private localBank?: IEquityBankInfoResponse;
  constructor(props: ICashTransferToBankProps) {
    super(props);

    this.state = {
      transferAmount: 0,
      beneficiaryAccountNo: '',
      content: '',
      bankName: '',
      branchId: '',
      branchName: '',
    };
  }

  componentDidMount() {
    this.props.onSelectVSD(true, false);
    this.localIsDerivatives =
      this.props.selectedAccount?.type === SystemType.DERIVATIVES;
    this.queryTransferableAmount(this.props.selectedAccount?.account);
    this.props.queryBankInfo({
      accountNo: this.props.selectedAccount?.account,
      systemType: this.props.selectedAccount?.type,
    });
    if (this.props.globalBankInfo.length === 0) {
      this.props.queryBankListInfo();
    }
  }

  shouldComponentUpdate(nextProps: ICashTransferToBankProps) {
    if (this.props.selectedAccount !== nextProps.selectedAccount) {
      this.localIsDerivatives =
        nextProps.selectedAccount?.type === SystemType.DERIVATIVES;
      this.queryTransferableAmount(nextProps.selectedAccount?.account);
      this.props.queryBankInfo({
        accountNo: nextProps.selectedAccount?.account,
        systemType: nextProps.selectedAccount?.type,
      });
      this.localBank = (this.props.equityBankInfo || []).data?.find(
        (bank) => bank.bankId === this.state.beneficiaryAccountNo
      );
    }
    if (nextProps.equityBankInfo !== this.props.equityBankInfo) {
      this.localAccountData =
        nextProps.equityBankInfo.data?.map((bank) => {
          return { title: bank.bankId, value: bank.bankName };
        }) || [];
      this.localBank = (nextProps.equityBankInfo || []).data?.find(
        (bank) => bank.bankId === this.state.beneficiaryAccountNo
      );
    }
    if (
      (this.props.derivativeBankCashTransferResult !==
        nextProps.derivativeBankCashTransferResult &&
        nextProps.derivativeBankCashTransferResult.status.isSucceeded) ||
      (this.props.equityCashTransferResult !==
        nextProps.equityCashTransferResult &&
        nextProps.equityCashTransferResult.status.isSucceeded)
    ) {
      this.queryTransferableAmount(nextProps.selectedAccount?.account);
    }
    return true;
  }

  render() {
    return (
      <div className={cashTransferStyle.CashTransferContent}>
        <div>
          <SendingAccount
            transferAmount={
              this.localIsDerivatives
                ? this.props.derivativeTransferableAmount.data
                    ?.transferableAmountToInternalSubsOrToBank
                : this.props.equityTransferableAmount.data?.transferableAmount
            }
            isTransferToBank={true}
          />
          <CashTransferNote />
        </div>
        <div>
          <Benificiary
            transferableAmount={
              this.localIsDerivatives
                ? this.props.derivativeTransferableAmount.data
                    ?.transferableAmountToInternalSubsOrToBank
                : this.props.equityTransferableAmount.data?.transferableAmount
            }
            modalTitle={'Transfer cash to bank account'}
            accountData={this.localAccountData}
            onChangeTransferAmount={this.onChangeTransferAmount}
            transferAmount={this.state.transferAmount}
            onConfirm={this.onConfirmTransfer}
            onChangeContent={this.onChangeContent}
            onChangeBeneficiaryAccount={this.onChangeBeneficiaryAccount}
            onReset={this.onReset}
            content={this.state.content}
            isTransferToBank={true}
            bankInfo={this.localBank}
            onChangeBankName={this.onChangeBankName}
            onChangeBranchName={this.onChangeBranchName}
          />
        </div>
      </div>
    );
  }

  private onChangeBeneficiaryAccount = (value: string) => {
    this.setState({ beneficiaryAccountNo: value });
    this.localBank = this.props.equityBankInfo.data?.find(
      (bank) => bank.bankAccNo === value
    );
  };

  private onChangeContent = (value: string) => {
    this.setState({ content: value });
  };

  private onChangeBankName = (value: string) => {
    this.setState({ bankName: value });
  };

  private onChangeBranchName = (branchId: string, branchName: string) => {
    this.setState({ branchName, branchId });
  };

  private onChangeTransferAmount = (value: number) => {
    this.setState({ transferAmount: value });
  };

  private onReset = () => {
    const beneficiaryAccountNoReset = this.props.equityBankInfo.data?.length
      ? this.props.equityBankInfo.data[0].bankId
      : '';
    this.localBank = this.props.equityBankInfo.data?.find(
      (bank) => bank.bankId === beneficiaryAccountNoReset
    );
    this.setState({
      transferAmount: 0,
      beneficiaryAccountNo: '',
      content: '',
      branchId: '',
      branchName: '',
      bankName: '',
    });
  };

  private queryTransferableAmount = (accountNo?: string) => {
    if (this.localIsDerivatives) {
      this.props.queryDerivativeTransferableAmount({ accountNo });
    } else {
      this.props.queryTransferableAmount({ accountNo });
    }
  };

  private onConfirmTransfer = (otpToken?: string) => {
    if (otpToken == null) {
      this.props.showNotification({
        type: ToastType.ERROR,
        title: 'Cash Transfer',
        content: 'Token is invalid',
        time: new Date(),
      });
      return;
    }

    if (this.localIsDerivatives) {
      const params: IParamsDoInternalTransfer = {
        transferType: TransferType.TO_BANK,
        sendingAccountNumber: this.props.selectedAccount?.account,
        sendingFullName: this.props.selectedAccount?.accountName,
        transferableAmount: this.props.derivativeTransferableAmount.data
          ?.transferableAmountToInternalSubsOrToBank,
        beneficiaryAccountNumber:
          this.localBank?.bankId || this.state.beneficiaryAccountNo,
        beneficiaryFullName:
          this.localBank?.ownerName || this.props.selectedAccount?.accountName,
        transferAmount: this.state.transferAmount,
        beneficiaryBank: this.localBank?.bankName || this.state.bankName,
        beneficiaryBankBranch:
          this.localBank?.bankBranchName || this.state.branchName,
        content: this.state.content,
        transferFee: 0,
        otpToken,
      };

      this.props.doDerivativeBankCashTransfer(params);
    } else {
      const params: IParamsDoInternalTransfer = {
        transferType: TransferType.TO_BANK,
        senderAccountNo: this.props.selectedAccount?.account,
        senderFullName: this.props.selectedAccount?.accountName,
        transferableAmount: this.props.equityTransferableAmount.data
          ?.transferableAmount,
        beneficiaryBankNumber:
          this.localBank?.bankId || this.state.beneficiaryAccountNo,
        beneficiaryFullName:
          this.localBank?.ownerName || this.props.selectedAccount?.accountName,
        beneficiaryBankName: this.localBank?.bankName || this.state.bankName,
        beneficiaryBankBranch:
          this.localBank?.bankBranchName || this.state.branchName,
        beneficiaryBankBranchId:
          this.localBank?.bankBranchID || this.state.branchId,
        transferAmount: this.state.transferAmount,
        content: this.state.content,
        transferFee: 0,
        otpToken,
      };
      this.props.doCashTransfer(params);
    }
  };
}

const mapStateToProps = (state: IState) => ({
  selectedAccount: state.selectedAccount,
  equityTransferableAmount: state.equityTransferableAmount,
  equityBankInfo: state.equityBankInfo,
  derivativeTransferableAmount: state.derivativeTransferableAmount,
  equityCashTransferResult: state.equityCashTransferResult,
  derivativeBankCashTransferResult: state.derivativeBankCashTransferResult,
  globalBankInfo: state.bankInfo,
});

const mapDispatchToProps = {
  queryTransferableAmount,
  queryBankInfo,
  doCashTransfer,
  doDerivativeBankCashTransfer,
  queryDerivativeTransferableAmount,
  queryBankListInfo,
  showNotification,
};

const CashTransferToBank = withErrorBoundary(
  withNamespaces('common')(
    connect(mapStateToProps, mapDispatchToProps)(CashTransferToBankComponent)
  ),
  Fallback,
  handleError
);

export default CashTransferToBank;
