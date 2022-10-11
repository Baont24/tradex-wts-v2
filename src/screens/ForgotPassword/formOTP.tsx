import * as React from 'react';
import * as styles from './styles.scss';
import { BlockUI, Spinner } from 'components/common';
import { ErrorMessage, Field, Form } from 'formik';
import { FaTimes } from 'react-icons/fa';
import {
  FormGroup as Group,
  InputGroup,
  FormLabel as Label,
} from 'react-bootstrap';
import { IFormProps } from 'interfaces/common';
import { IState } from 'redux/global-reducers';
import { Link } from 'react-router-dom';
import { Routes } from 'constants/routes';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';

export interface IFormLoginData {
  readonly username?: string;
  readonly password?: string;
  readonly isShowPassword: boolean;
}

interface ILoginFormProps extends IFormProps<IFormLoginData>, WithNamespaces {
  readonly loginDomainInfo: IState['loginDomainInfo'];
  readonly lang: IState['lang'];
  readonly config: IState['config'];
  readonly OTP: IState['resetPassword'];
  readonly resendOTP: () => void;
}

class ForgotPasswordFormView extends React.Component<ILoginFormProps> {
  componentDidUpdate(prevProps: ILoginFormProps) {
    if (prevProps.lang !== this.props.lang) {
      this.props.setFieldValue(
        'username',
        this.getDefaultUsername(this.props.lang)
      );
    }
  }

  render() {
    const { t, loginDomainInfo, OTP } = this.props;
    console.log({ OTP });

    return (
      <BlockUI
        className={styles.ForgotPasswordFormContainer}
        blocking={loginDomainInfo.status.isLoading}
        loader={<Spinner size={50} logo={false} />}
      >
        <Form className={styles.ForgotPasswordForm}>
          <Link className={styles.CloseButton} to={`/${Routes.BOARD}`}>
            <FaTimes size={10} />
          </Link>
          <div className={styles.Title}>
            {t('Please enter OTP code to reset password')}
          </div>

          <Group controlId="formOtp" className={styles.InputOTP}>
            <Label>{t('OTP')}</Label>
            <InputGroup>
              <InputGroup.Prepend>
                <InputGroup.Text>
                  {this.props?.OTP?.data?.matrixKey}
                </InputGroup.Text>
              </InputGroup.Prepend>
              <Field
                className="form-control"
                type="text"
                name="otp"
                required={true}
                validate={this.validateRequired}
              />
            </InputGroup>
            <ErrorMessage
              className="text-warning"
              name="otp"
              component={'div'}
            />
          </Group>

          <button
            className={styles.SendOTPButton}
            type={'button'}
            onClick={this.props.resendOTP}
            disabled={OTP?.data?.isCountDown}
          >
            {t(OTP?.data?.isCountDown ? 'Resend OTP' : 'Send OTP')}
          </button>

          <span className={styles.OtpMessage}>
            {OTP.data?.countDownMessage}
          </span>

          <div className={styles.BottomButton}>
            <button className={styles.SubmitButton} type="submit">
              {t('Confirm')}
            </button>
            <Link className={styles.CancelButton} to={`/${Routes.LOGIN}`}>
              {t('Cancel')}
            </Link>
          </div>
        </Form>
      </BlockUI>
    );
  }

  private validateRequired = (value: string) => {
    let error;
    if (!value || value.trim() === '') {
      error = this.props.t('Required');
    }
    return error;
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
  loginDomainInfo: state.loginDomainInfo,
  lang: state.lang,
  config: state.config,
  OTP: state.resetPassword,
  OTPResend: state.otp,
});

const SendOTP = withNamespaces(['common'], { wait: true })(
  connect(mapStateToProps, {})(ForgotPasswordFormView)
);

export default SendOTP;
