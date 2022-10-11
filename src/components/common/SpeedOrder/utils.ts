import * as ReactDOM from 'react-dom';
import { Big } from 'big.js';
import {
  ConnectDragSource,
  ConnectDropTarget,
  DragSourceConnector,
  DragSourceMonitor,
  DropTargetConnector,
  DropTargetMonitor,
} from 'react-dnd';
import { IBidOffer, INewSymbolData } from 'interfaces/market';
import { IOrderBookReducer } from 'interfaces/reducers';
import { IStopOrderHistoryResponse } from 'interfaces/api';
import { OrderKind, SellBuyType, SpeedOrderClickType } from 'constants/enum';
import { getPriceStep } from 'utils/market';

export interface ISpeedOrderRowData {
  readonly orderKind?: OrderKind;
  readonly stopPriceData?: {
    readonly [t in SellBuyType]: {
      readonly orderQuantity: number;
      readonly unmatchedQuantity: number;
    };
  };
  readonly priceData?: {
    readonly [t in SellBuyType]: {
      readonly orderQuantity: number;
      readonly unmatchedQuantity: number;
    };
  };
  readonly price?: number;
  readonly newPrice?: number;
  readonly bidVolume?: number;
  readonly offerVolume?: number;
  readonly sellBuyType?: SellBuyType;
}

export interface IDraggableProps {
  readonly isTotalRow?: boolean;
  readonly total?: number;
  readonly rowData?: ISpeedOrderRowData;
  readonly orderKind?: OrderKind;
  readonly sellBuyType: SellBuyType;
  readonly connectDragSource: ConnectDragSource;
  readonly speedOrderContainer?: HTMLDivElement;

  readonly placeOrder?: (
    orderKind: OrderKind,
    sellBuyType: SellBuyType,
    rowData: ISpeedOrderRowData,
    clickType: SpeedOrderClickType
  ) => (() => void) | undefined;

  readonly cancelOrder?: (currentRowData: ISpeedOrderRowData) => void;

  readonly cancelAllOrders?: (
    orderKind: OrderKind,
    sellBuyType: SellBuyType,
    total?: number
  ) => void;
}

export interface IDroppableProps {
  readonly rowData: ISpeedOrderRowData;
  readonly data?: INewSymbolData;
  readonly orderKind: OrderKind;
  readonly sellBuyType: SellBuyType;
  readonly isOver: boolean;
  readonly canDrop: boolean;
  readonly disabled?: boolean;
  readonly speedOrderContainer?: HTMLDivElement;
  readonly connectDropTarget: ConnectDropTarget;
  readonly currentRowData?: ISpeedOrderRowData;

  readonly placeOrder: (
    orderKind: OrderKind,
    sellBuyType: SellBuyType,
    rowData: ISpeedOrderRowData,
    clickType: SpeedOrderClickType
  ) => (() => void) | undefined;

  readonly cancelOrder: (currentRowData: ISpeedOrderRowData) => void;

  readonly moveOrder: (
    currentRowData: ISpeedOrderRowData,
    newPrice: number
  ) => void;
}

export interface ISummaryRowData {
  readonly totalStopOffer?: number;
  readonly totalOffer?: number;
  readonly totalBid?: number;
  readonly totalStopBid?: number;
}

export const collect = (
  connect: DragSourceConnector,
  monitor: DragSourceMonitor
) => {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
  };
};

