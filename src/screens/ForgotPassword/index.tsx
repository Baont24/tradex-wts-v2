import * as React from 'react';
import * as styles from './styles.scss';
import { Fallback, LanguageSwitcher, Layout } from 'components/common';
import { Formik } from 'formik';
import { IState } from 'redux/global-reducers';
import { Link } from 'react-router-dom';
import { LoginBackgroundPNG } from 'assets/images';
import { RouteComponentProps, withRouter } from 'react-router';
import { Routes } from 'constants/routes';
import { STORED_USERNAME } from 'constants/main';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { getCrossKey } from 'utils/localStorage';
import { handleError } from 'utils/common';
import { resetPassword, verifyIdentity } from './action';
import { withErrorBoundary } from 'react-error-boundary';
import ForgotPasswordForm, { IFormForgotPasswordData } from './form';
import SendOTP from './formOTP';

export interface IForgotPasswordProps
  extends React.ClassAttributes<ForgotPasswordComponent>,
    WithNamespaces,
    RouteComponentProps {
  readonly verifyIdentity: typeof verifyIdentity;
  readonly resetPassword: typeof resetPassword;
  readonly lang: IState['lang'];
  readonly config: IState['config'];
  readonly OTP: IState['resetPassword'];
}

export interface IForgotPasswordStates extends IFormForgotPasswordData {
  readonly isShowOTP: boolean;
}

class ForgotPasswordComponent extends React.Component<
  IForgotPasswordProps,
  IForgotPasswordStates
> {
  constructor(props: IForgotPasswordProps) {
    super(props);
    this.state = {
      username: this.getDefaultUsername(),
      password: '',
      confirmPassword: '',
      idNo: '',
      isShowPassword: false,
      isShowConfirmPassword: false,
      otp: '',
      isShowOTP: false,
    };
  }

  componentDidMount() {
    getCrossKey(STORED_USERNAME)
      .then((username: string) =>
        this.setState({
          username,
        })
      )
      .catch(console.error);
  }

  componentDidUpdate(prevProps: IForgotPasswordProps) {
    if (
      (prevProps.OTP.status.errorMessage !==
        this.props.OTP.status.errorMessage &&
        this.props.OTP.status.errorMessage === 'RESET_PASSWORD_SUCCESS') ||
      this.props.OTP.status.errorMessage === 'ACCOUNT_IS_BLOCKED'
    ) {
      this.props.history.push(`/${Routes.LOGIN}`);
      this.setState({
        isShowOTP: false,
      });
    }

    if (
      this.props.OTP.status.isSucceeded !== prevProps.OTP.status.isSucceeded &&
      this.props.OTP.status.isSucceeded
    ) {
      this.setState({
        isShowOTP: true,
      });
    }
  }

  render() {
    const Logo = './injectable/logo.svg';

    return (
      <Layout route={Routes.LOGIN}>
        <div className={styles.ForgotPassword}>
          <div className={styles.Logo}>
            <Link to={`/${Routes.BOARD}`}>
              <img src={Logo} />
            </Link>
          </div>
          <div className={styles.Languages}>
            <LanguageSwitcher isPopover={false} />
          </div>
          <Formik
            initialValues={this.state}
            onSubmit={this.onSubmit}
            render={(props) =>
              this.state.isShowOTP ? (
                <SendOTP resendOTP={() => this.resendOTP(props)} {...props} />
              ) : (
                <ForgotPasswordForm {...props} />
              )
            }
          />

          <div className={styles.LoginBackground}>
            <img src={LoginBackgroundPNG} />
          </div>
        </div>
      </Layout>
    );
  }

  private onSubmit = (values: IFormForgotPasswordData) => {
    if (values.username && values.password && values.idNo) {
      let username = values.username.toUpperCase();
      if (username.startsWith(this.props.config.usernamePrefix.ignoreChar)) {
        username = username.replace(
          this.props.config.usernamePrefix.ignoreChar,
          ''
        );
      }

      this.state.isShowOTP
        ? this.props.resetPassword({
            clientID: username,
            otpValue: values.otp,
            newPassword: values.password,
          })
        : this.props.verifyIdentity({
            clientID: username,
            idCardNo: values.idNo,
            isResendOTP: false,
          });
    }
  };

  private resendOTP = (props: any) => {
    if (props.values.username && props.values.password && props.values.idNo) {
      let username = props.values.username.toUpperCase();
      if (username.startsWith(this.props.config.usernamePrefix.ignoreChar)) {
        username = username.replace(
          this.props.config.usernamePrefix.ignoreChar,
          ''
        );
      }
      this.props.verifyIdentity({
        clientID: username,
        idCardNo: props.values.idNo,
        isResendOTP: true,
      });
    }
  };

  private getDefaultUsername = (lang?: string) => {
    let value = null;
    if (this.props.config.usernamePrefix.filterBy === 'lang') {
      value = this.props.config.usernamePrefix.mapValues[
        lang ?? this.props.lang
      ];
      if (value == null) {
        value = this.props.config.usernamePrefix.mapValues[''];
      }
    }
    return value ?? '';
  };
}

const mapStateToProps = (state: IState) => ({
  lang: state.lang,
  config: state.config,
  OTP: state.resetPassword,
});

const mapDispatchToProps = {
  verifyIdentity,
  resetPassword,
};

const ForgotPassword = withRouter(
  withErrorBoundary(
    withNamespaces(['common'], { wait: true })(
      connect(mapStateToProps, mapDispatchToProps)(ForgotPasswordComponent)
    ),
    Fallback,
    handleError
  )
);

export default ForgotPassword;
