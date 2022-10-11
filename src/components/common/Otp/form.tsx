import * as React from 'react';
import * as styles from './styles.scss';
import { BlockUI, CheckBox, Fallback, Spinner } from 'components/common';
import { Field, Form } from 'formik';
import {
  FormGroup as Group,
  InputGroup,
  FormLabel as Label,
  FormText as Text,
} from 'react-bootstrap';
import { IFormProps } from 'interfaces/common';
import { IState } from 'redux/global-reducers';
import { MdRefresh } from 'react-icons/md';
import { OtpCodeEnum } from 'constants/enum';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { handleError } from 'utils/common';
import { initDataForOtpForm, sentOtp } from 'redux/global-actions';
import { withErrorBoundary } from 'react-error-boundary';
import Dropdown from '../Dropdown';
import classNames from 'classnames';

const EXPIRY_TIME_DROPDOWN = [
  { title: '8h', value: '8' },
  { title: '4h', value: '4' },
  { title: '2h', value: '2' },
  { title: '1h', value: '1' },
  { title: '30m', value: '0.5' },
];

export interface IFormData {
  readonly otpValue?: string;
  readonly otpMatrixFirst?: string;
  readonly otpMatrixSecond?: string;
  readonly isRemember?: boolean;
  readonly rememberExpiryTime?: number;
  readonly picked?: 'sms' | 'notification';
}

interface IOtpFormViewProps extends IFormProps<IFormData>, WithNamespaces {
  readonly otp: IState['otp'];
  readonly otpSending: IState['otpSending'];
  readonly hideContent?: boolean;
  readonly isSubmitDisabled?: boolean;
  readonly isHorizontalOTP?: boolean;

  readonly onClose?: () => void;
  readonly initDataForOtpForm: typeof initDataForOtpForm;
  readonly sentOtp: typeof sentOtp;
}

interface IOtpFormViewState {
  readonly isResendOTP: boolean;
}

class OtpFormView extends React.Component<
  IOtpFormViewProps,
  IOtpFormViewState
