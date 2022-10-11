import * as React from 'react';
import * as styles from '../styles.scss';
import { DragSource } from 'react-dnd';
import { IDraggableProps, collect, dragItemSource } from '../../utils';
import { OrderKind } from 'constants/enum';
import { formatNumber } from 'utils/common';

class DraggableSummaryItem extends React.Component<IDraggableProps> {
  render() {
    return this.props.connectDragSource(
      <span className={styles.RowButton}>
        {this.props.total == null || isNaN(this.props.total)
          ? 0
          : formatNumber(this.props.total)}
      </span>
    );
  }
}

export const SummaryItemStop = DragSource(
  OrderKind.STOP_LIMIT_ORDER,
  dragItemSource,
  collect
)(DraggableSummaryItem);

export const SummaryItem = DragSource(
  OrderKind.NORMAL_ORDER,
  dragItemSource,
  collect
)(DraggableSummaryItem);
