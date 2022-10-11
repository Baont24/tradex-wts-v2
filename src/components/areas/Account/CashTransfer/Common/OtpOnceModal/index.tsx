import * as React from 'react';
import * as classNames from 'classnames';
import * as styles from './styles.scss';
import { Fallback, Modal } from 'components/common';
import { Formik } from 'formik';
import { IFormProps, IResponse } from 'interfaces/common';
import { IOtpMatrix, IOtpToken } from 'interfaces/reducers';
import {
  IQueryOtpMatrixForKisResponse,
  IVerifyOtpRequest,
} from 'interfaces/api';
import { IQueryOtpMatrixResponse } from 'interfaces/responses/IQueryOtpMatrixResponse';
import { IQueryOtpTypeResponse } from 'interfaces/responses/IQueryOtpTypeResponse';
import { IState } from 'redux/global-reducers';
import { IVerifyOtpResponse } from 'interfaces/responses/IVerifyOtpResponse';
import { MatrixOtpType, OtpCodeEnum } from 'constants/enum';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { domainConfig } from 'config/domain';
import { handleError } from 'utils/common';
import { query, requester } from 'utils/socketApi';
import { sentOtp } from 'redux/global-actions';
import { withErrorBoundary } from 'react-error-boundary';
import OtpOnceForm, { IOtpOnceFormData } from './form';
import config from 'config';

interface IOtpOnceModalProps
  extends React.ClassAttributes<OtpOnceModalComponent>,
    WithNamespaces {
  readonly config: IState['config'];
  readonly show?: boolean;

  readonly onHide?: () => void;
  readonly onSubmit?: (otpToken?: string) => void;
  readonly sentOtp: typeof sentOtp;
}

interface IOtpOnceModalState {
  readonly initialValues: IOtpOnceFormData;
  readonly otpType?: OtpCodeEnum;
  readonly otpMatrix: IOtpMatrix;
  readonly otpToken: IOtpToken;
  readonly errorMessage?: string;
  readonly isLoading?: boolean;
  readonly errorOtp?: boolean;
}

class OtpOnceModalComponent extends React.Component<
  IOtpOnceModalProps,
  IOtpOnceModalState
