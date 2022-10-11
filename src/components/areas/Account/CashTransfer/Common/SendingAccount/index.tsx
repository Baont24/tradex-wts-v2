import * as React from 'react';
import * as style from './styles.scss';
import { AccountDropdown, Fallback } from 'components/common';
import { AccountType } from 'constants/enum';
import { HelpSVG } from 'assets/svg';
import { IState } from 'redux/global-reducers';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { formatNumber, handleError } from 'utils/common';
import { prefixAccount } from '../../utils';
import { withErrorBoundary } from 'react-error-boundary';

export interface ISendingAccountProps
  extends React.ClassAttributes<SendingAccountComponent>,
    WithNamespaces {
  readonly selectedAccount: IState['selectedAccount'];
  readonly userInfo: IState['userInfo'];
  readonly transferAmount?: number;
  readonly isVSD?: boolean;
  readonly isWithdrawVSD?: boolean;
  readonly isTransferToBank?: boolean;
  readonly accountList: IState['accountList'];
}

class SendingAccountComponent extends React.Component<ISendingAccountProps> {
  constructor(props: ISendingAccountProps) {
    super(props);
  }

  render() {
    const { t } = this.props;
    return (
      <div className={style.SendingAccount}>
        <div className={style.SendingAccountTitle}>
          <p>{t('Sending Account')}</p>
        </div>
        <div className={style.SendingAccountContent}>
          <div className={style.SendingAccountLeft}>
            <div>
              <p>{t('Transfer Type')}</p>
              <p>
                {t(
                  this.props.isVSD
                    ? 'VSD'
                    : this.props.isTransferToBank
                    ? 'Transfer cash to bank account'
                    : 'Transfer cash to internal sub account'
                )}
              </p>
              <span className={style.SendingAccountSVG}>
                <HelpSVG width={17} />
              </span>
            </div>
            <div>
              <p>{t('Account number')}</p>
              <div className={style.SendingAccountDropdown}>
                {this.props.isVSD ? (
                  this.props.isWithdrawVSD ? (
                    <p>{prefixAccount() + this.props.userInfo?.username}</p>
                  ) : (
                    <p>{this.props.selectedAccount?.account}</p>
                  )
                ) : (
                  <AccountDropdown
                    isForm={true}
                    unshowAccounts={this.props.accountList
                      .filter(
                        (account) =>
                          account.accountType === AccountType.EQUITY &&
                          account.isIICA
                      )
                      .map((acc) => acc.account)}
                  />
                )}
              </div>
            </div>
          </div>
          <div className={style.SendingAccountRight}>
            <div>
              <p>{t('Full name')}</p>
              <p>{this.props.selectedAccount?.accountName}</p>
            </div>
            <div>
              <p>{t('Transferable Amount')}</p>
              <p>{formatNumber(this.props.transferAmount)} VND</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: IState) => ({
  selectedAccount: state.selectedAccount,
  userInfo: state.userInfo,
  accountList: state.accountList,
});

const SendingAccount = withErrorBoundary(
  withNamespaces('common')(connect(mapStateToProps)(SendingAccountComponent)),
  Fallback,
  handleError
);

export default SendingAccount;
