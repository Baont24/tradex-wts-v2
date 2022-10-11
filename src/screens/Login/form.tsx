import * as React from 'react';
import * as styles from './styles.scss';
import {
  BlockUI,
  CaptchaGenerator,
  Dropdown,
  Spinner,
} from 'components/common';
import { ErrorMessage, Field, Form } from 'formik';
import { FaLock, FaSyncAlt, FaTimes, FaUser } from 'react-icons/fa';
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
import { SessionTimeout } from 'constants/enum';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { setKey } from 'utils/localStorage';

const SessionTimeOutDropdown = [
  { title: '8 hrs', value: SessionTimeout.EIGHT_HRS },
  { title: '3 hrs', value: SessionTimeout.THREE_HRS },
  { title: '60 mins', value: SessionTimeout.SIX_MINS },
  { title: '30 mins', value: SessionTimeout.THREE_MINS },
];

export interface IFormLoginData {
  readonly username?: string;
  readonly password?: string;
  readonly captchaCode?: string;
  readonly captcha?: string;
  readonly captchaRefreshIndex: number;
  readonly isShowPassword: boolean;
  readonly sessionTimeoutinMinute: string;
}
interface ILoginFormProps extends IFormProps<IFormLoginData>, WithNamespaces {
  readonly loginDomainInfo: IState['loginDomainInfo'];
  readonly lang: IState['lang'];
  readonly config: IState['config'];
}

class LoginFormView extends React.Component<ILoginFormProps> {
  componentDidUpdate(prevProps: ILoginFormProps) {
    if (prevProps.lang !== this.props.lang) {
      this.props.setFieldValue(
        'username',
        this.getDefaultUsername(this.props.lang)
      );
    }
  }

  render() {
    const { t, loginDomainInfo, lang, config } = this.props;
    return (
      <BlockUI
        className={styles.LoginFormContainer}
        blocking={loginDomainInfo.status.isLoading}
        loader={<Spinner size={50} logo={false} />}
      >
        <Form className={styles.LoginForm}>
          <Link className={styles.CloseButton} to={`/${Routes.BOARD}`}>
            <FaTimes size={10} />
          </Link>
          <div className={styles.Title}>{t('Login')}</div>
          <Group controlId="formEmail">
            {loginDomainInfo.status.isFailed &&
              loginDomainInfo.data.message && (
                <Text className="text-danger text-center mb-1">
                  {t(loginDomainInfo.data.message)}
                </Text>
              )}
            <Label>{t('Username')}</Label>
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

          <Group controlId="formPassword" className={styles.InputPassword}>
            <Label>{t('Password')}</Label>
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
                validate={this.validateRequired}
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
          <div className={styles.SessionTimout}>
            <p>{t('Session Timeout 2')}</p>
            <Dropdown
              isHover={true}
              isForm={true}
              data={SessionTimeOutDropdown}
              onSelect={this.onSelectSessionTimeout}
              activeItem={this.props.values.sessionTimeoutinMinute}
            />
          </div>
          <Group controlId="formCaptcha" className={styles.InputOTP}>
            <Label>{t('Security Code')}</Label>
            <InputGroup>
              <Field
                className="form-control"
                type="text"
                name="captcha"
                required={true}
                validate={this.validateCaptcha}
              />
              <div className={styles.CaptchaGenerator}>
                <CaptchaGenerator
                  setNewCaptCha={this.setCaptchaCode}
                  length={4}
                  background={'none'}
                  toggleRefresh={this.props.values.captchaRefreshIndex}
                  textColor={'white'}
                  height={23}
                  width={80}
                  fontSize={20}
                  paddingLeft={20}
                  paddingTop={15}
                  possible={'0123456789'}
                />
              </div>
              <button
                className={styles.RefreshCaptcha}
                onClick={this.refreshCaptCha}
                type={'button'}
              >
                <FaSyncAlt size={15} />
              </button>
            </InputGroup>
            <ErrorMessage
              className="text-warning"
              name="captcha"
              component={'div'}
            />
          </Group>
          <div className={styles.Function}>
            <a
              href={
                config.companyInfo[config.domain]?.hyperlink?.forgotPassword[
                  lang
                ] || 'forgot-password'
              }
              target="_blank"
              rel="noreferrer"
            >{`${t('Forgot Password?')}`}</a>
          </div>
          <div className={styles.Function}>
            {`${t(`Don't have an Account?`)} `}
            <a href={`/ekyc`} target="_blank" rel="noreferrer">{`${t(
              'Open Account?'
            )}`}</a>
          </div>
          <button className={styles.SubmitButton} type="submit">
            {t('Login')}
          </button>
        </Form>
      </BlockUI>
    );
  }

  private onSelectSessionTimeout = (title: string, value: string) => {
    this.props.setFieldValue('sessionTimeoutinMinute', value);
    setKey<string>('Session_Timeout_In_Minute', value);
  };

  private onShowHidePasswordClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    this.props.setFieldValue(
      'isShowPassword',
      !this.props.values.isShowPassword
    );
  };

  private setCaptchaCode = (value: string) => {
    this.props.setFieldValue('captchaCode', value);
  };

  private onBlurUsername = () => {
    const { values } = this.props;
    if (values.username && values.username !== values.username.toUpperCase()) {
      this.props.setFieldValue('username', values.username.toUpperCase());
    }
  };

  private refreshCaptCha = () => {
    this.props.setFieldValue(
      'captchaRefreshIndex',
      this.props.values.captchaRefreshIndex + 1
    );
  };

  private validateUsername = (value: string) => {
    return this.validateRequired(value);
  };

  private validateCaptcha = (value: string) => {
    let error = this.validateRequired(value);
    if (error != null) {
      return error;
    }
    if (value !== this.props.values.captchaCode) {
      error = this.props.t("Doesn't Match");
    }
    return error;
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
});

const LoginForm = withNamespaces(['common'], { wait: true })(
  connect(mapStateToProps, {})(LoginFormView)
);

export default LoginForm;
