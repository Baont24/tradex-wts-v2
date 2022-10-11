import * as React from 'react';
import * as styles from './styles.scss';
import { BlockUI, Spinner } from 'components/common';
import { ErrorMessage, Field, Form } from 'formik';
import { FaAddressCard, FaLock, FaTimes, FaUser } from 'react-icons/fa';
import {
  FormGroup as Group,
  InputGroup,
  FormLabel as Label,
  FormText as Text,
} from 'react-bootstrap';
import { IFormProps } from 'interfaces/common';
import { IState } from 'redux/global-reducers';
import { Link } from 'react-router-dom';
import { RiEyeCloseLine, RiEyeLine } from 'react-icons/ri';
import { Routes } from 'constants/routes';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';

export interface IFormForgotPasswordData {
  readonly username?: string;
  readonly password?: string;
  readonly confirmPassword?: string;
  readonly isShowPassword: boolean;
  readonly isShowConfirmPassword: boolean;
  readonly idNo: string;
  readonly otp: string;
}

interface ILoginFormProps
  extends IFormProps<IFormForgotPasswordData>,
    WithNamespaces {
  readonly loginDomainInfo: IState['loginDomainInfo'];
  readonly lang: IState['lang'];
  readonly config: IState['config'];
}

const validatePassword = /^(?=.*[A-Z])[a-zA-Z\d]{8,}$/;

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
    const { t, loginDomainInfo } = this.props;
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
            {t('Forgot Password?').replace('?', '')}
          </div>
          <Group controlId="formUsername">
            {loginDomainInfo.status.isFailed &&
              loginDomainInfo.data.message && (
                <Text className="text-danger text-center mb-1">
                  {t(loginDomainInfo.data.message)}
                </Text>
              )}
            <Label>{t('Account No.')}</Label>
            <InputGroup>
              <InputGroup.Prepend>
                <InputGroup.Text>
                  <FaUser />
                </InputGroup.Text>
              </InputGroup.Prepend>
              <Field
                className="form-control"
                type="text"
                name="username"
                validate={this.validateUsername}
                onBlur={this.onBlurUsername}
              />
            </InputGroup>
            <ErrorMessage
              className="text-warning"
              name="username"
              component={'div'}
            />
          </Group>

          <Group controlId="formIdNo" className={styles.InputPassword}>
            <Label>{t('ID_PASSPORT_NO')}</Label>
            <InputGroup>
              <InputGroup.Prepend>
                <InputGroup.Text>
                  <FaAddressCard />
                </InputGroup.Text>
              </InputGroup.Prepend>
              <Field
                className="form-control"
                type="text"
                name="idNo"
                validate={this.validateDateOfBirth}
              />
            </InputGroup>
            <ErrorMessage
              className="text-warning"
              name="idNo"
              component={'div'}
            />
          </Group>

          <Group controlId="formPassword" className={styles.InputPassword}>
            <Label>{t('New Password')}</Label>
            <InputGroup>
              <InputGroup.Prepend>
                <InputGroup.Text>
                  <FaLock />
                </InputGroup.Text>
              </InputGroup.Prepend>
              <Field
                className="form-control"
                type={this.props.values.isShowPassword ? 'text' : 'password'}
                name="password"
                validate={this.validateNewPassword}
              />

              <InputGroup.Append>
                <button onClick={this.onShowHidePasswordClick} type={'button'}>
                  {!this.props.values.isShowPassword ? (
                    <RiEyeCloseLine size={16} />
                  ) : (
                    <RiEyeLine size={16} />
                  )}
                </button>
              </InputGroup.Append>
            </InputGroup>
            <ErrorMessage
              className="text-warning"
              name="password"
              component={'div'}
            />
          </Group>

          <Group
            controlId="formConfirmPassword"
            className={styles.InputPassword}
          >
            <Label>{t('Confirm New Password')}</Label>
            <InputGroup>
              <InputGroup.Prepend>
                <InputGroup.Text>
                  <FaLock />
                </InputGroup.Text>
              </InputGroup.Prepend>
              <Field
                className="form-control"
                type={
                  this.props.values.isShowConfirmPassword ? 'text' : 'password'
                }
                name="confirmPassword"
                validate={this.validateConfirmNewPassword}
              />

              <InputGroup.Append>
                <button
                  onClick={this.onShowHideConfirmPasswordClick}
                  type={'button'}
                >
                  {!this.props.values.isShowConfirmPassword ? (
                    <RiEyeCloseLine size={16} />
                  ) : (
                    <RiEyeLine size={16} />
                  )}
                </button>
              </InputGroup.Append>
            </InputGroup>
            <ErrorMessage
              className="text-warning"
              name="confirmPassword"
              component={'div'}
            />
          </Group>

          <button className={styles.SubmitButton} type="submit">
            {t('Confirm')}
          </button>
        </Form>
      </BlockUI>
    );
  }

  private onShowHidePasswordClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    this.props.setFieldValue(
      'isShowPassword',
      !this.props.values.isShowPassword
    );
  };
  private onShowHideConfirmPasswordClick = (
    e: React.MouseEvent<HTMLElement>
  ) => {
    e.stopPropagation();
    this.props.setFieldValue(
      'isShowConfirmPassword',
      !this.props.values.isShowConfirmPassword
    );
  };

  private onBlurUsername = () => {
    const { values } = this.props;
    if (values.username && values.username !== values.username.toUpperCase()) {
      this.props.setFieldValue('username', values.username.toUpperCase());
    }
  };

  private validateDateOfBirth = (value: string) => {
    let error;

    if (!value || value === '2022-02-02') {
      error = this.props.t('Required');
    }
    return error;
  };

  private validateConfirmNewPassword = (value: string) => {
    const { values } = this.props;
    let error;
    if (value) {
      if (value !== values.password) {
        error = this.props.t('Password does not match');
      }
    } else {
      error = this.props.t('Required');
    }
    return error;
  };

  private validateNewPassword = (value: string) => {
    let error = '';
    if (value) {
      if (!validatePassword.test(value)) {
        error = this.props.t(
          'New password must be larger than 8 characters without whitespace and include 1 uppercase character.'
        );
      }
    } else {
      error = this.props.t('Required');
    }
    return error;
  };

  private validateUsername = (value: string) => {
    return this.validateRequired(value);
  };

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
  otp: state.otp,
});

const ForgotPasswordForm = withNamespaces(['common'], { wait: true })(
  connect(mapStateToProps, {})(ForgotPasswordFormView)
);

export default ForgotPasswordForm;
