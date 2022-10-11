import * as React from 'react';
import * as styles from './styles.scss';
import { AccountRoutes, Routes } from 'constants/routes';
import { AccountType, SystemType } from 'constants/enum';
import { Fallback, TabTable } from 'components/common';
import { IState } from 'redux/global-reducers';
import { ITabTableData } from 'interfaces/common';
import { RouteComponentProps, withRouter } from 'react-router';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { handleError } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';
import CashTransferHistory from './CashTransferHistory';
import CashTransferInternalSub from './CashTransferInternalSub';
import CashTransferToBank from './CashTransferToBank';
import DepositToVSD from './DepositToVSD';
import WithdrawToVSD from './WithdrawToVSD';

interface ICashTransferProps
  extends React.ClassAttributes<CashTransferComponent>,
    WithNamespaces,
    RouteComponentProps {
  readonly selectedAccount: IState['selectedAccount'];
}

interface ICashTransferState {
  readonly isVSD: boolean;
  readonly isBank: boolean;
}
class CashTransferComponent extends React.Component<
  ICashTransferProps,
  ICashTransferState
> {
  constructor(props: ICashTransferProps) {
    super(props);

    this.state = {
      isVSD: false,
      isBank: false,
    };
  }

  shouldComponentUpdate(nextProps: ICashTransferProps) {
    if (
      this.props.selectedAccount?.accountType !==
        nextProps.selectedAccount?.accountType &&
      nextProps.selectedAccount?.accountType !== AccountType.DERIVATIVES
    ) {
      this.setState({ isVSD: false });
    }
    if (
      this.props.selectedAccount?.isIICA &&
      this.props.selectedAccount?.accountType === AccountType.EQUITY
    ) {
      this.props.history.push(`/${Routes.ACCOUNT}/${AccountRoutes.SUMMARY}`);
    }
    return true;
  }

  render() {
    let cashTransferTab: ITabTableData[] = [
      {
        key: 'internal-sub',
        title: 'Transfer cash to internal sub account',
        default: true,
        component: <CashTransferInternalSub onSelectVSD={this.onSelectVSD} />,
      },
      {
        key: 'bank',
        title: 'Transfer cash to bank account',
        component: <CashTransferToBank onSelectVSD={this.onSelectVSD} />,
      },
    ];

    if (this.props.selectedAccount?.type === SystemType.DERIVATIVES) {
      cashTransferTab = [
        ...cashTransferTab,
        {
          key: 'deposit-vsd',
          title: 'Deposit to VSD',
          component: <DepositToVSD onSelectVSD={this.onSelectVSD} />,
        },
        {
          key: 'withdraw-vsd',
          title: 'Withdraw from VSD',
          component: <WithdrawToVSD onSelectVSD={this.onSelectVSD} />,
        },
      ];
    }

    if (this.props.selectedAccount?.isIICA) {
      cashTransferTab = cashTransferTab.slice(1);
    }

    return (
      <div className={styles.CashTransfer}>
        <TabTable data={cashTransferTab} />
        <CashTransferHistory
          isVSD={this.state.isVSD}
          isBank={this.state.isBank}
        />
      </div>
    );
  }

  private onSelectVSD = (bank: boolean, VSD: boolean) => {
    this.setState({ isBank: bank, isVSD: VSD });
  };
}

const mapStateToProps = (state: IState) => ({
  selectedAccount: state.selectedAccount,
});

const mapDispatchToProps = {};

const CashTransfer = withRouter(
  withErrorBoundary(
    withNamespaces('common')(
      connect(mapStateToProps, mapDispatchToProps)(CashTransferComponent)
    ),
    Fallback,
    handleError
  )
);

export default CashTransfer;
