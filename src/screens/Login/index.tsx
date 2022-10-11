import * as React from 'react';
import * as styles from './styles.scss';
import { Email, PhoneCall } from 'assets/svg';
import { Fallback, LanguageSwitcher, Layout } from 'components/common';
import { Formik } from 'formik';
import { IState } from 'redux/global-reducers';
import { Link } from 'react-router-dom';
import { LoginBackgroundPNG } from 'assets/images';
import { RouteComponentProps, withRouter } from 'react-router';
import { Routes } from 'constants/routes';
import { STORED_USERNAME } from 'constants/main';
import { SessionTimeout } from 'constants/enum';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { getCrossKey, getKey } from 'utils/localStorage';
import { handleError } from 'utils/common';
import { loginDomain } from 'redux/global-actions';
import { withErrorBoundary } from 'react-error-boundary';
import LoginForm, { IFormLoginData } from './form';

export interface ILoginProps
  extends React.ClassAttributes<LoginComponent>,
    WithNamespaces,
    RouteComponentProps {
  readonly loginDomainInfo: IState['loginDomainInfo'];
  readonly lang: IState['lang'];
  readonly config: IState['config'];

  readonly loginDomain: typeof loginDomain;
}

class LoginComponent extends React.Component<ILoginProps, IFormLoginData> {
  constructor(props: ILoginProps) {
    super(props);
    this.state = {
      username: this.getDefaultUsername(),
      password: '',
      sessionTimeoutinMinute:
        getKey<string>('Session_Timeout_In_Minute') ?? SessionTimeout.EIGHT_HRS,
      captcha: '',
      captchaCode: '',
      captchaRefreshIndex: 0,
      isShowPassword: false,
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

  render() {
    const { t, lang, config } = this.props;
    const Logo = './injectable/logo.svg';
    return (
      <Layout route={Routes.LOGIN}>
        <div className={styles.Login}>
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
            onSubmit={this.onLogin}
            component={LoginForm}
          />
          <div className={styles.BottomMenu}>
            <div className={styles.Menu}>
              <div className={styles.MenuItem}>
                <a
                  href={
                    config.companyInfo[config.domain]?.hyperlink?.userGuide?.[
                      lang
                    ] || '#'
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  {t('Users Guide')}
                </a>
              </div>
              <div className={styles.MenuItem}>
                <a
                  href={
                    config.companyInfo[config.domain]?.hyperlink?.support?.[
                      lang
                    ] || '#'
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  {t('Support')}
                </a>
              </div>
              <div className={styles.MenuItem}>
                <a
                  href={
                    config.companyInfo[config.domain]?.hyperlink
                      ?.privacyPolicy?.[lang] || '#'
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  {t('Privacy Policy')}
                </a>
              </div>
              <div className={styles.MenuItem}>
                <a
                  href={
                    config.companyInfo[config.domain]?.hyperlink?.termsOfUse?.[
                      lang
                    ] || '#'
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  {t('Terms of Use 1')}
                </a>
              </div>
            </div>
            {(config.companyInfo[config.domain].email != null ||
              config.companyInfo[config.domain].phone != null) && (
              <div className={styles.Contact}>
                <div className={styles.ContactItem}>
                  <span>{t('Contact')}:</span>
                </div>
                {config.companyInfo[config.domain].phone != null && (
                  <div
                    className={`${styles.ContactItem} ${styles.PhoneNumber}`}
                  >
                    <PhoneCall />
                    <p>{t('Hot Line')}:</p>
                    <a
                      href={`tel: ${config.companyInfo[config.domain]?.phone}`}
                      className={`${styles.MarginLeft}`}
                    >
                      {config.companyInfo[config.domain]?.phone}
                    </a>
                  </div>
                )}
                {config.companyInfo[config.domain].email != null && (
                  <div className={styles.ContactItem}>
                    <Email />
                    <p>{t('Email')}:</p>
                    <a
                      className={styles.MarginLeft}
                      href={`mailto: ${
                        config.companyInfo[config.domain]?.email
                      }`}
                    >
                      {config.companyInfo[config.domain]?.email}
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className={styles.LoginBackground}>
            <img src={LoginBackgroundPNG} />
          </div>
        </div>
      </Layout>
    );
  }

  private onLogin = (values: IFormLoginData) => {
    if (
      values.username &&
      values.password &&
      !this.props.loginDomainInfo.status.isLoading
    ) {
      let username = values.username.toUpperCase();
      if (username.startsWith(this.props.config.usernamePrefix.ignoreChar)) {
        username = username.replace(
          this.props.config.usernamePrefix.ignoreChar,
          ''
        );
      }
      this.props.loginDomain({
        username,
        password: values.password,
        lang: this.props.lang,
        session_time_in_minute: Number(values.sessionTimeoutinMinute),
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
  loginDomainInfo: state.loginDomainInfo,
  lang: state.lang,
  config: state.config,
});

const mapDispatchToProps = {
  loginDomain,
};

const Login = withRouter(
  withErrorBoundary(
    withNamespaces(['common'], { wait: true })(
      connect(mapStateToProps, mapDispatchToProps)(LoginComponent)
    ),
    Fallback,
    handleError
  )
);

export default Login;
