import * as React from 'react';
import * as styles from './styles.scss';
import { AccountRoutes, LoanDetailTab, Routes } from 'constants/routes';
import { AccountType } from 'constants/enum';
import { Fallback, TabTable } from 'components/common';
import {
  ILoanDetailTabParams,
  assetManagementTab,
  loanDetailTab,
} from '../config';
import { IState } from 'redux/global-reducers';
import { RouteComponentProps, withRouter } from 'react-router';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { changeAccount } from 'redux/global-actions';
import { connect } from 'react-redux';
import { domainConfig } from 'config/domain';
import { handleError } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';
import ConfirmDebt from './ConfirmDebt';
import InterestExpenseStatement from './InterestExpenseStatement';
import LoanContract from './LoanContract';
import LoanStatement from './LoanStatement';
import config from 'config';

interface ILoanDetailProps
  extends React.ClassAttributes<LoanDetailComponent>,
    WithNamespaces,
    RouteComponentProps {
  readonly selectedAccount: IState['selectedAccount'];
  readonly accountList: IState['accountList'];
  readonly config: IState['config'];
  readonly changeAccount: typeof changeAccount;
}

class LoanDetailComponent extends React.Component<ILoanDetailProps> {
  constructor(props: ILoanDetailProps) {
    super(props);

    this.state = {};
  }

  componentDidMount() {
    const marginAccounts = this.props.accountList.filter(
      (account) => account.accountType === AccountType.MARGIN
    );
    if (marginAccounts[0]) {
      this.props.changeAccount(marginAccounts[0]);
    }
  }

  render() {
    const loanTabParams: ILoanDetailTabParams[] = [
      { key: LoanDetailTab.LOAN_STATEMENT, component: <LoanStatement /> },
      {
        key: LoanDetailTab.LOAN_CONTRACT,
        component: <LoanContract />,
        hide: true,
      },
      {
        key: LoanDetailTab.CONFIRM_DEBT,
        component: <ConfirmDebt />,
      },
      {
        key: LoanDetailTab.INTEREST_EXPENSE_STATEMENT,
        component: <InterestExpenseStatement />,
        hide: Boolean(
          domainConfig[config.domain]?.hideInterestExpenseStatement
        ),
      },
    ];
    const RenderItem = (
      <TabTable isSimpleTab={true} data={loanDetailTab(loanTabParams)} />
    );
    return (
      <div className={styles.LoanDetail}>
        <TabTable
          data={assetManagementTab(
            AccountRoutes.LOAN_DETAIL,
            RenderItem,
            this.props.selectedAccount?.type
          )}
          onSelect={this.onSelect}
        />
      </div>
    );
  }

  private onSelect = (eventKey: string) => {
    this.props.history.push(`/${Routes.ACCOUNT}/${eventKey}`);
  };
}

const mapStateToProps = (state: IState) => ({
  selectedAccount: state.selectedAccount,
  accountList: state.accountList,
  config: state.config,
});

const mapDispatchToProps = {
  changeAccount,
};

const LoanDetail = withRouter(
  withErrorBoundary(
    withNamespaces('common')(
      connect(mapStateToProps, mapDispatchToProps)(LoanDetailComponent)
    ),
    Fallback,
    handleError
  )
);

export default LoanDetail;
