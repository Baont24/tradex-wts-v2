import * as React from 'react';
import * as styles from '../../../styles.scss';
import { DragSource } from 'react-dnd';
import { IDraggableProps, collect, dragItemSource } from '../../../utils';
import { OrderKind, SpeedOrderClickType } from 'constants/enum';
import { formatNumber } from 'utils/common';

class DraggableStopItem extends React.Component<IDraggableProps> {
  render() {
    const { connectDragSource, placeOrder, rowData, sellBuyType } = this.props;
    return connectDragSource(
      <span
        className={styles.RowButton}
        onClick={placeOrder?.(
          OrderKind.STOP_LIMIT_ORDER,
          sellBuyType,
          { ...rowData },
          SpeedOrderClickType.SINGLE_CLICK
        )}
        onDoubleClick={placeOrder?.(
          OrderKind.STOP_LIMIT_ORDER,
          sellBuyType,
          { ...rowData },
          SpeedOrderClickType.DOUBLE_CLICK
        )}
      >
        {rowData?.stopPriceData?.[sellBuyType] &&
          rowData.stopPriceData[sellBuyType].orderQuantity > 0 &&
          formatNumber(rowData.stopPriceData[sellBuyType].orderQuantity)}
      </span>
    );
  }
}

const StopItem = DragSource(
  OrderKind.STOP_LIMIT_ORDER,
  dragItemSource,
  collect
)(DraggableStopItem);

export default StopItem;
