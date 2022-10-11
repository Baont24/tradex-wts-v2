import * as React from 'react';
import * as classNames from 'classnames';
import * as styles from './styles.scss';
import { BlockUI, Fallback, Spinner } from 'components/common';
import { Field, Form } from 'formik';
import {
  FormGroup as Group,
  InputGroup,
  FormLabel as Label,
  FormText as Text,
} from 'react-bootstrap';
import { IFormProps } from 'interfaces/common';
import { IOtpMatrix } from 'interfaces/reducers';
import { IState } from 'redux/global-reducers';
import { MdRefresh } from 'react-icons/md';
import { OtpCodeEnum } from 'constants/enum';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { handleError } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';

export interface IOtpOnceFormData {
  readonly otpValue?: string;
  readonly otpMatrixFirst?: string;
  readonly otpMatrixSecond?: string;
  readonly isRemember?: boolean;
  readonly rememberExpiryTime?: number;
}

interface IOtpOnceProps extends IFormProps<IOtpOnceFormData>, WithNamespaces {
  readonly hideContent?: boolean;
  readonly isSubmitDisabled?: boolean;
  readonly otpType?: OtpCodeEnum;
  readonly otpMatrix?: IOtpMatrix;
  readonly errorMessage?: string;
  readonly isLoading?: boolean;
  readonly errorOtp?: boolean;
  readonly config?: IState['config'];
  readonly otpSending: IState['otpSending'];

  readonly onClose?: () => void;
  readonly initOtpForm: () => void;
  readonly sentOtpOnce: () => void;
}

class OtpOnceFormComponent extends React.Component<IOtpOnceProps> {
  componentDidMount() {
    this.props.initOtpForm();
  }

  render() {
    const {
      t,
      errors,
      otpType,
      otpMatrix,
      errorMessage,
      isLoading,
      errorOtp,
      otpSending,
    } = this.props;
    if (otpType == null) {
      if (errorOtp != null) {
        return (
          <div className={styles.ErrorForm}>
            {t('Fail to load OTP information')}
            <button onClick={this.props.initOtpForm}>
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

    return (
      <BlockUI
        className={styles.OtpOnceFormContainer}
        blocking={isLoading}
        loader={<Spinner size={50} logo={false} />}
      >
        <Form
          className={classNames(
            styles.OtpOnceForm,
            this.props.hideContent && styles.HideContent
          )}
        >
          <div className={styles.FormSection}>
            {!this.props.hideContent && (
              <div className={styles.Title}>
                {t(
                  otpType === OtpCodeEnum.MATRIX
                    ? 'Please enter OTP code to confirm'
                    : 'Please enter matrix number to confirm'
                )}
              </div>
            )}
            {errorMessage != null && (
              <Text className="text-danger text-center mb-4">
                {t(errorMessage)}
              </Text>
            )}
            {otpType === OtpCodeEnum.MATRIX ? (
              <Group
                controlId="formMatrix"
                className={
                  otpMatrix?.otpMatrixNumbers.length === 2
                    ? styles.MatrixInputs
                    : styles.MatrixInput
                }
              >
                <Label>{t('OTP')}</Label>
                {otpMatrix?.otpMatrixNumbers?.[0] != null && (
                  <InputGroup>
                    <InputGroup.Prepend>
                      <InputGroup.Text>
                        <Label>{otpMatrix?.otpMatrixNumbers?.[0]}</Label>
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
                {otpMatrix?.otpMatrixNumbers?.[1] != null && (
                  <InputGroup>
                    <InputGroup.Prepend>
                      <InputGroup.Text>
                        <Label>{otpMatrix?.otpMatrixNumbers?.[1]}</Label>
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

            <div className={styles.WarningMessage}>
              {`${t(otpSending.countDownMessage15s)}`}
            </div>
          </div>

          <div className={styles.ButtonSection}>
            <button
              className={styles.SentOtpButton}
              type="button"
              onClick={this.sentOtp}
              disabled={otpSending.countDownSeconds !== 0}
            >
              {otpSending.textBtn ?? 'Send OTP'}
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
    this.props.sentOtpOnce();
  };
}

const mapStateToProps = (state: IState) => ({
  otpSending: state.otpSending,
});

const mapDispatchToProps = {};

const OtpOnceForm = withErrorBoundary(
  withNamespaces('common')(
    connect(mapStateToProps, mapDispatchToProps)(OtpOnceFormComponent)
  ),
  Fallback,
  handleError
);

export default OtpOnceForm;
