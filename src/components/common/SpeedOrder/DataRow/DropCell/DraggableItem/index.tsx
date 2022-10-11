import * as React from 'react';
import * as styles from '../../../styles.scss';
import { DragSource } from 'react-dnd';
import { IDraggableProps, collect, dragItemSource } from '../../../utils';
import { OrderKind, SpeedOrderClickType } from 'constants/enum';
import { formatNumber } from 'utils/common';

class DraggableItem extends React.Component<IDraggableProps> {
  render() {
    const { connectDragSource, placeOrder, rowData, sellBuyType } = this.props;

    return connectDragSource(
      <span
        className={styles.RowButton}
        onClick={placeOrder?.(
          OrderKind.NORMAL_ORDER,
          sellBuyType,
          { ...rowData },
          SpeedOrderClickType.SINGLE_CLICK
        )}
        onDoubleClick={placeOrder?.(
          OrderKind.NORMAL_ORDER,
          sellBuyType,
          { ...rowData },
          SpeedOrderClickType.DOUBLE_CLICK
        )}
      >
        {rowData?.priceData?.[sellBuyType] &&
          rowData.priceData[sellBuyType].unmatchedQuantity > 0 &&
          formatNumber(rowData.priceData[sellBuyType].unmatchedQuantity)}
      </span>
    );
  }
}

const Item = DragSource(
  OrderKind.NORMAL_ORDER,
  dragItemSource,
  collect
)(DraggableItem);

export default Item;
