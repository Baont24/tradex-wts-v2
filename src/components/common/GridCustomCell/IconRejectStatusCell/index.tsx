import * as React from 'react';
import * as classNames from 'classnames';
import * as styles from './styles.scss';
import { FaExclamationCircle } from 'react-icons/fa';
import { ICellRendererParams } from 'ag-grid-community';
import { OrderStatusResponse, StopOrderStatus } from 'constants/enum';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import i18next from 'i18next';

interface IUserEvent extends ICellRendererParams {
  readonly screenStopOrderHistory?: boolean;
}
const IconRejectStatusCell: React.FC<IUserEvent> = (props) => {
  return (
    <div className={classNames(styles.IconRejectStatusCell, {})}>
      {props.value === OrderStatusResponse.REJECT ||
      props.value === StopOrderStatus.FAILED ? (
        <>
          <span>{i18next.t(props.value)}</span>
          <OverlayTrigger
            placement={'top'}
            overlay={
              <Tooltip id={styles.IconRejectStatusTooltip}>
                {props.data.rejectReason || props.data.errorMessage}
              </Tooltip>
            }
          >
            <FaExclamationCircle className={styles.ErrorIcon} size={15} />
          </OverlayTrigger>
        </>
      ) : (
        <span>
          {i18next.t(
            props.value === StopOrderStatus.PENDING &&
              props.screenStopOrderHistory
              ? 'STOP_ORDER_STATUS_PENDING'
              : props.value
          )}
        </span>
      )}
    </div>
  );
};

export default IconRejectStatusCell;
