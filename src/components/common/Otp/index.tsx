import * as React from 'react';
import * as styles from './styles.scss';
import { Fallback } from 'components/common';
import { Formik } from 'formik';
import { IFormProps, TMutable } from 'interfaces/common';
import { IState } from 'redux/global-reducers';
import { OtpCodeEnum } from 'constants/enum';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { closeOtpModal, verifyOtp } from 'redux/global-actions';
import { connect } from 'react-redux';
import { handleError } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';
import OtpForm, { IFormData } from './form';

interface IOtpProps extends React.ClassAttributes<OtpView>, WithNamespaces {
  readonly otp: IState['otp'];
  readonly hideContent?: boolean;
  readonly isSubmitDisabled?: boolean;
  readonly isAfterLoginOtp?: boolean;
  readonly isHorizontalOTP?: boolean;

  readonly onClose?: () => void;
  readonly onSubmit: (callback?: () => void) => void;
  readonly verifyOtp: typeof verifyOtp;
  readonly closeOtpModal: typeof closeOtpModal;
}

class OtpView extends React.Component<IOtpProps, IFormData> {
  constructor(props: IOtpProps) {
    super(props);
    this.state = {
      isRemember: true,
      otpValue: '',
      rememberExpiryTime: 8,
      picked: 'sms',
    };
  }

  render() {
    const { otp } = this.props;
    return otp.otpToken.data?.token &&
      otp.otpToken.status.isSucceeded ? null : (
      <div className={styles.Otp}>
        <Formik
          initialValues={this.state}
          onSubmit={this.onSubmit}
          validate={this.onValidate}
        >
          {(props) => (
            <OtpForm
              {...props}
              hideContent={this.props.hideContent}
              isSubmitDisabled={this.props.isSubmitDisabled}
              onClose={this.props.onClose || this.props.closeOtpModal}
              isHorizontalOTP={this.props.isHorizontalOTP}
            />
          )}
        </Formik>
      </div>
    );
  }

  private onValidate = (
    values: IFormData
  ): TMutable<IFormProps<IFormData>['errors']> => {
    if (this.props.otp.type.data === OtpCodeEnum.MATRIX) {
      return {
        ...(this.validateRequired(values.otpMatrixFirst) && {
          otpMatrixFirst: this.validateRequired(values.otpMatrixFirst),
        }),
        ...(this.validateRequired(values.otpMatrixSecond) &&
          this.props.otp.otpMatrix.data?.otpMatrixNumbers?.length === 2 && {
            otpMatrixSecond: this.validateRequired(values.otpMatrixSecond),
          }),
      };
    } else {
      return {
        ...(this.validateRequired(values.otpValue) && {
          otpValue: this.validateRequired(values.otpValue),
        }),
      };
    }
  };

  private onSubmit = (values: IFormData) => {
    if (this.props.isSubmitDisabled) {
      return;
    }
    this.props.onSubmit(() => {
      if (this.props.otp.type.data === OtpCodeEnum.MATRIX) {
        this.props.verifyOtp({
          wordMatrixId: this.props.otp.otpMatrix.data?.otpMatrixKey,
          expireTime: values.isRemember ? values.rememberExpiryTime : undefined,
          wordMatrixValue01: values.otpMatrixFirst,
          wordMatrixValue02: values.otpMatrixSecond,
          verifyType: this.props.otp.type.data,
          isValid: this.props.isAfterLoginOtp,
        });
      } else {
        this.props.verifyOtp({
          expireTime: values.isRemember ? values.rememberExpiryTime : undefined,
          otp: values.otpValue,
          verifyType: this.props.otp.type.data ?? '',
          isValid: this.props.isAfterLoginOtp,
        });
      }
    });
  };

  private validateRequired = (value?: string) => {
    let error;
    if (value == null || value.trim() === '') {
      error = this.props.t('Required');
    }
    return error;
  };
}

const mapStateToProps = (state: IState) => ({
  otp: state.otp,
});

const mapDispatchToProps = {
  verifyOtp,
  closeOtpModal,
};

const Otp = withErrorBoundary(
  withNamespaces('common')(
    connect(mapStateToProps, mapDispatchToProps)(OtpView)
  ),
  Fallback,
  handleError
);

export default Otp;
