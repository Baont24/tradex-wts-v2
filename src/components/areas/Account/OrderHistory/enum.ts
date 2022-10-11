import {
  DrOrderHistoryStatus,
  DrOrderStatus,
  OrderHistoryStatus,
  OrderStatus,
  SellBuyType,
  StopOrderStatus,
} from 'constants/enum';

export const sellBuyDropdown = [
  { title: 'All', value: 'All' },
  { title: 'Buy', value: SellBuyType.BUY },
  { title: 'Sell', value: SellBuyType.SELL },
];

export const orderStatusDropdown = () =>
  Object.keys(OrderStatus).map((value) => ({
    title: value,
    value: OrderStatus[value],
  }));
export const orderHistoryStatusDropdown = () =>
  Object.keys(OrderHistoryStatus).map((value) => ({
    title: value,
    value: OrderHistoryStatus[value],
  }));

export const derivativesOrderStatusDropdown = () =>
  Object.keys(DrOrderStatus).map((value) => ({
    title: value,
    value: DrOrderStatus[value],
  }));
export const derivativesOrderHistoryStatusDropdown = () =>
  Object.keys(DrOrderHistoryStatus).map((value) => ({
    title: value,
    value: DrOrderHistoryStatus[value],
  }));

export const stopOrderStatusDropdown = [
  { title: 'All', value: 'All' },
  ...Object.keys(StopOrderStatus).map((value) => ({
    title: value,
    value: StopOrderStatus[value],
  })),
];