export const dragItemSource = {
  canDrag: (props: IDraggableProps) => {
    if (props.isTotalRow) {
      if (props.total && props.total > 0) {
        return true;
      } else {
        return false;
      }
    } else {
      if (props.orderKind === OrderKind.STOP_LIMIT_ORDER) {
        return (
          props.rowData?.stopPriceData != null &&
          props.rowData.stopPriceData[props.sellBuyType] &&
          props.rowData.stopPriceData[props.sellBuyType].orderQuantity > 0
        );
      } else if (props.orderKind === OrderKind.NORMAL_ORDER) {
        return (
          props.rowData?.priceData != null &&
          props.rowData.priceData[props.sellBuyType] &&
          props.rowData.priceData[props.sellBuyType].unmatchedQuantity > 0
        );
      } else {
        return false;
      }
    }
  },

  beginDrag: (props: IDraggableProps) => {
    return !props.isTotalRow
      ? {
          currentRowData: {
            ...props.rowData,
            orderKind: props.orderKind,
            sellBuyType: props.sellBuyType,
          },
        }
      : {};
  },

  endDrag: (props: IDraggableProps, monitor: DragSourceMonitor) => {
    if (props.speedOrderContainer) {
      // eslint-disable-next-line react/no-find-dom-node
      const domEl: Element | Text | null = ReactDOM.findDOMNode(
        props.speedOrderContainer
      );

      if (domEl != null) {
        const domRect:
          | DOMRect
          | ClientRect = (domEl as Element).getBoundingClientRect();
        const clientOffset = monitor.getClientOffset();

        const draggingItem = monitor.getItem();

        if (domRect && clientOffset) {
          if (
            clientOffset.x < domRect.left ||
            clientOffset.x > domRect.right ||
            clientOffset.y < domRect.top ||
            clientOffset.y > domRect.bottom
          ) {
            if (!props.isTotalRow) {
              props.cancelOrder?.(draggingItem.currentRowData);
            } else {
              if (props.orderKind != null) {
                props.cancelAllOrders?.(
                  props.orderKind,
                  props.sellBuyType,
                  props.total
                );
              }
            }
          }
        }
      }
    }
  },
};

export const collectDrop = (
  connect: DropTargetConnector,
  monitor: DropTargetMonitor
) => {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop(),
  };
};

export enum PromptMode {
  PLACE,
  MOVE,
  CANCEL,
  CANCEL_ALL,
}

