import * as React from 'react';
import * as cashTransferStyle from '../styles.scss';
import { AccountType, SystemType, TransferType } from 'constants/enum';
import { Fallback } from 'components/common';
import {
  IDerCashTransferParams,
  IParamsDoInternalTransfer,
} from 'interfaces/api';
import { IState } from 'redux/global-reducers';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { doCashTransfer, doDerivativeInternalCashTransfer } from '../action';
import { handleError } from 'utils/common';
import {
  queryDerivativeTransferableAmount,
  queryTransferableAmount,
} from 'redux/global-actions';
import { querySubAccount } from './action';
import { withErrorBoundary } from 'react-error-boundary';
import Benificiary, { IDropdownData } from '../Common/Beneficiary';
import CashTransferNote from '../Common/CashTransferNote';
import SendingAccount from '../Common/SendingAccount';

export interface ICashTransferInternalSubProps
  extends React.ClassAttributes<CashTransferInternalSubComponent>,
    WithNamespaces {
  readonly selectedAccount: IState['selectedAccount'];
  readonly equityTransferableAmount: IState['equityTransferableAmount'];
  readonly equitySubAccount: IState['equitySubAccount'];
  readonly derivativeTransferableAmount: IState['derivativeTransferableAmount'];
  readonly equityCashTransferResult: IState['equityCashTransferResult'];
  readonly derivativeInternalCashTransferResult: IState['derivativeInternalCashTransferResult'];
  readonly accountList: IState['accountList'];
  readonly queryTransferableAmount: typeof queryTransferableAmount;
  readonly queryDerivativeTransferableAmount: typeof queryDerivativeTransferableAmount;
  readonly querySubAccount: typeof querySubAccount;
  readonly doCashTransfer: typeof doCashTransfer;
  readonly doDerivativeInternalCashTransfer: typeof doDerivativeInternalCashTransfer;
  readonly onSelectVSD: (bank: boolean, VSD: boolean) => void;
}

export interface ICashTransferInternalSubState {
  readonly transferAmount: number;
  readonly beneficiaryAccountNo: string;
  readonly content: string;
}
class CashTransferInternalSubComponent extends React.Component<
  ICashTransferInternalSubProps,
  ICashTransferInternalSubState
