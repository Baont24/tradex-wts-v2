import * as React from 'react';
import * as globalStyles from 'styles/style.scss';
import * as styles from './style.scss';
import { BlockUI, Fallback, Spinner, TabTable } from 'components/common';
import { Button, Col, FormGroup, FormLabel, Row } from 'react-bootstrap';
import { ErrorMessage, Field, Form, Formik, FormikHelpers } from 'formik';
import { IState } from 'redux/global-reducers';
import { RouteComponentProps, withRouter } from 'react-router';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { changePIN, changePassword } from './action';
import { connect } from 'react-redux';
import { handleError } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';

export interface IChangePasswordForm {
  readonly currentPassword: string;
  readonly newPassword: string;
  readonly confirmPass: string;
}

interface IAccountInformationProps
  extends React.ClassAttributes<AccountInformationComponent>,
    WithNamespaces,
    RouteComponentProps {
  readonly selectedAccount: IState['selectedAccount'];
  readonly changePasswordStatus: IState['changePasswordStatus'];
  readonly userInfo: IState['userInfo'];
  readonly changePassword: typeof changePassword;
  readonly changePIN: typeof changePIN;
}

class AccountInformationComponent extends React.Component<
  IAccountInformationProps
> {
  private localPassword: string;
  constructor(props: IAccountInformationProps) {
    super(props);

    this.state = {};
  }

  render() {
    const { t } = this.props;
    const RenderChangePassword = (
      <div className={styles.ChangePasswordForm}>
        <BlockUI
          blocking={this.props.changePasswordStatus.status?.isLoading}
          loader={<Spinner size={50} logo={false} />}
        >
          <p className={styles.ChangePasswordHint}>
            {t('It is recommended that you use a strong and secured password')}
          </p>

          <Formik
            initialValues={{
              currentPassword: '',
              newPassword: '',
              confirmPass: '',
            }}
            onSubmit={this.onSubmit}
          >
            {() => (
              <Form>
                <FormGroup as={Row} controlId="currentPassword">
                  <FormLabel column={true} sm={5}>
                    {t('Current Password')}
                  </FormLabel>
                  <Col sm={7}>
                    <Field
                      name="currentPassword"
                      type="password"
                      required={true}
                      validate={this.validateRequired}
                    />
                    <ErrorMessage
                      className="text-warning"
                      name="currentPassword"
                      component={'div'}
                    />
                  </Col>
                </FormGroup>

                <FormGroup as={Row} controlId="newPassword">
                  <FormLabel column={true} sm={5}>
                    {t('New Password')}
                  </FormLabel>
                  <Col sm={7}>
                    <Field
                      name="newPassword"
                      type="password"
                      required={true}
                      validate={this.validatePassword}
                    />
                    <ErrorMessage
                      className="text-warning"
                      name="newPassword"
                      component={'div'}
                    />
                  </Col>
                </FormGroup>

                <FormGroup as={Row} controlId="confirmPass">
                  <FormLabel column={true} sm={5}>
                    {t('Confirm New Password')}
                  </FormLabel>
                  <Col sm={7}>
                    <Field
                      name="confirmPass"
                      type="password"
                      required={true}
                      validate={this.validateConfirmPass}
                    />
                    <ErrorMessage
                      className="text-warning"
                      name="confirmPass"
                      component={'div'}
                    />
                  </Col>
                </FormGroup>

                <FormGroup as={Row}>
                  <Button bsPrefix={globalStyles.QueryButton} type="submit">
                    {t('Save Change')}
                  </Button>
                  <Button bsPrefix={globalStyles.DarkButton} type="reset">
                    {t('Reset')}
                  </Button>
                </FormGroup>
              </Form>
            )}
          </Formik>
        </BlockUI>
      </div>
    );

    // Change Pin
    const RenderChangePIN = (
      <div className={styles.ChangePasswordForm}>
        <BlockUI
          blocking={this.props.changePasswordStatus.status?.isLoading}
          loader={<Spinner size={50} logo={false} />}
        >
          <Formik
            initialValues={{
              currentPassword: '',
              newPassword: '',
              confirmPass: '',
            }}
            onSubmit={this.onSubmitChangePIN}
          >
            {() => (
              <Form>
                <FormGroup as={Row} controlId="currentPassword">
                  <FormLabel column={true} sm={5}>
                    {t('Current PIN')}
                  </FormLabel>
                  <Col sm={7}>
                    <Field
                      name="currentPassword"
                      type="password"
                      required={true}
                      validate={this.validateRequired}
                    />
                    <ErrorMessage
                      className="text-warning"
                      name="currentPassword"
                      component={'div'}
                    />
                  </Col>
                </FormGroup>

                <FormGroup as={Row} controlId="newPassword">
                  <FormLabel column={true} sm={5}>
                    {t('New PIN')}
                  </FormLabel>
                  <Col sm={7}>
                    <Field
                      name="newPassword"
                      type="password"
                      required={true}
                      validate={this.validatePassword}
                    />
                    <ErrorMessage
                      className="text-warning"
                      name="newPassword"
                      component={'div'}
                    />
                  </Col>
                </FormGroup>

                <FormGroup as={Row} controlId="confirmPass">
                  <FormLabel column={true} sm={5}>
                    {t('Confirm New PIN')}
                  </FormLabel>
                  <Col sm={7}>
                    <Field
                      name="confirmPass"
                      type="password"
                      required={true}
                      validate={this.validateConfirmPass}
                    />
                    <ErrorMessage
                      className="text-warning"
                      name="confirmPass"
                      component={'div'}
                    />
                  </Col>
                </FormGroup>

                <FormGroup as={Row}>
                  <Button bsPrefix={globalStyles.QueryButton} type="submit">
                    {t('Save Change')}
                  </Button>
                  <Button bsPrefix={globalStyles.DarkButton} type="reset">
                    {t('Reset')}
                  </Button>
                </FormGroup>
              </Form>
            )}
          </Formik>
        </BlockUI>
      </div>
    );

    return (
      <div className={styles.AccountInformation}>
        <TabTable
          data={[
            {
              key: 'change-password',
              title: 'Change Password',
              component: RenderChangePassword,
              default: true,
            },
          ]}
        />
        <TabTable
          data={[
            {
              key: 'change-password',
              title: 'Change PIN Trading via cellphone',
              component: RenderChangePIN,
              default: true,
            },
          ]}
        />
      </div>
    );
  }

  private onSubmit = (
    values: IChangePasswordForm,
    formikHelpers: FormikHelpers<IChangePasswordForm>
  ) => {
    this.props.changePassword({
      clientID: this.props.userInfo?.username,
      newPassword: values.newPassword,
      oldPassword: values.currentPassword,
    });
    formikHelpers.resetForm();
  };

  private onSubmitChangePIN = (
    values: IChangePasswordForm,
    formikHelpers: FormikHelpers<IChangePasswordForm>
  ) => {
    this.props.changePIN({
      newPassword: values.newPassword,
      currentPassword: values.currentPassword,
    });
    formikHelpers.resetForm();
  };

  private validateConfirmPass = (value: string) => {
    let error = this.validateRequired(value);
    if (value !== this.localPassword) {
      error = this.props.t('Passwords do not match');
    }
    if (error != null) {
      return error;
    }
    return error;
  };

  private validatePassword = (value: string) => {
    const error = this.validateRequired(value);
    this.localPassword = value;
    if (error != null) {
      return error;
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
}

const mapStateToProps = (state: IState) => ({
  selectedAccount: state.selectedAccount,
  changePasswordStatus: state.changePasswordStatus,
  userInfo: state.userInfo,
});

const mapDispatchToProps = { changePassword, changePIN };

const AccountInformation = withRouter(
  withErrorBoundary(
    withNamespaces('common')(
      connect(mapStateToProps, mapDispatchToProps)(AccountInformationComponent)
    ),
    Fallback,
    handleError
  )
);

export default AccountInformation;