> {
  constructor(props: IOtpOnceModalProps) {
    super(props);

    this.state = {
      otpMatrix: {
        otpMatrixKey: 200,
        otpMatrixNumbers: [],
      },
      otpToken: {
        token: '',
        expiryTime: 0,
      },
      initialValues: {
        isRemember: true,
        otpValue: '',
        rememberExpiryTime: 8,
      },
      isLoading: true,
    };
  }

  render() {
    return (
      <Modal
        className={styles.OtpOnceModal}
        dialogClassName={classNames(styles.OtpOnceModalDialog)}
        show={this.props.show}
        onHide={this.props.onHide}
        size={'sm'}
      >
        {this.props.children}
        <div className={styles.OtpOnce}>
          <Formik
            initialValues={this.state.initialValues}
            onSubmit={this.onSubmit}
            validate={this.onValidate}
          >
            {(props) => (
              <OtpOnceForm
                {...props}
                initOtpForm={this.initOtpForm}
                otpType={this.state.otpType}
                otpMatrix={this.state.otpMatrix}
                errorMessage={this.state.errorMessage}
                isLoading={this.state.isLoading}
                hideContent={true}
                onClose={this.props.onHide}
                sentOtpOnce={this.sentOtpOnce}
              />
            )}
          </Formik>
        </div>
      </Modal>
    );
  }

  private sentOtpOnce = async () => {
    await this.initOtpForm();

    this.props.sentOtp({
      matrixId: this.state.otpMatrix.otpMatrixKey,
      isOtpOneModal: true,
    });
  };

  private onSubmit = async (values: IOtpOnceFormData) => {
    this.setState({ isLoading: true });
    try {
      const { otpType, otpMatrix } = this.state;
      if (otpType == null) {
        throw new Error('No OTP type');
      }

      let params: IVerifyOtpRequest;
      if (otpType === OtpCodeEnum.MATRIX) {
        if (
          domainConfig[config.domain]?.matrixOtpType ===
          MatrixOtpType.SINGLE_KEY
        ) {
          params = {
            wordMatrixValue: values.otpMatrixFirst,
            verifyType: 'MATRIX_CARD',
            wordMatrixId: otpMatrix.otpMatrixKey,
            expireTime: 0.5,
          };
        } else {
          params = {
            wordMatrixValue01: values.otpMatrixFirst,
            wordMatrixValue02: values.otpMatrixSecond,
            verifyType: otpType,
            wordMatrixId: otpMatrix.otpMatrixKey,
            expireTime: 0.5,
          };
        }
      } else {
        params = {
          otp: values.otpValue,
          verifyType: otpType,
          expireTime: 0.5,
        };
      }
      const response: IResponse<IVerifyOtpResponse> = await requester(
        this.props.config.apis.verifyOtpMatrix,
        params
      );
      this.setState({ isLoading: false }, () => {
        this.props.onSubmit?.(response.data.otpToken);
        this.props.onHide?.();
      });
    } catch (error) {
      console.error('Submit Otp Once', error);
      this.setState({
        isLoading: false,
        errorMessage: error.code || error.message,
      });
    }
  };

  private onValidate = (
    values: IOtpOnceFormData
  ): IFormProps<IOtpOnceFormData>['errors'] => {
    if (this.state.otpType === OtpCodeEnum.MATRIX) {
      return {
        ...(this.validateRequired(values.otpMatrixFirst) && {
          otpMatrixFirst: this.validateRequired(values.otpMatrixFirst),
        }),
        ...(this.validateRequired(values.otpMatrixSecond) &&
          this.state.otpMatrix.otpMatrixNumbers?.length === 2 && {
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

  private validateRequired = (value?: string) => {
    let error;
    if (value == null || value.trim() === '') {
      error = this.props.t('Required');
    }
    return error;
  };

  private initOtpForm = async () => {
    try {
      const { config } = this.props;
      const responseOtpType: IResponse<IQueryOtpTypeResponse> = await query(
        config.apis.queryOtpType,
        {}
      );
      const otpType = responseOtpType.data.authCode as OtpCodeEnum;
      let otpMatrix = this.state.otpMatrix;
      if (responseOtpType.data.authCode === OtpCodeEnum.MATRIX) {
        if (
          domainConfig[config.domain]?.matrixOtpType ===
          MatrixOtpType.SINGLE_KEY
        ) {
          const responseMatrixForKis: IResponse<IQueryOtpMatrixForKisResponse> = await query(
            config.apis.queryOtpMatrixforKis,
            {}
          );
          otpMatrix = {
            otpMatrixKey: responseMatrixForKis.data.wordMatrixId,
            otpMatrixNumbers: [responseMatrixForKis.data.wordMatrixKey],
          };
        } else {
          const responseMatrix: IResponse<IQueryOtpMatrixResponse> = await query(
            config.apis.queryOtpMatrix,
            {}
          );
          otpMatrix = {
            otpMatrixKey: responseMatrix.data.id,
            otpMatrixNumbers: [
              responseMatrix.data.matrixKey1,
              responseMatrix.data.matrixKey2,
            ],
          };
        }
      }

      this.setState({
        otpType,
        otpMatrix,
        isLoading: false,
        errorMessage: undefined,
        errorOtp: false,
      });
    } catch (error) {
      console.error('Otp once', error);
      this.setState({
        isLoading: false,
        errorMessage: error.code || error.message,
        errorOtp: true,
      });
    }
  };
}

const mapStateToProps = (state: IState) => ({
  config: state.config,
});

const mapDispatchToProps = { sentOtp };

const OtpOnceModal = withErrorBoundary(
  withNamespaces('common')(
    connect(mapStateToProps, mapDispatchToProps)(OtpOnceModalComponent)
  ),
  Fallback,
  handleError
);

export default OtpOnceModal;
