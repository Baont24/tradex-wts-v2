import * as React from 'react';
import * as classNames from 'classnames';
import * as styles from '../../styles.scss';
import { DropTarget, DropTargetMonitor } from 'react-dnd';
import { IDroppableProps, ISpeedOrderRowData, collectDrop } from '../../utils';
import { OrderKind, SellBuyType } from 'constants/enum';
import DraggableItem from './DraggableItem';
import DraggableStopItem from './DraggableStopItem';

const cellDropTarget = {
  canDrop: (props: IDroppableProps, monitor: DropTargetMonitor) => {
    const draggingItem: {
      currentRowData: ISpeedOrderRowData;
    } = monitor.getItem();
    if (
      props.disabled !== true &&
      draggingItem.currentRowData &&
      props.rowData.price !== draggingItem.currentRowData.price &&
      props.orderKind === draggingItem.currentRowData.orderKind &&
      props.sellBuyType === draggingItem.currentRowData.sellBuyType
    ) {
      return true;
    }

    return false;
  },

  drop: (props: IDroppableProps, monitor: DropTargetMonitor) => {
    const draggingItem: {
      currentRowData: ISpeedOrderRowData;
    } = monitor.getItem();

    if (props.disabled) {
      return;
    }

    props.moveOrder(draggingItem.currentRowData, props.rowData.price ?? 0);
  },
};

class DropCell extends React.Component<IDroppableProps> {
  render() {
    const {
      orderKind,
      sellBuyType,
      connectDropTarget,
      isOver,
      canDrop,
      disabled,
    } = this.props;

    const rowStopClass = classNames({
      [styles.HovererCell]: isOver && canDrop,
      [styles.StopSell]: sellBuyType === SellBuyType.SELL,
      [styles.StopSellCell]: sellBuyType === SellBuyType.SELL,
      [styles.StopBuy]: sellBuyType === SellBuyType.BUY,
      [styles.StopBuyCell]: sellBuyType === SellBuyType.BUY,
    });

    const rowClass = classNames({
      [styles.HovererCell]: isOver && canDrop,
      [styles.Sell]: sellBuyType === SellBuyType.SELL,
      [styles.SellCell]: sellBuyType === SellBuyType.SELL,
      [styles.Buy]: sellBuyType === SellBuyType.BUY,
      [styles.BuyCell]: sellBuyType === SellBuyType.BUY,
    });

    return connectDropTarget(
      orderKind === OrderKind.STOP_LIMIT_ORDER ? (
        <div className={rowStopClass}>
          {disabled ? (
            <span className={classNames(styles.RowButton, styles.Disable)} />
          ) : (
            <DraggableStopItem {...this.props} />
          )}
        </div>
      ) : (
        <div className={rowClass}>{<DraggableItem {...this.props} />}</div>
      )
    );
  }
}

export const DropItemStop = DropTarget(
  OrderKind.STOP_LIMIT_ORDER,
  cellDropTarget,
  collectDrop
)(DropCell);

export const DropItem = DropTarget(
  OrderKind.NORMAL_ORDER,
  cellDropTarget,
  collectDrop
)(DropCell);
