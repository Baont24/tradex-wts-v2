import { ActiveOrderStatus } from 'constants/enum';

export const ActiveOrderStatusDropdown = () =>
  Object.keys(ActiveOrderStatus).map((value) => ({
    title: value,
    value: ActiveOrderStatus[value],
  }));
