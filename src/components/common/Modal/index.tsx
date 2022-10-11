import * as React from 'react';
import * as classNames from 'classnames';
import * as styles from './styles.scss';
import { FaTimes } from 'react-icons/fa';
import { Fallback } from 'components/common';
import { Modal as ReactBootstrapModal } from 'react-bootstrap';
import { handleError } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';

interface IModalProps extends React.ClassAttributes<ModalComponent> {
  readonly show?: boolean;
  readonly size?: 'sm' | 'lg' | 'xl';
  readonly isBackgroundBlur?: boolean;
  readonly className?: string;
  readonly dialogClassName?: string;

  readonly onHide?: () => void;
}

class ModalComponent extends React.Component<IModalProps> {
  constructor(props: IModalProps) {
    super(props);
  }

  render() {
    return (
      <ReactBootstrapModal
        className={classNames(
          styles.Modal,
          { [styles.Blur]: this.props.isBackgroundBlur },
          this.props.className
        )}
        dialogClassName={classNames(
          styles.ModalDialog,
          this.props.dialogClassName
        )}
        show={this.props.show}
        onHide={this.props.onHide}
        centered={true}
        size={this.props.size}
      >
        <div className={styles.CloseButton} onClick={this.props.onHide}>
          <FaTimes size={10} />
        </div>
        <ReactBootstrapModal.Body className={styles.ModalBody}>
          {this.props.children}
        </ReactBootstrapModal.Body>
      </ReactBootstrapModal>
    );
  }
}

const Modal = withErrorBoundary(ModalComponent, Fallback, handleError);

export default Modal;
