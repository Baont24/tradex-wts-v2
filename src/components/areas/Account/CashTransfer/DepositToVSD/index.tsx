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

export interface IDepositToVSDProps
  extends React.ClassAttributes<DepositToVSDComponent>,
    WithNamespaces {
  readonly selectedAccount: IState['selectedAccount'];
  readonly derivativeTransferableAmount: IState['derivativeTransferableAmount'];
  readonly VSDCashTransferResult: IState['VSDCashTransferResult'];
  readonly userInfo: IState['userInfo'];
  readonly queryDerivativeTransferableAmount: typeof queryDerivativeTransferableAmount;
  readonly doVSDCashTransfer: typeof doVSDCashTransfer;
  readonly onSelectVSD: (bank: boolean, VSD: boolean) => void;
}

export interface IDepositToVSDState {
  readonly transferAmount: number;
  readonly beneficiaryAccountNo: string;
  readonly content: string;
}
class DepositToVSDComponent extends React.Component<
  IDepositToVSDProps,
  IDepositToVSDState
> {
  constructor(props: IDepositToVSDProps) {
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

  shouldComponentUpdate(nextProps: IDepositToVSDProps) {
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
                ?.transferableAmountToVSDAccount
            }
            isVSD={true}
          />
          <CashTransferNote isVSD={true} />
        </div>
        <div>
          <Benificiary
            transferableAmount={
              this.props.derivativeTransferableAmount.data
                ?.transferableAmountToVSDAccount
            }
            modalTitle={'Deposit to VSD Request'}
            onChangeTransferAmount={this.onChangeTransferAmount}
            transferAmount={this.state.transferAmount}
            onConfirm={this.onConfirmTransfer}
            onChangeContent={this.onChangeContent}
            onChangeBeneficiaryAccount={this.onChangeBeneficiaryAccount}
            onReset={this.onReset}
            content={this.state.content}
            isVSD={true}
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
      transferType: TransferType.VSD_DEPOSIT,
      sendingAccountNo: this.props.selectedAccount?.account,
      beneficiaryAccountNo: prefixAccount() + this.props.userInfo?.username,
      transferAmount: this.state.transferAmount,
      transferableAmount: this.props.derivativeTransferableAmount.data
        ?.transferableAmountToVSDAccount,
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

const DepositToVSD = withErrorBoundary(
  withNamespaces('common')(
    connect(mapStateToProps, mapDispatchToProps)(DepositToVSDComponent)
  ),
  Fallback,
  handleError
);

export default DepositToVSD;
