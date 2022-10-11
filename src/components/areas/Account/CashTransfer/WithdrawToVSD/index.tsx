import * as React from 'react';
import * as cashTransferStyle from '../styles.scss';
import { Fallback } from 'components/common';
import { IState } from 'redux/global-reducers';
import { IVSDCashTransferParams } from 'interfaces/api';
import { TransferType } from 'constants/enum';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { doVSDCashTransfer } from '../action';
import { handleError } from 'utils/common';
import { prefixAccount } from '../utils';
import { queryDerivativeTransferableAmount } from 'redux/global-actions';
import { withErrorBoundary } from 'react-error-boundary';
import Benificiary from '../Common/Beneficiary';
import CashTransferNote from '../Common/CashTransferNote';
import SendingAccount from '../Common/SendingAccount';

export interface IWithdrawToVSDProps
  extends React.ClassAttributes<WithdrawToVSDComponent>,
    WithNamespaces {
  readonly selectedAccount: IState['selectedAccount'];
  readonly derivativeTransferableAmount: IState['derivativeTransferableAmount'];
  readonly VSDCashTransferResult: IState['VSDCashTransferResult'];
  readonly userInfo: IState['userInfo'];
  readonly queryDerivativeTransferableAmount: typeof queryDerivativeTransferableAmount;
  readonly doVSDCashTransfer: typeof doVSDCashTransfer;
  readonly onSelectVSD: (bank: boolean, VSD: boolean) => void;
}

export interface IWithdrawToVSDState {
  readonly transferAmount: number;
  readonly beneficiaryAccountNo: string;
  readonly content: string;
}
class WithdrawToVSDComponent extends React.Component<
  IWithdrawToVSDProps,
  IWithdrawToVSDState
> {
  constructor(props: IWithdrawToVSDProps) {
    super(props);

    this.state = {
      transferAmount: 0,
      beneficiaryAccountNo: '',
      content: '',
    };
  }

  componentDidMount() {
    this.props.onSelectVSD(false, true);
    this.props.queryDerivativeTransferableAmount({
      accountNo: this.props.selectedAccount?.account,
    });
  }

  shouldComponentUpdate(nextProps: IWithdrawToVSDProps) {
    if (
      this.props.VSDCashTransferResult !== nextProps.VSDCashTransferResult &&
      nextProps.VSDCashTransferResult.status.isSucceeded
    ) {
      this.props.queryDerivativeTransferableAmount({
        accountNo: nextProps.selectedAccount?.account,
      });
    }
    return true;
  }

  render() {
    return (
      <div className={cashTransferStyle.CashTransferContent}>
        <div>
          <SendingAccount
            transferAmount={
              this.props.derivativeTransferableAmount.data
                ?.transferableAmountOfVSDAccount
            }
            isVSD={true}
            isWithdrawVSD={true}
          />
          <CashTransferNote isVSD={true} />
        </div>
        <div>
          <Benificiary
            transferableAmount={
              this.props.derivativeTransferableAmount.data
                ?.transferableAmountOfVSDAccount
            }
            modalTitle={'Withdraw from VSD Request'}
            onChangeTransferAmount={this.onChangeTransferAmount}
            transferAmount={this.state.transferAmount}
            onConfirm={this.onConfirmTransfer}
            onChangeContent={this.onChangeContent}
            onChangeBeneficiaryAccount={this.onChangeBeneficiaryAccount}
            onReset={this.onReset}
            content={this.state.content}
            isVSD={true}
            isWithdrawVSD={true}
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
    this.setState({ transferAmount: 0, content: '' });
  };

  private onConfirmTransfer = () => {
    const param: IVSDCashTransferParams = {
      transferType: TransferType.VSD_WITHDRAW,
      sendingAccountNo: prefixAccount() + this.props.userInfo?.username,
      beneficiaryAccountNo: this.props.selectedAccount?.account,
      transferAmount: this.state.transferAmount,
      transferableAmount: this.props.derivativeTransferableAmount.data
        ?.transferableAmountOfVSDAccount,
      content: this.state.content,
    };

    this.props.doVSDCashTransfer(param);
  };
}

const mapStateToProps = (state: IState) => ({
  selectedAccount: state.selectedAccount,
  derivativeTransferableAmount: state.derivativeTransferableAmount,
  VSDCashTransferResult: state.VSDCashTransferResult,
  userInfo: state.userInfo,
});

const mapDispatchToProps = {
  queryDerivativeTransferableAmount,
  doVSDCashTransfer,
};

const WithdrawToVSD = withErrorBoundary(
  withNamespaces('common')(
    connect(mapStateToProps, mapDispatchToProps)(WithdrawToVSDComponent)
  ),
  Fallback,
  handleError
);

export default WithdrawToVSD;
