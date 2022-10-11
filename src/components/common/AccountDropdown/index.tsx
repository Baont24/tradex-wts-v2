import * as React from 'react';
import * as classNames from 'classnames';
import * as styles from './styles.scss';
import { Dropdown, Fallback } from 'components/common';
import { IAccount } from 'interfaces/common';
import { IState } from 'redux/global-reducers';
import { SystemType } from 'constants/enum';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { changeAccount } from 'redux/global-actions';
import { connect } from 'react-redux';
import { handleError } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';

const ALL = 'ALL';
export interface IAccountDropdownProps
  extends React.ClassAttributes<AccountDropdownComponent>,
    WithNamespaces {
  readonly isForm?: boolean;
  readonly accountList: IState['accountList'];
  readonly selectedAccount: IState['selectedAccount'];
  readonly isAccountChanged?: boolean;
  readonly unshowAccounts?: string[];
  readonly isSelectedAll?: boolean;
  readonly type?: SystemType;

  readonly changeAccount: typeof changeAccount;
  readonly onChange?: (account?: IAccount | string) => void;
}

export interface IAccountDropdownState {
  readonly selectedAccount: IState['selectedAccount'];
  readonly isSelectedAllAccounts?: boolean;
}

class AccountDropdownComponent extends React.Component<
  IAccountDropdownProps,
  IAccountDropdownState
> {
  static defaultProps = {
    isAccountChanged: true,
  };

  constructor(props: IAccountDropdownProps) {
    super(props);

    this.state = {
      selectedAccount: null,
      isSelectedAllAccounts: false,
    };
  }

  static getDerivedStateFromProps(
    nextProps: IAccountDropdownProps,
    prevState: IAccountDropdownState
  ): Partial<IAccountDropdownState> | null {
    let selectedAccount = nextProps.selectedAccount;

    if (!nextProps.isAccountChanged) {
      selectedAccount = prevState.selectedAccount;
    }

    return {
      selectedAccount,
    };
  }

  render() {
    let mutableAccounts = this.props.accountList
      .filter((val) => this.props.type == null || val.type === this.props.type)
      .map((val) => ({
        title: val.accountDisplay ?? val.account,
        value: val.accountNumber,
      }));

    if (this.props.isSelectedAll) {
      mutableAccounts.push({ title: ALL, value: ALL });
    }

    if (this.props.unshowAccounts) {
      mutableAccounts = mutableAccounts.filter(
        (val) => !this.props.unshowAccounts?.includes(val.value)
      );
    }

    return (
      <div
        className={classNames(styles.AccountDropdown, {
          [styles.AccountDropdownForm]: this.props.isForm,
        })}
      >
        <Dropdown
          placeholder={
            this.state.selectedAccount?.accountDisplay ??
            this.state.selectedAccount?.account
          }
          data={mutableAccounts}
          activeItem={
            this.state.isSelectedAllAccounts
              ? ALL
              : this.state.selectedAccount?.accountNumber
          }
          onSelect={this.onSelectAccount}
        />
      </div>
    );
  }

  private onSelectAccount = (title: string, value: string) => {
    if (this.props.isSelectedAll) {
      if (value === ALL) {
        this.setState({ isSelectedAllAccounts: true });
        this.props.onChange?.(ALL);
        return;
      } else {
        this.setState({ isSelectedAllAccounts: false });
      }
    }
    const selectedAccount = this.props.accountList.find(
      (val) => val.accountNumber === value
    );
    if (selectedAccount) {
      if (this.props.isAccountChanged) {
        this.props.changeAccount(selectedAccount);
      } else {
        this.setState({
          selectedAccount,
        });
      }
      this.props.onChange?.(selectedAccount);
    }
  };
}

const mapStateToProps = (state: IState) => ({
  accountList: state.accountList,
  selectedAccount: state.selectedAccount,
});

const mapDispatchToProps = {
  changeAccount,
};

const AccountDropdown = withErrorBoundary(
  withNamespaces('common')(
    connect(mapStateToProps, mapDispatchToProps)(AccountDropdownComponent)
  ),
  Fallback,
  handleError
);

export default AccountDropdown;
