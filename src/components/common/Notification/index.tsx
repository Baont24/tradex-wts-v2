import * as React from 'react';
import * as styles from './styles.scss';
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaExclamationTriangle,
  FaInfoCircle,
} from 'react-icons/fa';
import { ToastType, TypeOptions } from 'react-toastify';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { handleError } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';
import Fallback from '../Fallback';

interface INotificationProps
  extends React.ClassAttributes<Notification>,
    WithNamespaces {
  readonly title: string;
  readonly content: string | React.ReactNode;
  readonly time?: string;
  readonly toastType: TypeOptions;
}

class Notification extends React.Component<INotificationProps> {
  constructor(props: INotificationProps) {
    super(props);
  }

  render() {
    const { t, toastType } = this.props;

    const logo =
      toastType === ToastType.SUCCESS ? (
        <FaCheckCircle size={12} className={styles.LogoSuccess} />
      ) : toastType === ToastType.INFO ? (
        <FaInfoCircle size={12} className={styles.LogoInfo} />
      ) : toastType === ToastType.WARNING ? (
        <FaExclamationTriangle size={12} className={styles.LogoWarning} />
      ) : toastType === ToastType.ERROR ? (
        <FaExclamationCircle size={12} className={styles.LogoError} />
      ) : (
        <FaExclamationTriangle size={12} className={styles.LogoDefault} />
      );
    return (
      <div className={styles.Notification}>
        <div className={styles.Title}>
          <span>{logo}</span>
          <span>{t(this.props.title)}</span>
        </div>
        {typeof this.props.content === 'string' ? (
          <p>{this.props.content}</p>
        ) : (
          this.props.content
        )}
        <p>{this.props.time}</p>
      </div>
    );
  }
}

export default withErrorBoundary(
  withNamespaces('common')(Notification),
  Fallback,
  handleError
);
