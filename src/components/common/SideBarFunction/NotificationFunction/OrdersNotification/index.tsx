import * as React from 'react';
import * as style from './style.scss';
import { FaCheck, FaExclamation, FaInfo } from 'react-icons/fa';
import { Fallback } from 'components/common';
import { NotificationStatus } from '../action';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { handleError } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';
import classNames from 'classnames';

export const orderStatusIcon = {
  [NotificationStatus.MATCHED]: <FaInfo size="8px" />,
  [NotificationStatus.PLACED]: <FaCheck size="8px" />,
  [NotificationStatus.FAILED]: <FaExclamation size="8px" />,
};

const data = [
  {
    id: 1,
    status: 'MATCHED',
    title: 'Order Match',
    content:
      'Order Buy 553 just has 20 NT2 matched with price 22 850 at 09:32:07',
    time: '28/12/2020',
  },
  {
    id: 2,
    status: 'PLACED',
    title: 'Order',
    content: 'Place order successfully',
    time: '28/12/2020',
  },
  {
    id: 3,
    status: 'FAILED',
    title: 'Order Match',
    content: 'Trading value cannot be grater than buying power',
    time: '28/12/2020',
  },
];

export interface IOrderNotificationProps
  extends React.ClassAttributes<OrderNotificationComponent>,
    WithNamespaces {
  readonly clearAllNotifications: boolean;
}

// export interface IOrderNotificationState {}

class OrderNotificationComponent extends React.Component<
  IOrderNotificationProps
> {
  constructor(props: IOrderNotificationProps) {
    super(props);
  }

  render() {
    const listOrderNotification = data.map((order) => (
      <div className={style.OrderNotification} key={order.id}>
        <div className={style.OrderInfo}>
          <div
            className={classNames(style.NotificationIcon, {
              [style.Matched]: order.status === NotificationStatus.MATCHED,
              [style.Failed]: order.status === NotificationStatus.FAILED,
              [style.Placed]: order.status === NotificationStatus.PLACED,
            })}
          >
            {orderStatusIcon[order.status]}
          </div>
          <p className={style.OrderNotiTitle}>{order.title}</p>{' '}
          <p className={style.OrderNotiTime}>{order.time}</p>
        </div>
        <p className={style.OrderNotiContent}>{order.content}</p>
      </div>
    ));
    return (
      <div className={style.ListOrderNotification}>
        {!this.props.clearAllNotifications && listOrderNotification}
      </div>
    );
  }
}

const OrderNotification = withErrorBoundary(
  withNamespaces('common')(OrderNotificationComponent),
  Fallback,
  handleError
);

export default OrderNotification;