> {
  private localAccountData: IDropdownData[] | [] = [];
  private localIsDerivatives: boolean;

  constructor(props: ICashTransferInternalSubProps) {
    super(props);

    this.state = {
      transferAmount: 0,
      beneficiaryAccountNo: '',
      content: '',
    };
  }

  componentDidMount() {
    this.props.onSelectVSD(false, false);
    this.localIsDerivatives =
      this.props.selectedAccount?.type === SystemType.DERIVATIVES;
    this.queryTransferableAmount(this.props.selectedAccount?.account);
    this.props.querySubAccount({
      clientID: this.props.selectedAccount?.username,
    });
  }

  shouldComponentUpdate(nextProps: ICashTransferInternalSubProps) {
    if (
      nextProps.equitySubAccount.data &&
      nextProps.equitySubAccount.data !== this.props.equitySubAccount.data
    ) {
      const defaultSubAccount = nextProps.equitySubAccount.data.find(
        (subAccount) => subAccount.defaultSubAccount
      );
      const derivativeAccount = nextProps.accountList.find(
        (account) => account.accountType === AccountType.DERIVATIVES
      );
      this.localAccountData = nextProps.equitySubAccount.data
        .filter((account) => {
          if (this.localIsDerivatives) {
            return account.defaultSubAccount;
          }
          return defaultSubAccount?.subAccountID ===
            nextProps.selectedAccount?.account
            ? account.subAccountID !== nextProps.selectedAccount?.account
            : account.subAccountID !== nextProps.selectedAccount?.account &&
                account.subAccountID !== derivativeAccount?.account;
        })
        .map((account) => {
          return { title: account.subAccountID, value: account.subAccountID };
        });
    }

    if (this.props.selectedAccount !== nextProps.selectedAccount) {
      this.localIsDerivatives =
        nextProps.selectedAccount?.type === SystemType.DERIVATIVES;
      this.props.querySubAccount({
        clientID: nextProps.selectedAccount?.username,
      });
      this.queryTransferableAmount(nextProps.selectedAccount?.account);
    }

    if (
      (this.props.derivativeInternalCashTransferResult !==
        nextProps.derivativeInternalCashTransferResult &&
        nextProps.derivativeInternalCashTransferResult.status.isSucceeded) ||
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
            modalTitle={'Transfer cash to internal sub account'}
            accountData={this.localAccountData}
            onChangeTransferAmount={this.onChangeTransferAmount}
            transferAmount={this.state.transferAmount}
            onConfirm={this.onConfirmTransfer}
            onChangeContent={this.onChangeContent}
            onChangeBeneficiaryAccount={this.onChangeBeneficiaryAccount}
            onReset={this.onReset}
            content={this.state.content}
          />
        </div>
      </div>
    );
  }

  private onChangeBeneficiaryAccount = (value: string) => {
    this.setState({ beneficiaryAccountNo: value });
  };

  private onChangeContent = (value: string) => {
    this.setState({ content: value });
  };

  private onChangeTransferAmount = (value: number) => {
    this.setState({ transferAmount: value });
  };

  private onReset = () => {
    this.setState({ transferAmount: 0, beneficiaryAccountNo: '', content: '' });
  };

  private queryTransferableAmount = (accountNo?: string) => {
    if (this.localIsDerivatives) {
      this.props.queryDerivativeTransferableAmount({ accountNo });
    } else {
      this.props.queryTransferableAmount({ accountNo });
    }
  };

  private onConfirmTransfer = () => {
    const beneficiaryAccount = this.props.accountList?.find(
      (account) => account.account === this.state.beneficiaryAccountNo
    );
    const isTransferToDer =
      beneficiaryAccount?.accountType === AccountType.DERIVATIVES;
    if (this.localIsDerivatives || isTransferToDer) {
      const param: IDerCashTransferParams = {
        accountNumber: isTransferToDer
          ? this.state.beneficiaryAccountNo
          : this.props.selectedAccount?.account,
        transferType: isTransferToDer
          ? TransferType.EQT_TO_DR
          : TransferType.DR_TO_EQT,
        transferAmount: this.state.transferAmount,
        transferableAmount: isTransferToDer
          ? this.props.equityTransferableAmount.data?.transferableAmount
          : this.props.derivativeTransferableAmount.data
              ?.transferableAmountToInternalSubsOrToBank,
        content: this.state.content,
      };
      this.props.doDerivativeInternalCashTransfer(param);
    } else {
      const param: IParamsDoInternalTransfer = {
        transferType: TransferType.TO_SUB,
        senderAccountNo: this.props.selectedAccount?.account,
        senderFullName: this.props.selectedAccount?.accountName,
        transferableAmount: this.props.equityTransferableAmount.data
          ?.transferableAmount,
        beneficiaryAccountNo: this.state.beneficiaryAccountNo,
        beneficiaryFullName: this.props.selectedAccount?.accountName,
        transferAmount: this.state.transferAmount,
        content: this.state.content,
        transferFee: 0,
      };
      this.props.doCashTransfer(param);
    }
  };
}

const mapStateToProps = (state: IState) => ({
  selectedAccount: state.selectedAccount,
  equityTransferableAmount: state.equityTransferableAmount,
  equitySubAccount: state.equitySubAccount,
  accountList: state.accountList,
  derivativeTransferableAmount: state.derivativeTransferableAmount,
  equityCashTransferResult: state.equityCashTransferResult,
  derivativeInternalCashTransferResult:
    state.derivativeInternalCashTransferResult,
});

const mapDispatchToProps = {
  queryTransferableAmount,
  queryDerivativeTransferableAmount,
  querySubAccount,
  doCashTransfer,
  doDerivativeInternalCashTransfer,
};

const CashTransferInternalSub = withErrorBoundary(
  withNamespaces('common')(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(CashTransferInternalSubComponent)
  ),
  Fallback,
  handleError
);

export default CashTransferInternalSub;
