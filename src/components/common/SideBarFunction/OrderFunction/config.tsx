import * as React from 'react';
import {
  DERIVATIVES_CONDITIONAL_ORDER_CONFIG,
  DERIVATIVES_CONDITIONAL_ORDER_TRADING_TEMPLATE_CONFIG,
  DERIVATIVES_NORMAL_ORDER_CONFIG,
  DERIVATIVES_NORMAL_ORDER_TRADING_TEMPLATE_CONFIG,
  EQUITY_NORMAL_ORDER_CONFIG,
  EQUITY_NORMAL_ORDER_TRADING_TEMPLATE_CONFIG,
  EQUITY_STOP_LIMIT_ORDER_CONFIG,
  EQUITY_STOP_LIMIT_ORDER_TRADING_TEMPLATE_CONFIG,
} from 'components/common/OrderForm/config';
import { ITabTableData } from 'interfaces/common';
import { OrderKind } from 'constants/enum';
import OrderForm from 'components/common/OrderForm';
import SpeedOrder from 'components/common/SpeedOrder';

export const EQUITY_ORDER_TAB: ITabTableData[] = [
  {
    key: OrderKind.NORMAL_ORDER,
    title: 'Normal Order',
    default: true,
    component: (
      <OrderForm
        config={EQUITY_NORMAL_ORDER_CONFIG}
        orderKind={OrderKind.NORMAL_ORDER}
      />
    ),
  },
  // {
  //   key: OrderKind.QUICK_ORDER,
  //   title: 'Quick Order 1',
  //   component: <OrderForm config={EQUITY_QUICK_ORDER_CONFIG} orderKind={OrderKind.QUICK_ORDER} />,
  // },
  {
    key: OrderKind.STOP_LIMIT_ORDER,
    title: 'Stop Limit Order',
    component: (
      <OrderForm
        config={EQUITY_STOP_LIMIT_ORDER_CONFIG}
        orderKind={OrderKind.STOP_LIMIT_ORDER}
      />
    ),
  },
];

export const EQUITY_ORDER_TAB_TRADING_TEMPLATE: ITabTableData[] = [
  {
    key: OrderKind.NORMAL_ORDER,
    title: 'Normal Order',
    default: true,
    component: (
      <OrderForm
        config={EQUITY_NORMAL_ORDER_TRADING_TEMPLATE_CONFIG}
        orderKind={OrderKind.NORMAL_ORDER}
      />
    ),
  },
  {
    key: OrderKind.STOP_LIMIT_ORDER,
    title: 'Stop Limit Order',
    component: (
      <OrderForm
        config={EQUITY_STOP_LIMIT_ORDER_TRADING_TEMPLATE_CONFIG}
        orderKind={OrderKind.STOP_LIMIT_ORDER}
      />
    ),
  },
  {
    key: 'Speed Order',
    title: 'Speed Order',
    component: <SpeedOrder />,
  },
];

export const DERIVATIVES_ORDER_TAB: ITabTableData[] = [
  {
    key: OrderKind.NORMAL_ORDER,
    title: 'Normal Order',
    default: true,
    component: (
      <OrderForm
        config={DERIVATIVES_NORMAL_ORDER_CONFIG}
        orderKind={OrderKind.NORMAL_ORDER}
      />
    ),
  },
  // {
  //   key: OrderKind.QUICK_ORDER,
  //   title: 'Quick Order 1',
  //   component: <OrderForm config={DERIVATIVES_QUICK_ORDER_CONFIG} orderKind={OrderKind.QUICK_ORDER} />,
  // },
  {
    key: OrderKind.CONDITIONAL_ORDER,
    title: 'Conditional Order',
    component: (
      <OrderForm
        config={DERIVATIVES_CONDITIONAL_ORDER_CONFIG}
        orderKind={OrderKind.CONDITIONAL_ORDER}
      />
    ),
  },
];

export const DERIVATIVES_ORDER_TAB_TRADING_TEMPLATE: ITabTableData[] = [
  {
    key: OrderKind.NORMAL_ORDER,
    title: 'Normal Order',
    default: true,
    component: (
      <OrderForm
        config={DERIVATIVES_NORMAL_ORDER_TRADING_TEMPLATE_CONFIG}
        orderKind={OrderKind.NORMAL_ORDER}
      />
    ),
  },
  {
    key: OrderKind.CONDITIONAL_ORDER,
    title: 'Conditional Order',
    component: (
      <OrderForm
        config={DERIVATIVES_CONDITIONAL_ORDER_TRADING_TEMPLATE_CONFIG}
        orderKind={OrderKind.CONDITIONAL_ORDER}
      />
    ),
  },
  {
    key: 'Speed Order',
    title: 'Speed Order',
    component: <SpeedOrder />,
  },
];
