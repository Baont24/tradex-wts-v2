import * as React from 'react';
import * as globalStyles from 'styles/style.scss';
import * as style from './styles.scss';
import { Button } from 'react-bootstrap';
import { Dropdown, Fallback, NumericInput, OtpModal } from 'components/common';
import { IEquityBankInfoResponse } from 'interfaces/api';
import { IState } from 'redux/global-reducers';
import { SystemType } from 'constants/enum';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { domainConfig } from 'config/domain';
import { formatNumber, handleError } from 'utils/common';
import { prefixAccount } from '../../utils';
import { showNotification } from '../../action';
import { withErrorBoundary } from 'react-error-boundary';
import CommonError from '../CommonError';
import OtpOnceModal from '../OtpOnceModal';
import config from 'config';

export interface IDropdownData {
  readonly title: string;
  readonly value: string;
}

export interface IBeneficiaryProps
  extends React.ClassAttributes<BeneficiaryComponent>,
    WithNamespaces {
  readonly selectedAccount: IState['selectedAccount'];
  readonly userInfo: IState['userInfo'];
  readonly otp: IState['otp'];
  readonly otpToken: IState['otpToken'];
  readonly globalBankInfo: IState['bankInfo'];
  readonly equityBankInfo: IState['equityBankInfo'];
  readonly equityCashTransferResult: IState['equityCashTransferResult'];
  readonly derivativeInternalCashTransferResult: IState['derivativeInternalCashTransferResult'];
  readonly derivativeBankCashTransferResult: IState['derivativeBankCashTransferResult'];
  readonly VSDCashTransferResult: IState['VSDCashTransferResult'];
  readonly transferAmount: number;
  readonly transferableAmount?: number;
  readonly content: string;
  readonly isTransferToBank?: boolean;
  readonly accountData?: IDropdownData[] | [];
  readonly modalTitle: string;
  readonly isVSD?: boolean;
  readonly isWithdrawVSD?: boolean;
  readonly bankInfo?: IEquityBankInfoResponse;
  readonly onChangeContent: (content: string) => void;
  readonly onChangeTransferAmount: (amount: number) => void;
  readonly onConfirm: (otpToken?: string) => void;
  readonly onChangeBeneficiaryAccount: (account: string) => void;
  readonly onReset: () => void;
  readonly showNotification: typeof showNotification;
  readonly onChangeBankName?: (bankName: string) => void;
  readonly onChangeBranchName?: (branchId: string, branchName: string) => void;
}

interface IBeneficiaryState {
  readonly isShowModal: boolean;
  readonly beneficiaryAccount?: string;
  readonly transferAmount: number;
  readonly bankName: string;
  readonly branchName: string;
  readonly isShowError: boolean;
}
class BeneficiaryComponent extends React.Component<
  IBeneficiaryProps,
  IBeneficiaryState