export const getPriceList = (
  symbolData?: INewSymbolData,
  orderData?: IOrderBookReducer[],
  stopOrderData?: IStopOrderHistoryResponse[]
) => {
  const mutableList: ISpeedOrderRowData[] = [];
  const defaultTotal = {
    totalBid: 0,
    totalOffer: 0,
    totalStopBid: 0,
    totalStopOffer: 0,
  };

  if (symbolData == null) {
    return {
      list: mutableList,
      total: defaultTotal,
    };
  }

  let stopOrderBidMap: { [s: number]: number } = {};
  let stopOrderAskMap: { [s: number]: number } = {};
  let orderQtyBidMap: { [s: number]: number } = {};
  let orderUnmatchQtyBidMap: { [s: number]: number } = {};
  let orderQtyAskMap: { [s: number]: number } = {};
  let orderUnmatchQtyAskMap: { [s: number]: number } = {};
  let bidMap: { [s: string]: number | undefined } = {};
  let askMap: { [s: string]: number | undefined } = {};

  if (orderData != null) {
    orderQtyBidMap = orderData
      .filter((val) => val.sellBuyType === SellBuyType.BUY)
      .reduce((curr: { [s: number]: number }, val) => {
        return {
          ...curr,
          [val.orderPrice]:
            curr[val.orderPrice] != null
              ? curr[val.orderPrice] + val.orderQuantity
              : val.orderQuantity,
        };
      }, {});

    orderUnmatchQtyBidMap = orderData
      .filter((val) => val.sellBuyType === SellBuyType.BUY)
      .reduce((curr: { [s: number]: number }, val) => {
        return {
          ...curr,
          [val.orderPrice]:
            curr[val.orderPrice] != null
              ? curr[val.orderPrice] + val.unmatchedQuantity
              : val.unmatchedQuantity,
        };
      }, {});

    orderQtyAskMap = orderData
      .filter((val) => val.sellBuyType === SellBuyType.SELL)
      .reduce((curr: { [s: number]: number }, val) => {
        return {
          ...curr,
          [val.orderPrice]:
            curr[val.orderPrice] != null
              ? curr[val.orderPrice] + val.orderQuantity
              : val.orderQuantity,
        };
      }, {});

    orderUnmatchQtyAskMap = orderData
      .filter((val) => val.sellBuyType === SellBuyType.SELL)
      .reduce((curr: { [s: number]: number }, val) => {
        return {
          ...curr,
          [val.orderPrice]:
            curr[val.orderPrice] != null
              ? curr[val.orderPrice] + val.unmatchedQuantity
              : val.unmatchedQuantity,
        };
      }, {});
  }

  if (symbolData.bb != null) {
    bidMap = symbolData.bb.reduce(
      (curr: { [s: string]: number | undefined }, val: IBidOffer) => {
        let map = { ...curr };
        if (val.p != null) {
          map = { ...curr, [val.p]: val.v };
        }
        return map;
      },
      {}
    );
  }

  if (symbolData.bo != null) {
    askMap = symbolData.bo.reduce(
      (curr: { [s: string]: number | undefined }, val: IBidOffer) => {
        let map = { ...curr };
        if (val.p != null) {
          map = { ...curr, [val.p]: val.v };
        }
        return map;
      },
      {}
    );
  }

  if (stopOrderData != null) {
    stopOrderBidMap = stopOrderData
      .filter((val) => val.sellBuyType === SellBuyType.BUY)
      .reduce((curr: { [s: number]: number }, val) => {
        return {
          ...curr,
          [val.stopPrice]:
            curr[val.stopPrice] != null
              ? curr[val.stopPrice] + val.orderQuantity
              : val.orderQuantity,
        };
      }, {});

    stopOrderAskMap = stopOrderData
      .filter((val) => val.sellBuyType === SellBuyType.SELL)
      .reduce((curr: { [s: number]: number }, val) => {
        return {
          ...curr,
          [val.stopPrice]:
            curr[val.stopPrice] != null
              ? curr[val.stopPrice] + val.orderQuantity
              : val.orderQuantity,
        };
      }, {});
  }

  if (symbolData?.ce != null && symbolData.fl != null) {
    let price = Big(symbolData.fl);
    while (price.lte(symbolData.ce)) {
      const priceStep = getPriceStep(
        +price,
        symbolData.m,
        symbolData.t,
        symbolData.bs
      );
      const rowData: ISpeedOrderRowData = {
        price: +price,
        ...(bidMap[+price] != null && { bidVolume: bidMap[+price] }),
        ...(askMap[+price] != null && { offerVolume: askMap[+price] }),
        priceData: {
          [SellBuyType.BUY]: {
            orderQuantity: orderQtyBidMap[+price],
            unmatchedQuantity: orderUnmatchQtyBidMap[+price],
          },
          [SellBuyType.SELL]: {
            orderQuantity: orderQtyAskMap[+price],
            unmatchedQuantity: orderUnmatchQtyAskMap[+price],
          },
        },
        stopPriceData: {
          [SellBuyType.BUY]: {
            orderQuantity: stopOrderBidMap[+price],
            unmatchedQuantity: 0,
          },
          [SellBuyType.SELL]: {
            orderQuantity: stopOrderAskMap[+price],
            unmatchedQuantity: 0,
          },
        },
      };
      mutableList.unshift(rowData);
      price = price.plus(priceStep);
    }
  }

  const total = mutableList.reduce<ISummaryRowData>((val, curr) => {
    const totalStopBid = curr.stopPriceData?.[SellBuyType.BUY].orderQuantity;
    const totalStopOffer = curr.stopPriceData?.[SellBuyType.SELL].orderQuantity;
    return {
      totalBid: Object.values(orderQtyBidMap)?.reduce(
        (partialSum, a) => partialSum + a,
        0
      ),
      totalOffer: Object.values(orderQtyAskMap)?.reduce(
        (partialSum, a) => partialSum + a,
        0
      ),
      totalStopBid:
        val.totalStopBid != null && totalStopBid
          ? val.totalStopBid + totalStopBid
          : val.totalStopBid,
      totalStopOffer:
        val.totalStopOffer != null && totalStopOffer
          ? val.totalStopOffer + totalStopOffer
          : val.totalStopOffer,
    };
  }, defaultTotal);

  return { list: mutableList, total };
};