> {
  constructor(props: IOtpFormViewProps) {
    super(props);
    this.state = {
      isResendOTP: false,
    };
  }
  componentDidMount() {
    this.props.initDataForOtpForm();
  }

  render() {
    const { t, otp, values, errors, otpSending, isHorizontalOTP } = this.props;
    if (otp.type.data == null) {
      if (otp.type.status.isFailed) {
        return (
          <div className={styles.ErrorForm}>
            {t('Fail to load OTP information')}
            <button onClick={this.props.initDataForOtpForm}>
              <MdRefresh size={20} />
            </button>
          </div>
        );
      } else {
        return (
          <div className={styles.ErrorForm}>
            <Spinner logo={false} size={30} />
          </div>
        );
      }
    } else {
      if (otp.type.data === OtpCodeEnum.MATRIX && otp.otpMatrix.data == null) {
        if (otp.otpMatrix.status.isFailed) {
          return (
            <div className={styles.ErrorForm}>
              {t('Fail to load OTP information')}
              <button onClick={this.props.initDataForOtpForm}>
                <MdRefresh size={20} />
              </button>
            </div>
          );
        } else {
          return (
            <div className={styles.ErrorForm}>
              <Spinner logo={false} size={30} />
            </div>
          );
        }
      }
    }
    return (
      <BlockUI
        className={styles.OtpFormContainer}
        blocking={otp.otpToken.status.isLoading}
        loader={<Spinner size={50} logo={false} />}
      >
        <Form
          className={classNames(styles.OtpForm, {
            ['OtpFormOrderConfirm']: isHorizontalOTP,
          })}
        >
          <div className={styles.FormSection}>
            {!this.props.hideContent && (
              <div className={styles.Title}>
                {t(
                  otp.type.data === OtpCodeEnum.MATRIX
                    ? 'Please enter OTP code to confirm'
                    : 'Please enter matrix number to confirm'
                )}
              </div>
            )}
            {otp.otpToken.status.isFailed && otp.otpToken.status.errorMessage && (
              <Text
                className={classNames('text-danger mb-4 w-100', {
                  ['order-2 flex-fill ml-3 align-self-center']: isHorizontalOTP,
                  ['text-center']: !isHorizontalOTP,
                })}
              >
                {t(otp.otpToken.status.errorMessage)}
              </Text>
            )}
            {otp.type.data === OtpCodeEnum.MATRIX ? (
              <Group
                controlId="formMatrix"
                className={classNames({
                  [styles.MatrixInputs]:
                    otp.otpMatrix.data?.otpMatrixNumbers.length === 2,
                  [styles.MatrixInput]:
                    otp.otpMatrix.data?.otpMatrixNumbers.length !== 2,
                })}
              >
                <Label>{t('OTP')}</Label>
                {otp.otpMatrix.data?.otpMatrixNumbers?.[0] != null && (
                  <InputGroup>
                    <InputGroup.Prepend>
                      <InputGroup.Text>
                        <Label>
                          {otp.otpMatrix.data?.otpMatrixNumbers?.[0]}
                        </Label>
                      </InputGroup.Text>
                    </InputGroup.Prepend>
                    <Field
                      className="form-control"
                      type="password"
                      name="otpMatrixFirst"
                    />
                    {errors.otpMatrixFirst && (
                      <div className="text-warning mt-1 w-100">
                        {errors.otpMatrixFirst}
                      </div>
                    )}
                  </InputGroup>
                )}
                {otp.otpMatrix.data?.otpMatrixNumbers?.[1] != null && (
                  <InputGroup>
                    <InputGroup.Prepend>
                      <InputGroup.Text>
                        <Label>
                          {otp.otpMatrix.data?.otpMatrixNumbers?.[1]}
                        </Label>
                      </InputGroup.Text>
                    </InputGroup.Prepend>
                    <Field
                      className="form-control"
                      type="password"
                      name="otpMatrixSecond"
                    />
                    {errors.otpMatrixSecond && (
                      <div className="text-warning mt-1 w-100">
                        {errors.otpMatrixSecond}
                      </div>
                    )}
                  </InputGroup>
                )}
              </Group>
            ) : (
              <Group controlId="formOtp" className={styles.OtpInputs}>
                <Label>{t('OTP')}</Label>
                <InputGroup>
                  <Field className="form-control" type="text" name="otpValue" />
                  {errors.otpValue && (
                    <div className="text-warning mt-1 w-100">
                      {errors.otpValue}
                    </div>
                  )}
                </InputGroup>
              </Group>
            )}
            <Group
              controlId="formRemember"
              className={classNames(styles.InputExpiryTime, {
                ['order-3']: isHorizontalOTP,
              })}
            >
              <CheckBox
                checked={values.isRemember}
                label={
                  otp.type.data === OtpCodeEnum.MATRIX
                    ? 'Remember OTP'
                    : 'Remember Matrix'
                }
                onChange={this.onCheckBoxChange}
              />
              <Dropdown
                isForm={true}
                activeItem={values.rememberExpiryTime?.toString()}
                data={EXPIRY_TIME_DROPDOWN}
                onSelect={this.onSelectExpiryTine}
                disabled={!values.isRemember}
              />
            </Group>

            <Group
              controlId="formOptions"
              className={classNames(styles.SendOtpOptions)}
            >
              <div>
                <Field
                  type="radio"
                  name="picked"
                  value="sms"
                  checked={values.picked === 'sms'}
                  id="sms"
                />
                <label htmlFor="sms">{t('Via SMS')}</label>
              </div>
              <div>
                <Field
                  type="radio"
                  name="picked"
                  value="notification"
                  checked={values.picked === 'notification'}
                  id="notification"
                />
                <label htmlFor="notification">{t('Via notification')}</label>
              </div>
            </Group>
          </div>

          <div
            className={classNames(styles.ButtonSection, {
              ['ButtonSectionOrderConfirm order-2']: isHorizontalOTP,
            })}
          >
            <button
              className={classNames(styles.SentOtpButton, {
                ['SentOtpButtonOrderConfirm  mt-2']: isHorizontalOTP,
              })}
              type="button"
              onClick={this.sentOtp}
              disabled={otpSending.countDownSeconds !== 0}
            >
              {this.state.isResendOTP ? 'Resent OTP' : 'Send OTP'}
              <span>
                {otpSending.countDownSeconds !== 0 &&
                  ` (${otpSending.countDownSeconds})`}
              </span>
            </button>
            <div className={styles.ButtonSectionSubmitCancel}>
              <button
                className={styles.SubmitButton}
                type="submit"
                disabled={this.props.isSubmitDisabled || !this.props.isValid}
              >
                {t('Confirm')}
              </button>
              <button
                className={styles.CancelButton}
                type="button"
                onClick={this.props.onClose}
              >
                {t('Cancel')}
              </button>
            </div>
          </div>
        </Form>
      </BlockUI>
    );
  }

  private sentOtp = () => {
    this.setState({ isResendOTP: true });
    this.props.sentOtp({
      forceSMS: this.props.values.picked === 'sms',
    });
  };

  private onCheckBoxChange = (value: boolean) => {
    this.props.setFieldValue('isRemember', value);
    if (value) {
      this.props.setFieldValue('rememberExpiryTime', 8);
    } else {
      this.props.setFieldValue('rememberExpiryTime', undefined);
    }
  };

  private onSelectExpiryTine = (title: string, value: string) => {
    this.props.setFieldValue('rememberExpiryTime', +value);
  };
}

const mapStateToProps = (state: IState) => ({
  otp: state.otp,
  otpSending: state.otpSending,
});

const mapDispatchToProps = {
  initDataForOtpForm,
  sentOtp,
};
const OtpForm = withErrorBoundary(
  withNamespaces('common')(
    connect(mapStateToProps, mapDispatchToProps)(OtpFormView)
  ),
  Fallback,
  handleError
);

export default OtpForm;
