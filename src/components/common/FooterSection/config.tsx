import * as React from 'react';
import {
  DERIVATIVES_CONDITIONAL_ORDER_HORIZONTAL_CONFIG,
  DERIVATIVES_NORMAL_ORDER_HORIZONTAL_CONFIG,
  EQUITY_NORMAL_ORDER_HORIZONTAL_CONFIG,
  EQUITY_STOP_LIMIT_ORDER_HORIZONTAL_CONFIG,
} from '../OrderForm/config';
import { ITabTableData } from 'interfaces/common';
import { OrderFormViewMode, OrderKind } from 'constants/enum';
import OrderForm from '../OrderForm';

export const EQUITY_ORDER_TAB: ITabTableData[] = [
  {
    key: OrderKind.NORMAL_ORDER,
    title: 'Normal Order',
    default: true,
    component: (
      <OrderForm
        config={EQUITY_NORMAL_ORDER_HORIZONTAL_CONFIG}
        orderKind={OrderKind.NORMAL_ORDER}
        viewMode={OrderFormViewMode.HORIZONTAL}
      />
    ),
  },
  // {
  //   key: OrderKind.QUICK_ORDER,
  //   title: 'Quick Order 1',
  //   component: (
  //     <OrderForm
  //       config={EQUITY_QUICK_ORDER_HORIZONTAL_CONFIG}
  //       orderKind={OrderKind.QUICK_ORDER}
  //       viewMode={OrderFormViewMode.HORIZONTAL}
  //     />
  //   ),
  // },
  {
    key: OrderKind.STOP_LIMIT_ORDER,
    title: 'Stop Limit Order',
    component: (
      <OrderForm
        config={EQUITY_STOP_LIMIT_ORDER_HORIZONTAL_CONFIG}
        orderKind={OrderKind.STOP_LIMIT_ORDER}
        viewMode={OrderFormViewMode.HORIZONTAL}
      />
    ),
  },
];

export const DERIVATIVES_ORDER_TAB: ITabTableData[] = [
  {
    key: OrderKind.NORMAL_ORDER,
    title: 'Normal Order',
    default: true,
    component: (
      <OrderForm
        config={DERIVATIVES_NORMAL_ORDER_HORIZONTAL_CONFIG}
        orderKind={OrderKind.NORMAL_ORDER}
        viewMode={OrderFormViewMode.HORIZONTAL}
      />
    ),
  },
  // {
  //   key: OrderKind.QUICK_ORDER,
  //   title: 'Quick Order 1',
  //   component: (
  //     <OrderForm
  //       config={DERIVATIVES_QUICK_ORDER_HORIZONTAL_CONFIG}
  //       orderKind={OrderKind.QUICK_ORDER}
  //       viewMode={OrderFormViewMode.HORIZONTAL}
  //     />
  //   ),
  // },
  {
    key: OrderKind.CONDITIONAL_ORDER,
    title: 'Conditional Order',
    component: (
      <OrderForm
        config={DERIVATIVES_CONDITIONAL_ORDER_HORIZONTAL_CONFIG}
        orderKind={OrderKind.CONDITIONAL_ORDER}
        viewMode={OrderFormViewMode.HORIZONTAL}
      />
    ),
  },
];
