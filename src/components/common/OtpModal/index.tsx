import * as React from 'react';
import * as classNames from 'classnames';
import * as styles from './styles.scss';
import { FaTimes } from 'react-icons/fa';
import { Fallback } from 'components/common';
import { IState } from 'redux/global-reducers';
import { Modal } from 'react-bootstrap';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { handleError } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';
import Otp from '../Otp';

interface IOtpModalProps
  extends React.ClassAttributes<OtpModalComponent>,
    WithNamespaces {
  readonly otp: IState['otp'];
  readonly otpToken: IState['otpToken'];
  readonly show?: boolean;
  readonly className?: string;
  readonly dialogClassName?: string;
  readonly isSubmitDisabled?: boolean;
  readonly isAfterLoginOtp?: boolean;
  readonly isHorizontalOTP?: boolean;

  readonly onHide?: () => void;
  readonly onSubmit?: (...args: any) => void;
  readonly horizontal?: boolean;
  readonly size?: 'sm' | 'lg' | 'xl';
}

interface IOtpModalState {
  readonly isSubmitClicked?: boolean;
}

class OtpModalComponent extends React.Component<
  IOtpModalProps,
  IOtpModalState
> {
  constructor(props: IOtpModalProps) {
    super(props);

    this.state = {};
  }

  componentDidUpdate(prevProps: IOtpModalProps) {
    if (
      this.props.otp !== prevProps.otp &&
      this.props.otp.otpToken.status.isSucceeded &&
      this.props.otp.otpToken.data?.token != null &&
      this.state.isSubmitClicked
    ) {
      this.setState({ isSubmitClicked: false }, () => {
        this.props.onSubmit?.();
      });
    }
  }

  render() {
    const {
      t,
      className,
      dialogClassName,
      isSubmitDisabled,
      children,
      onHide,
    } = this.props;
    return (
      <Modal
        className={styles.OtpModal}
        dialogClassName={classNames(styles.OtpModalDialog, dialogClassName)}
        show={this.props.show}
        onHide={onHide}
        centered={true}
        size={this.props.size || 'sm'}
      >
        <div className={styles.CloseButton} onClick={onHide}>
          <FaTimes size={10} />
        </div>
        <Modal.Body
          className={classNames(
            styles.ModalBody,
            {
              [styles.HideContent]: children != null,
              [styles.Horizontal]: this.props.horizontal,
            },
            className
          )}
        >
          {children}
          {this.props.otpToken ? (
            <div className={styles.ButtonSection}>
              <button
                className={styles.SubmitButton}
                type="button"
                onClick={this.props.onSubmit}
                disabled={isSubmitDisabled}
              >
                {t('Confirm')}
              </button>
              <button
                className={styles.CancelButton}
                type="button"
                onClick={onHide}
              >
                {t('Cancel')}
              </button>
            </div>
          ) : (
            <Otp
              onClose={onHide}
              hideContent={children != null}
              isSubmitDisabled={isSubmitDisabled}
              isAfterLoginOtp={this.props.isAfterLoginOtp}
              onSubmit={this.onSubmit}
              isHorizontalOTP={this.props.isHorizontalOTP}
            />
          )}
        </Modal.Body>
      </Modal>
    );
  }

  private onSubmit = (callback?: () => void) => {
    this.setState({ isSubmitClicked: true }, callback);
  };
}

const mapStateToProps = (state: IState) => ({
  otp: state.otp,
  otpToken: state.otpToken,
});

const mapDispatchToProps = {};

const OtpModal = withErrorBoundary(
  withNamespaces('common')(
    connect(mapStateToProps, mapDispatchToProps)(OtpModalComponent)
  ),
  Fallback,
  handleError
);

export default OtpModal;