> {
  private localBankInfo: IDropdownData[] | [] = [];
  private localBranchList: IDropdownData[] | [] | undefined = [];
  constructor(props: IBeneficiaryProps) {
    super(props);
    this.state = {
      isShowModal: false,
      beneficiaryAccount: '',
      transferAmount: 0,
      bankName: '',
      branchName: '',
      isShowError: false,
    };
  }

  componentDidMount() {
    if (this.props.isVSD) {
      if (this.props.isWithdrawVSD) {
        this.props.onChangeBeneficiaryAccount(
          this.props.selectedAccount?.account as string
        );
        this.setState({
          beneficiaryAccount: this.props.selectedAccount?.account,
        });
      }
      this.props.onChangeBeneficiaryAccount(
        prefixAccount() + this.props.userInfo?.username
      );
      this.setState({
        beneficiaryAccount: this.props.userInfo?.username,
      });
    }
    this.localBankInfo = this.props.globalBankInfo.map((bankInfo) => ({
      title: bankInfo.name,
      value: bankInfo.id,
    }));
  }

  shouldComponentUpdate(
    nextProps: IBeneficiaryProps,
    nextState: IBeneficiaryState
  ) {
    if (this.props.accountData !== nextProps.accountData) {
      this.setState({
        beneficiaryAccount: nextProps.accountData?.[0]?.title,
      });
      if (nextProps.accountData?.[0]?.title) {
        this.props.onChangeBeneficiaryAccount(
          nextProps.accountData?.[0]?.title
        );
      }
    }
    if (this.state.bankName !== nextState.bankName) {
      this.localBranchList = this.props.globalBankInfo
        .find((bankInfo) => bankInfo.name === nextState.bankName)
        ?.branch.map((branch) => {
          this.setState({
            branchName: branch.branchName,
          });
          return {
            title: branch.branchName,
            value: branch.branchCode,
          };
        });
    }
    if (nextProps.globalBankInfo !== this.props.globalBankInfo) {
      this.localBankInfo = nextProps.globalBankInfo.map((bankInfo) => ({
        title: bankInfo.name,
        value: bankInfo.id,
      }));
    }
    return true;
  }

  componentDidUpdate(prevProps: IBeneficiaryProps) {
    if (
      this.props.bankInfo?.bankName &&
      this.props.bankInfo?.bankName !== prevProps.bankInfo?.bankName
    ) {
      this.setState({
        beneficiaryAccount: this.props.bankInfo?.bankId,
        bankName: this.props.bankInfo?.bankName,
        branchName: this.props.bankInfo?.bankBranchName || '',
        transferAmount: 0,
      });
    }
    if (
      (this.props.bankInfo !== prevProps.bankInfo && !this.props.bankInfo) ||
      this.props.selectedAccount !== prevProps.selectedAccount
    ) {
      this.setState({
        beneficiaryAccount: '',
        bankName: '',
        branchName: '',
        transferAmount: 0,
      });
    }

    if (
      (this.props.derivativeInternalCashTransferResult !==
        prevProps.derivativeInternalCashTransferResult &&
        this.props.derivativeInternalCashTransferResult.data) ||
      (this.props.equityCashTransferResult !==
        prevProps.equityCashTransferResult &&
        this.props.equityCashTransferResult.data) ||
      (this.props.VSDCashTransferResult !== prevProps.VSDCashTransferResult &&
        this.props.VSDCashTransferResult.data) ||
      (this.props.VSDCashTransferResult !== prevProps.VSDCashTransferResult &&
        this.props.VSDCashTransferResult.data) ||
      (prevProps.otpToken === null &&
        prevProps.otpToken !== this.props.otpToken)
    ) {
      this.onHideModal();
    }
  }

  render() {
    const { t } = this.props;
    const contentTransferInternal = `${t('CONTENT_INTERNAL')} ${
      this.props.selectedAccount?.account
    } ${t('to ')} ${this.state.beneficiaryAccount}`;
    const contentTransferToBank = `${t('CONTENT_BANK')} ${
      this.props.selectedAccount?.account
    } ${this.props.selectedAccount?.accountName}`;
    const contentDepositVSD = `${t('CONTENT_DEPOSIT')} ${
      this.props.selectedAccount?.account
    } ${this.props.selectedAccount?.accountName}`;
    const contentWithdrawVSD = `${t('CONTENT_WITHDRAW')} ${
      prefixAccount() + this.props.userInfo?.username
    } ${this.props.selectedAccount?.accountName}`;
    return (
      <>
        <div className={style.Benificiary}>
          <div className={style.BenificiaryTitle}>
            <p>{t('Beneficiary')}</p>
          </div>
          <div className={style.BenificiaryContent}>
            {/* Left Side */}
            <div className={style.BenificiaryLeft}>
              <div>
                <p>{t('Account number')}</p>
                <div>
                  <div className={style.BenificiaryDropdown}>
                    {this.props.isVSD ? (
                      this.props.isWithdrawVSD ? (
                        <p>{this.props.selectedAccount?.account}</p>
                      ) : (
                        <p>{prefixAccount() + this.props.userInfo?.username}</p>
                      )
                    ) : (
                      <>
                        <Dropdown
                          isForm={true}
                          onSelect={this.onChangeAccount}
                          data={this.props.accountData}
                          placeholder={this.state.beneficiaryAccount}
                          // editable={this.props.isTransferToBank}
                          isResetInput={
                            !this.state.beneficiaryAccount ||
                            Boolean(this.props.bankInfo)
                          }
                          tabMode={true}
                        />
                      </>
                    )}
                  </div>
                  <CommonError
                    error={
                      this.state.isShowError &&
                      !this.state.beneficiaryAccount &&
                      !this.props.isVSD
                    }
                    errorMessage={t('Required')}
                  />
                </div>
              </div>
              <div>
                <p>{t('Full name')}</p>
                <p>{this.props.selectedAccount?.accountName}</p>
              </div>
            </div>
            {/* Right Side */}
            <div className={style.BenificiaryRight}>
              {this.props.isTransferToBank && (
                <div className={style.BenificiaryBank}>
                  <div>
                    <p className={style.BenificiaryBankName}>{t('Bank')}</p>
                    <div title={this.props.bankInfo?.bankName}>
                      <Dropdown
                        disabled={this.props.bankInfo ? true : false}
                        data={this.localBankInfo}
                        onSelect={this.onSelectBankName}
                        placeholder={
                          this.props.bankInfo?.bankName || this.state.bankName
                        }
                        activeItem={this.state.bankName}
                        isForm={true}
                        tabMode={true}
                      />
                      <CommonError
                        error={
                          this.state.isShowError && this.state.bankName === ''
                        }
                        errorMessage={t('Required')}
                      />
                    </div>
                  </div>
                  <div>
                    <p className={style.BenificiaryBranch}>{t('Branch')}</p>
                    <div title={this.props.bankInfo?.bankBranchName}>
                      <Dropdown
                        disabled={
                          this.props.bankInfo?.bankBranchName ? true : false
                        }
                        data={this.localBranchList}
                        onSelect={this.onSelectBranchName}
                        placeholder={
                          this.props.bankInfo?.bankBranchName ||
                          this.state.branchName
                        }
                        activeItem={this.state.branchName}
                        isForm={true}
                        tabMode={true}
                      />
                      <CommonError
                        error={
                          this.state.isShowError &&
                          this.state.branchName === '' &&
                          this.props.selectedAccount?.type !==
                            SystemType.DERIVATIVES
                        }
                        errorMessage={t('Required')}
                      />
                    </div>
                  </div>
                </div>
              )}
              <div>
                <p>{t('Transfer Amount')}</p>
                <div className={style.BenificiaryInput}>
                  <NumericInput
                    onNumberChange={this.onChangeTransferAmount}
                    value={this.state.transferAmount}
                    error={
                      this.state.isShowError &&
                      (Number(this.state.transferAmount) < 1 ||
                        Number(this.props.transferableAmount) < 1 ||
                        Number(this.state.transferAmount) >
                          Number(this.props.transferableAmount))
                    }
                    errorMessage={
                      Number(this.state.transferAmount) < 1
                        ? t('INVALID_TRANSFER_AMOUNT')
                        : t('Exceeding Transferable Amount')
                    }
                  />
                </div>
              </div>
              {this.props.isVSD !== undefined ||
              this.props.isTransferToBank !== undefined ? (
                <>
                  <div>
                    <p>{t('Transfer fee')}</p>
                    {this.props.isVSD ? (
                      <p className={style.BenificiaryTransferFee}>5,500 VND</p>
                    ) : (
                      <p className={style.BenificiaryTransferFee}>Out</p>
                    )}
                  </div>
                  <div>
                    <p className={style.BenificiaryNote}>
                      {this.props.isVSD
                        ? t(`${domainConfig[config.domain]?.noteForVSD}`)
                        : t(
                            "Note: Fee paid by transferer and the remittance fee which is subjected to the Bank's prevailing fee schedule"
                          )}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p>{t('Transfer fee')}</p>
                    <p className={style.BenificiaryTransferFee}>0 VND</p>
                  </div>
                </>
              )}
              <div>
                <p>{t('Content')}</p>
                <div className={style.BenificiaryInput}>
                  <div>
                    {this.props.isVSD
                      ? this.props.isWithdrawVSD
                        ? this.onChangeContent(contentWithdrawVSD)
                        : this.onChangeContent(contentDepositVSD)
                      : this.props.isTransferToBank
                      ? this.onChangeContent(contentTransferToBank)
                      : this.onChangeContent(contentTransferInternal)}
                  </div>
                </div>
              </div>
              <div className={style.BenificiaryButton}>
                <Button
                  bsPrefix={globalStyles.QueryButton}
                  type="submit"
                  onClick={this.onShowModal}
                >
                  {t('Confirm')}
                </Button>
                <Button
                  bsPrefix={globalStyles.DarkButton}
                  type="reset"
                  onClick={this.onReset}
                >
                  {t('Reset')}
                </Button>
              </div>
            </div>
          </div>
        </div>
        {this.props.isTransferToBank ? (
          <OtpOnceModal
            show={this.state.isShowModal}
            onHide={this.onHideModal}
            onSubmit={this.onConfirmTransfer}
          >
            <div className={style.CashTransferModal}>
              <p className={style.CashTransferModalTitle}>
                {t(this.props.modalTitle)}
              </p>
              <div>
                <p>{t('Sender Acc.No')}</p>
                <p>{this.props.selectedAccount?.account}</p>
              </div>
              <div>
                <p>{t('Full name:')}</p>
                <p>{this.props.selectedAccount?.accountName}</p>
              </div>
              <div>
                <p>{t('Beneficiary Acc.No')}</p>
                <p>{this.state.beneficiaryAccount}</p>
              </div>
              <div>
                <p>{t('Bank:')}</p>
                <p>{this.props.bankInfo?.bankName || this.state.bankName}</p>
              </div>
              <div>
                <p>{t('Branch:')}</p>
                <p>
                  {this.props.bankInfo?.bankBranchName || this.state.branchName}
                </p>
              </div>
              <div>
                <p>{t('Transfer amount:')}</p>
                <p>{formatNumber(this.state.transferAmount)}</p>
              </div>
              <div>
                <p>{t('Transfer fee:')}</p>
                <p>{this.props.isVSD ? formatNumber(5500) : 0}</p>
              </div>
              <div>
                <p>{t('Content')}</p>
                <p>
                  {this.props.isVSD
                    ? this.props.isWithdrawVSD
                      ? contentWithdrawVSD
                      : contentDepositVSD
                    : contentTransferToBank}
                </p>
              </div>
            </div>
          </OtpOnceModal>
        ) : (
          <OtpModal
            show={this.state.isShowModal}
            onHide={this.onHideModal}
            onSubmit={this.onConfirmTransfer}
          >
            <div className={style.CashTransferModal}>
              <p className={style.CashTransferModalTitle}>
                {t(this.props.modalTitle)}
              </p>
              <div>
                <p>{t('Sender Acc.No')}</p>
                <p>{prefixAccount() + this.props.userInfo?.username}</p>
              </div>
              <div>
                <p>{t('Full name:')}</p>
                <p>{this.props.selectedAccount?.accountName}</p>
              </div>
              <div>
                <p>{t('Beneficiary Acc.No')}</p>
                <p>
                  {this.props.isVSD
                    ? this.props.isWithdrawVSD
                      ? this.props.selectedAccount?.account
                      : `${prefixAccount() + this.props.userInfo?.username}`
                    : this.state.beneficiaryAccount}
                </p>
              </div>
              <div>
                <p>{t('Transfer amount:')}</p>
                <p>{formatNumber(this.state.transferAmount)}</p>
              </div>
              <div>
                <p>{t('Transfer fee:')}</p>
                <p>{this.props.isVSD ? formatNumber(5500) : 0}</p>
              </div>
              <div>
                <p>{t('Content')}</p>
                <p>
                  {this.props.isVSD
                    ? this.props.isWithdrawVSD
                      ? contentWithdrawVSD
                      : contentDepositVSD
                    : contentTransferInternal}
                </p>
              </div>
            </div>
          </OtpModal>
        )}
      </>
    );
  }

  private onChangeContent = (content: string) => {
    this.props.onChangeContent(content);
    return content;
  };

  private onChangeAccount = (title: string, value: string) => {
    const beneficiaryAccount = this.props.equityBankInfo.data?.find(
      (val) => val.bankId === title && val.bankName === value
    );
    this.setState({
      beneficiaryAccount: title,
      branchName: beneficiaryAccount?.bankBranchName ?? '',
      bankName: beneficiaryAccount?.bankName ?? '',
    });
    this.props.onChangeBeneficiaryAccount(title);
  };

  private onSelectBankName = (title: string, value: string) => {
    this.setState({ bankName: title, branchName: '' });
    this.props.onChangeBankName?.(title);
  };

  private onSelectBranchName = (title: string, value: string) => {
    this.setState({ branchName: title });
    this.props.onChangeBranchName?.(value, title);
  };

  private onShowModal = () => {
    this.setState({ isShowError: true });
    if (
      !this.props.isVSD &&
      (this.state.beneficiaryAccount === '' ||
        !this.state.beneficiaryAccount ||
        (this.props.isTransferToBank &&
          (this.state.bankName === '' ||
            (this.state.branchName === '' &&
              this.props.selectedAccount?.type !== SystemType.DERIVATIVES))))
    ) {
      return;
    }
    if (
      this.props.transferableAmount &&
      this.state.transferAmount <= this.props.transferableAmount &&
      this.state.transferAmount > 0
    ) {
      this.setState({
        isShowModal: true,
      });
    }
  };

  private onConfirmTransfer = (otpToken?: string) => {
    this.props.onConfirm(otpToken);
    this.onReset();
  };

  private onChangeTransferAmount = (value: number) => {
    this.setState({ transferAmount: value });
    this.props.onChangeTransferAmount(value);
  };

  private onHideModal = () => {
    this.setState({ isShowModal: false });
  };

  private onReset = () => {
    this.props.onReset();
    !this.props.isTransferToBank &&
      !this.props.isVSD &&
      this.props.onChangeBeneficiaryAccount(
        this.state.beneficiaryAccount || ''
      );
    this.setState({
      transferAmount: 0,
      beneficiaryAccount: this.props.bankInfo
        ? this.props.bankInfo.bankId
        : this.state.beneficiaryAccount,
      branchName: this.props.bankInfo?.bankBranchName
        ? this.props.bankInfo?.bankBranchName
        : '',
      bankName: this.props.bankInfo ? this.props.bankInfo.bankName : '',
      isShowError: false,
    });
  };
}

const mapStateToProps = (state: IState) => ({
  selectedAccount: state.selectedAccount,
  userInfo: state.userInfo,
  otp: state.otp,
  otpToken: state.otpToken,
  globalBankInfo: state.bankInfo,
  equityBankInfo: state.equityBankInfo,
  equityCashTransferResult: state.equityCashTransferResult,
  derivativeBankCashTransferResult: state.derivativeBankCashTransferResult,
  VSDCashTransferResult: state.VSDCashTransferResult,
  derivativeInternalCashTransferResult:
    state.derivativeInternalCashTransferResult,
});

const mapDispatchToProps = { showNotification };

const Beneficiary = withErrorBoundary(
  withNamespaces('common')(
    connect(mapStateToProps, mapDispatchToProps)(BeneficiaryComponent)
  ),
  Fallback,
  handleError
);

export default Beneficiary;
