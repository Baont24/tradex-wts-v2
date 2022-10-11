import * as React from 'react';
import * as style from './style.scss';
import { Fallback } from 'components/common';
import { IState } from 'redux/global-reducers';
import { Link } from 'react-router-dom';
import { ListOfSteps } from '../Common/helper';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { handleError } from 'utils/common';
import { registerEkyc, sendEkycOTP, verifyEkycOTP } from '../action';
import { withErrorBoundary } from 'react-error-boundary';
import EkycLoading from '../Components/Loading';
import OtpInput from 'react-otp-input';

export interface IStep5Props
  extends React.ClassAttributes<Step5Component>,
    WithNamespaces {
  readonly ekycParams: IState['ekycParams'];
  readonly ekycOTP: IState['ekycOTP'];
  readonly ekycOTPResult: IState['ekycOTPResult'];
  readonly ekycRegisterResult: IState['ekycRegisterResult'];
  readonly allowToNextStep: (step: string) => void;
  readonly sendEkycOTP: typeof sendEkycOTP;
  readonly registerEkyc: typeof registerEkyc;
  readonly verifyEkycOTP: typeof verifyEkycOTP;
}

export interface IStep5State {
  readonly otp: string;
  readonly minutesTimer: number;
  readonly isWaiting: boolean;
  readonly isDone: boolean;
}

class Step5Component extends React.Component<IStep5Props, IStep5State> {
  private localTimer: NodeJS.Timeout;

  constructor(props: IStep5Props) {
    super(props);
    this.state = {
      otp: '',
      minutesTimer: 60,
      isWaiting: false,
      isDone: false,
    };
  }

  componentDidMount() {
    this.sendOTP();
    this.props.allowToNextStep(ListOfSteps.OTP);
  }

  componentDidUpdate(preProps: IStep5Props) {
    if (
      preProps.ekycOTPResult !== this.props.ekycOTPResult &&
      this.props.ekycOTPResult
    ) {
      this.registerEkyc();
    }
    if (
      preProps.ekycRegisterResult !== this.props.ekycRegisterResult &&
      this.props.ekycRegisterResult &&
      this.props.ekycRegisterResult.status
    ) {
      this.setState({ isDone: true });
    }
  }

  render() {
    const { t, ekycRegisterResult } = this.props;
    let showLoading = false;
    if (ekycRegisterResult) {
      showLoading = ekycRegisterResult.loading;
    }
    const done = (
      <div className={style.Done}>
        <svg
          width="73"
          height="72"
          viewBox="0 0 73 72"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="3.5" y="3" width="66" height="66" rx="33" fill="#27AE60" />
          <path
            d="M20.5 34.629L32.1364 45.6004L52.5 26.4004"
            stroke="white"
            strokeWidth="4"
          />
          <rect
            x="3.5"
            y="3"
            width="66"
            height="66"
            rx="33"
            stroke="white"
            strokeWidth="6"
          />
          <rect
            x="3.5"
            y="3"
            width="66"
            height="66"
            rx="33"
            stroke="#37BE70"
            strokeWidth="6"
          />
        </svg>
        <p>
          {t(
            'Please check your email to complete the account opening request and receiving instructions on completing the securities account opening contract'
          )}
        </p>

        <Link to="/" onClick={this.onFinish}>
          {t('FINISH')}
        </Link>
      </div>
    );
    const OTP = (
      <>
        <p className={style.Title}>{t('OTP Authentication')}</p>
        <p>
          {t('PLEASE_TYPING_OTP_TO_YOUR_PHONE', {
            phone: this.transformNumber(
              this.props.ekycParams.phoneNo as string
            ),
          })}
        </p>
        <OtpInput
          isInputNum={true}
          value={this.state.otp}
          onChange={this.handleChange}
          numInputs={6}
          inputStyle={style.OtpInput}
        />
        <p className={style.ResendText}>
          {t('Do not receive OTP?')}
          <span onClick={this.resendOTPTimer} className={style.Resend}>
            {t('Resend OTP')}
          </span>
          {this.state.isWaiting && (
            <span
              className={style.Timer}
            >{`(${this.state.minutesTimer})`}</span>
          )}
        </p>
      </>
    );
    return (
      <div className={style.Step5}>
        {showLoading ? (
          <EkycLoading
            title={'EKYC_REGISTERING'}
            failed={
              ekycRegisterResult
                ? !ekycRegisterResult.loading && !ekycRegisterResult.status
                : false
            }
            tryAgain={this.registerEkyc}
          />
        ) : this.state.isDone ? (
          done
        ) : (
          OTP
        )}
      </div>
    );
  }

  private handleChange = (otp: string) => {
    this.setState({ otp }, () => {
      if (this.props.ekycOTP && this.state.otp.length === 6) {
        this.props.verifyEkycOTP({
          otpId: this.props.ekycOTP.otpId,
          otpValue: this.state.otp,
        });
      }
    });
  };

  private transformNumber = (item: string) => {
    const length = item.length;
    let numberToShow = 3;
    if (length < numberToShow) {
      numberToShow = length;
    }
    return '*'.repeat(length - numberToShow) + item.slice(-3);
  };

  private sendOTP = () => {
    console.log('sendOTP  click');
    this.props.sendEkycOTP({
      idType: 'PHONE_NO',
      txType: 'E_KYC',
      id: this.props.ekycParams.phoneNo,
    });
    this.setState({ isWaiting: true });
    this.setState({ minutesTimer: 60 });
    this.startTimer();
  };

  private resendOTPTimer = () => {
    if (!this.state.isWaiting) {
      this.sendOTP();
    }
  };

  private startTimer = () => {
    this.localTimer = setInterval(() => {
      if (this.state.minutesTimer === 0) {
        clearInterval(this.localTimer);
        this.setState({ isWaiting: false });
      } else {
        this.setState({ minutesTimer: this.state.minutesTimer - 1 });
      }
    }, 1000);
  };

  private registerEkyc = () => {
    let params = this.props.ekycParams;
    if (params.backImageUrl === undefined) {
      params = { ...params, backImageUrl: '' };
    }
    this.props.registerEkyc(params);
  };

  private onFinish = () => {
    // this.props..push('/');
  };
}

const mapStateToProps = (state: IState) => ({
  ekycParams: state.ekycParams,
  ekycOTP: state.ekycOTP,
  ekycOTPResult: state.ekycOTPResult,
  ekycRegisterResult: state.ekycRegisterResult,
});

const Step5 = withErrorBoundary(
  withNamespaces('common')(
    connect(mapStateToProps, { sendEkycOTP, verifyEkycOTP, registerEkyc })(
      Step5Component
    )
  ),
  Fallback,
  handleError
);

export default Step5;
