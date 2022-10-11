import * as React from 'react';
import * as style from './style.scss';
import { Fallback, TabTable } from 'components/common';
import { ITabTableData } from 'interfaces/common';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { handleError } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';
import OrderNotification from './OrdersNotification';

export interface INotificationFunctionProps
  extends React.ClassAttributes<NotificationFunctionComponent>,
    WithNamespaces {}

export interface INotificationFunctionState {
  readonly clearAllNotifications: boolean;
}

class NotificationFunctionComponent extends React.Component<
  INotificationFunctionProps,
  INotificationFunctionState
> {
  constructor(props: INotificationFunctionProps) {
    super(props);
    this.state = {
      clearAllNotifications: false,
    };
  }

  render() {
    const { t } = this.props;
    const orderNotification: ITabTableData[] = [
      {
        key: 'orders',
        title: this.props.t('Orders'),
        default: true,
        component: (
          <OrderNotification
            clearAllNotifications={this.state.clearAllNotifications}
          />
        ),
      },
      {
        key: 'others',
        title: this.props.t('Others'),
        default: true,
        component: (
          <OrderNotification
            clearAllNotifications={this.state.clearAllNotifications}
          />
        ),
      },
    ];
    return (
      <div className={style.NotificationFunction}>
        <TabTable data={orderNotification} />
        <div className={style.NotificationFunctionFooter}>
          <p onClick={this.clearAll}>{t('Clear All Notification')}</p>
        </div>
      </div>
    );
  }

  private clearAll = () => {
    this.setState({ clearAllNotifications: true });
  };
}

const NotificationFunction = withErrorBoundary(
  withNamespaces('common')(NotificationFunctionComponent),
  Fallback,
  handleError
);

export default NotificationFunction;
