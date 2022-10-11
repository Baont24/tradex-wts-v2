import * as React from 'react';
import { Market, OrderType, SellBuyType, SymbolType } from 'constants/enum';

export interface IOrderForm {
  readonly stockCode: string;
  readonly accountNumber: string;
  readonly orderType: OrderType;
  readonly sellBuyType: SellBuyType;
  readonly orderQuantity: number;
  readonly orderPrice?: number;
  readonly stopPrice?: number;
  readonly limitPrice?: number;
  readonly securitiesType?: string;
  readonly tradingValue?: number;
  readonly expiryDate?: string;
  readonly startDate?: string;
  readonly endDate?: string;
  readonly conditionalType?: DerivativesConditionalType;
  readonly triggerPrice?: number;
  readonly toler?: number;
  readonly stopTime?: string;
  readonly profitStep?: number;
  readonly profitPrice?: number;
  readonly lossStep?: number;
  readonly lossPrice?: number;
  readonly skipConfirmation?: boolean;

  readonly ceilingPrice?: number;
  readonly floorPrice?: number;
  readonly currentPrice?: number;
  readonly referencePrice?: number;
  readonly market?: Market;
  readonly symbolType?: SymbolType;
  readonly isConfirmModalOpened?: boolean;
  readonly orderQuantityType: 'share' | 'amount' | 'percentage';
  readonly orderQuantityPercentage?: number;
  readonly purchasingPower?: number;
  readonly marginRatio?: number;
  readonly maxQty?: number;
}

export enum OrderFormFieldKey {
  ACCOUNT = 'ACCOUNT',
  SYMBOL = 'SYMBOL',
  CONDITIONAL_TYPE = 'CONDITIONAL_TYPE',
  QUANTITY = 'QUANTITY',
  PRICE = 'PRICE',
  STOP_PRICE = 'STOP_PRICE',
  TRIGGER_PRICE = 'TRIGGER_PRICE',
  LIMIT_PRICE = 'LIMIT_PRICE',
  TRADING_VALUE = 'TRADING_VALUE',
  EXPIRY_DATE = 'EXPIRY_DATE',
  STOP_DATE = 'STOP_DATE',
  POSITION = 'POSITION',
  TOLER = 'TOLER',
  PROFIT = 'PROFIT',
  PROFIT_STEP = 'PROFIT_STEP',
  PROFIT_PRICE = 'PROFIT_PRICE',
  LOSS = 'LOSS',
  LOSS_STEP = 'LOSS_STEP',
  LOSS_PRICE = 'LOSS_PRICE',
  STOP_TIME = 'STOP_TIME',
  CONFIRM = 'CONFIRM',
  CONFIRM_NORMAL = 'CONFIRM_NORMAL',
  MARGIN_RATIO = 'MARGIN_RATIO',
  CURRENT_PRICE = 'CURRENT_PRICE',
  BUY_SELL = 'BUY_SELL',
  ORDER_TYPES = 'ORDER_TYPES',
  SKIP_CONFIRMATION = 'SKIP_CONFIRMATION',
  TRADING_VALUE_VERTICAL = 'TRADING_VALUE_VERTICAL',
}

export enum DerivativesConditionalType {
  UP = 'UP',
  DOWN = 'DOWN',
  OCO = 'OCO',
  BULL_BEAR = 'BULL_BEAR',
  TRAILING_UP = 'TRAILING_UP',
  TRAILING_DOWN = 'TRAILING_DOWN',
  TIME = 'TIME',
  STOP_LIMIT = 'STOP_LIMIT',
  TRAILING = 'TRAILING',
}

export type IOrderFormConfig = {
  readonly [key in OrderFormFieldKey]?: {
    readonly style?: React.CSSProperties;
  };
};

export const DERIVATIVES_CONDITIONAL_TYPE = [
  // { title: 'Up', value: DerivativesConditionalType.UP },
  // { title: 'Down', value: DerivativesConditionalType.DOWN },
  // { title: 'OCO', value: DerivativesConditionalType.OCO },
  // { title: 'BullBear', value: DerivativesConditionalType.BULL_BEAR },
  // { title: 'Trailing', value: DerivativesConditionalType.TRAILING },
  // { title: 'Trailing Down', value: DerivativesConditionalType.TRAILING_DOWN },
  // { title: 'Time', value: DerivativesConditionalType.TIME },
  { title: 'Stop Limit', value: DerivativesConditionalType.STOP_LIMIT },
];

export const EQUITY_NORMAL_ORDER_TRADING_TEMPLATE_CONFIG: IOrderFormConfig = {
  [OrderFormFieldKey.BUY_SELL]: {
    style: {
      gridColumn: '1/3',
    },
  },
  [OrderFormFieldKey.ACCOUNT]: {},
  [OrderFormFieldKey.SYMBOL]: {},
  [OrderFormFieldKey.QUANTITY]: {},
  [OrderFormFieldKey.PRICE]: {},
  [OrderFormFieldKey.TRADING_VALUE]: {},
  [OrderFormFieldKey.EXPIRY_DATE]: {
    style: {
      gridColumn: '1/3',
    },
  },
  [OrderFormFieldKey.MARGIN_RATIO]: {
    style: {
      display: 'none',
    },
  },
  [OrderFormFieldKey.CURRENT_PRICE]: {
    style: {
      display: 'none',
    },
  },
  [OrderFormFieldKey.CONFIRM]: {
    style: {
      gridColumn: '1/3',
    },
  },
};

export const EQUITY_STOP_LIMIT_ORDER_TRADING_TEMPLATE_CONFIG: IOrderFormConfig = {
  [OrderFormFieldKey.BUY_SELL]: {
    style: {
      gridColumn: '1/3',
    },
  },
  [OrderFormFieldKey.ACCOUNT]: {},
  [OrderFormFieldKey.SYMBOL]: {},
  [OrderFormFieldKey.QUANTITY]: {},
  [OrderFormFieldKey.STOP_PRICE]: {
    style: {
      gridColumn: '1/2',
    },
  },
  [OrderFormFieldKey.LIMIT_PRICE]: {},
  [OrderFormFieldKey.TRADING_VALUE]: {},
  [OrderFormFieldKey.STOP_DATE]: {
    style: {
      gridColumn: '1/3',
    },
  },
  [OrderFormFieldKey.MARGIN_RATIO]: {
    style: {
      display: 'none',
    },
  },
  [OrderFormFieldKey.CURRENT_PRICE]: {
    style: {
      display: 'none',
    },
  },
  [OrderFormFieldKey.CONFIRM]: {
    style: {
      gridColumn: '1/3',
    },
  },
};

export const EQUITY_NORMAL_ORDER_CONFIG: IOrderFormConfig = {
  [OrderFormFieldKey.BUY_SELL]: {
    style: {
      gridColumn: '1/7',
    },
  },
  [OrderFormFieldKey.ACCOUNT]: {
    style: {
      gridColumn: '1/7',
    },
  },
  [OrderFormFieldKey.SYMBOL]: {
    style: {
      gridColumn: '1/7',
    },
  },
  [OrderFormFieldKey.QUANTITY]: {
    style: {
      gridColumn: '1/3',
    },
  },
  [OrderFormFieldKey.PRICE]: {
    style: {
      gridColumn: '3/5',
    },
  },
  [OrderFormFieldKey.ORDER_TYPES]: {
    style: {
      gridColumn: '5/7',
    },
  },
  [OrderFormFieldKey.TRADING_VALUE]: {
    style: {
      gridColumn: '1/7',
    },
  },
  [OrderFormFieldKey.TRADING_VALUE_VERTICAL]: {
    style: {
      gridColumn: '1/7',
    },
  },
  [OrderFormFieldKey.EXPIRY_DATE]: {
    style: {
      gridColumn: '1/7',
    },
  },
  [OrderFormFieldKey.CONFIRM]: {
    style: {
      gridColumn: '4/7',
    },
  },
  [OrderFormFieldKey.CONFIRM_NORMAL]: {
    style: {
      gridColumn: '4/7',
    },
  },
  [OrderFormFieldKey.SKIP_CONFIRMATION]: {
    style: {
      gridColumn: '1/4',
    },
  },
};

export const EQUITY_NORMAL_ORDER_HORIZONTAL_CONFIG: IOrderFormConfig = {
  [OrderFormFieldKey.BUY_SELL]: {
    style: {
      gridColumn: '1/6',
      order: 0,
    },
  },
  [OrderFormFieldKey.ACCOUNT]: {
    style: {
      order: 1,
    },
  },
  [OrderFormFieldKey.SYMBOL]: {
    style: {
      gridColumn: '2/6',
      order: 2,
    },
  },
  [OrderFormFieldKey.QUANTITY]: {
    style: {
      order: 3,
    },
  },
  [OrderFormFieldKey.PRICE]: {
    style: {
      order: 4,
    },
  },
  [OrderFormFieldKey.ORDER_TYPES]: {
    style: {
      order: 5,
    },
  },
  [OrderFormFieldKey.TRADING_VALUE]: {
    style: {
      order: 7,
    },
  },
  [OrderFormFieldKey.EXPIRY_DATE]: {
    style: {
      order: 8,
    },
  },
  [OrderFormFieldKey.SKIP_CONFIRMATION]: {
    style: {
      order: 8,
    },
  },
  [OrderFormFieldKey.CONFIRM]: {
    style: {
      marginRight: 15,
      order: 100,
    },
  },
  [OrderFormFieldKey.CONFIRM_NORMAL]: {
    style: {
      marginRight: 15,
      gridColumn: '4/6',
      order: 6,
    },
  },
};

export const EQUITY_QUICK_ORDER_CONFIG: IOrderFormConfig = {
  [OrderFormFieldKey.ACCOUNT]: {},
  [OrderFormFieldKey.SYMBOL]: {},
  [OrderFormFieldKey.QUANTITY]: {
    style: {
      marginRight: 10,
    },
  },
  [OrderFormFieldKey.TOLER]: {},
};

export const EQUITY_QUICK_ORDER_HORIZONTAL_CONFIG: IOrderFormConfig = {
  [OrderFormFieldKey.ACCOUNT]: {},
  [OrderFormFieldKey.SYMBOL]: {},
  [OrderFormFieldKey.QUANTITY]: {},
  [OrderFormFieldKey.TOLER]: {},
};

export const EQUITY_STOP_LIMIT_ORDER_CONFIG: IOrderFormConfig = {
  [OrderFormFieldKey.BUY_SELL]: {
    style: {
      gridColumn: '1/7',
    },
  },
  [OrderFormFieldKey.ACCOUNT]: {
    style: {
      gridColumn: '1/7',
    },
  },
  [OrderFormFieldKey.SYMBOL]: {
    style: {
      gridColumn: '1/7',
    },
  },
  [OrderFormFieldKey.QUANTITY]: {
    style: {
      gridColumn: '1/7',
    },
  },
  [OrderFormFieldKey.STOP_PRICE]: {
    style: {
      gridColumn: '1/4',
    },
  },
  [OrderFormFieldKey.LIMIT_PRICE]: {
    style: {
      gridColumn: '4/7',
    },
  },
  [OrderFormFieldKey.TRADING_VALUE]: {
    style: {
      gridColumn: '1/7',
    },
  },
  [OrderFormFieldKey.STOP_DATE]: {
    style: {
      gridColumn: '1/7',
    },
  },
  [OrderFormFieldKey.CONFIRM]: {
    style: {
      gridColumn: '1/7',
    },
  },
};

export const EQUITY_STOP_LIMIT_ORDER_HORIZONTAL_CONFIG: IOrderFormConfig = {
  [OrderFormFieldKey.BUY_SELL]: {
    style: {
      gridColumn: '1/6',
    },
  },
  [OrderFormFieldKey.ACCOUNT]: {},
  [OrderFormFieldKey.SYMBOL]: {},
  [OrderFormFieldKey.QUANTITY]: {},
  [OrderFormFieldKey.STOP_PRICE]: {},
  [OrderFormFieldKey.LIMIT_PRICE]: {},
  [OrderFormFieldKey.TRADING_VALUE]: {},
  [OrderFormFieldKey.STOP_DATE]: {
    style: {
      gridColumn: '2/4',
    },
  },
  [OrderFormFieldKey.CONFIRM]: {
    style: {
      gridColumn: '4/6',
      marginRight: 15,
      justifyContent: 'flex-end',
    },
  },
};

export const DERIVATIVES_NORMAL_ORDER_CONFIG: IOrderFormConfig = {
  [OrderFormFieldKey.BUY_SELL]: {
    style: {
      gridColumn: '1/7',
    },
  },
  [OrderFormFieldKey.ACCOUNT]: {
    style: {
      gridColumn: '1/7',
    },
  },
  [OrderFormFieldKey.SYMBOL]: {
    style: {
      gridColumn: '1/7',
    },
  },
  [OrderFormFieldKey.QUANTITY]: {
    style: {
      gridColumn: '1/3',
    },
  },
  [OrderFormFieldKey.PRICE]: {
    style: {
      gridColumn: '3/5',
    },
  },
  [OrderFormFieldKey.ORDER_TYPES]: {
    style: {
      gridColumn: '5/7',
    },
  },
  [OrderFormFieldKey.TRADING_VALUE]: {
    style: {
      gridColumn: '1/7',
    },
  },
  [OrderFormFieldKey.EXPIRY_DATE]: {
    style: {
      gridColumn: '1/7',
    },
  },
  [OrderFormFieldKey.CONFIRM_NORMAL]: {
    style: {
      gridColumn: '4/7',
    },
  },
  [OrderFormFieldKey.SKIP_CONFIRMATION]: {
    style: {
      gridColumn: '1/4',
    },
  },
  [OrderFormFieldKey.POSITION]: {},
};

export const DERIVATIVES_NORMAL_ORDER_TRADING_TEMPLATE_CONFIG: IOrderFormConfig = {
  [OrderFormFieldKey.BUY_SELL]: {
    style: {
      gridColumn: '1/3',
    },
  },
  [OrderFormFieldKey.ACCOUNT]: {},
  [OrderFormFieldKey.SYMBOL]: {},
  [OrderFormFieldKey.QUANTITY]: {},
  [OrderFormFieldKey.PRICE]: {},
  [OrderFormFieldKey.TRADING_VALUE]: {},
  [OrderFormFieldKey.EXPIRY_DATE]: {
    style: {
      gridColumn: '1/3',
    },
  },
  [OrderFormFieldKey.MARGIN_RATIO]: {
    style: {
      display: 'none',
    },
  },
  [OrderFormFieldKey.CURRENT_PRICE]: {
    style: {
      display: 'none',
    },
  },
  [OrderFormFieldKey.POSITION]: {},
  [OrderFormFieldKey.CONFIRM]: {
    style: {
      gridColumn: '1/3',
    },
  },
};

export const DERIVATIVES_CONDITIONAL_ORDER_TRADING_TEMPLATE_CONFIG: IOrderFormConfig = {
  [OrderFormFieldKey.BUY_SELL]: {
    style: {
      gridColumn: '1/3',
    },
  },
  [OrderFormFieldKey.ACCOUNT]: {},
  [OrderFormFieldKey.SYMBOL]: {},
  [OrderFormFieldKey.CONDITIONAL_TYPE]: {},
  [OrderFormFieldKey.QUANTITY]: {},
  [OrderFormFieldKey.PRICE]: {},
  [OrderFormFieldKey.TRADING_VALUE]: {},
  [OrderFormFieldKey.EXPIRY_DATE]: {
    style: {
      gridColumn: '1/3',
    },
  },
  [OrderFormFieldKey.MARGIN_RATIO]: {
    style: {
      display: 'none',
    },
  },
  [OrderFormFieldKey.CURRENT_PRICE]: {
    style: {
      display: 'none',
    },
  },
  [OrderFormFieldKey.PRICE]: {},
  [OrderFormFieldKey.POSITION]: {},
  [OrderFormFieldKey.STOP_PRICE]: {},
  [OrderFormFieldKey.LIMIT_PRICE]: {},
  [OrderFormFieldKey.STOP_DATE]: {
    style: {
      gridColumn: '1/3',
    },
  },
  [OrderFormFieldKey.CONFIRM]: {
    style: {
      gridColumn: '1/3',
    },
  },
};

export const DERIVATIVES_NORMAL_ORDER_HORIZONTAL_CONFIG: IOrderFormConfig = {
  [OrderFormFieldKey.BUY_SELL]: {
    style: {
      gridColumn: '1/6',
    },
  },
  [OrderFormFieldKey.ACCOUNT]: {
    style: {
      order: 1,
    },
  },
  [OrderFormFieldKey.SYMBOL]: {
    style: {
      order: 2,
      gridColumn: '2/6',
    },
  },
  [OrderFormFieldKey.QUANTITY]: {
    style: {
      order: 3,
    },
  },
  [OrderFormFieldKey.PRICE]: {
    style: {
      order: 4,
    },
  },
  [OrderFormFieldKey.ORDER_TYPES]: {
    style: {
      order: 5,
    },
  },
  [OrderFormFieldKey.TRADING_VALUE]: {
    style: {
      order: 6,
    },
  },
  [OrderFormFieldKey.EXPIRY_DATE]: {
    style: {
      order: 7,
    },
  },
  [OrderFormFieldKey.SKIP_CONFIRMATION]: {
    style: {
      order: 8,
    },
  },
  [OrderFormFieldKey.POSITION]: {
    style: {
      order: 4,
      height: 50,
    },
  },
  [OrderFormFieldKey.CONFIRM]: {
    style: {
      order: 10,
    },
  },

  [OrderFormFieldKey.CONFIRM_NORMAL]: {
    style: {
      order: 10,
    },
  },
};

export const DERIVATIVES_QUICK_ORDER_CONFIG: IOrderFormConfig = {
  [OrderFormFieldKey.ACCOUNT]: {},
  [OrderFormFieldKey.SYMBOL]: {},
  [OrderFormFieldKey.QUANTITY]: {
    style: {
      marginRight: 10,
    },
  },
  [OrderFormFieldKey.PRICE]: {},
  [OrderFormFieldKey.TRADING_VALUE]: {},
  [OrderFormFieldKey.POSITION]: {},
};

export const DERIVATIVES_QUICK_ORDER_HORIZONTAL_CONFIG: IOrderFormConfig = {
  [OrderFormFieldKey.ACCOUNT]: {
    style: {
      order: 1,
    },
  },
  [OrderFormFieldKey.SYMBOL]: {
    style: {
      order: 2,
    },
  },
  [OrderFormFieldKey.QUANTITY]: {
    style: {
      order: 3,
    },
  },
  [OrderFormFieldKey.PRICE]: {
    style: {
      order: 5,
    },
  },
  [OrderFormFieldKey.TRADING_VALUE]: {
    style: {
      order: 6,
    },
  },
  [OrderFormFieldKey.POSITION]: {
    style: {
      order: 4,
      height: 50,
    },
  },
  [OrderFormFieldKey.CONFIRM]: {
    style: {
      order: 4,
      width: 130,
    },
  },
};

export const DERIVATIVES_CONDITIONAL_ORDER_CONFIG: IOrderFormConfig = {
  [OrderFormFieldKey.BUY_SELL]: {
    style: {
      gridColumn: '1/3',
    },
  },
  [OrderFormFieldKey.ACCOUNT]: {
    style: {
      gridColumn: '1/3',
    },
  },
  [OrderFormFieldKey.SYMBOL]: {
    style: {
      gridColumn: '1/3',
    },
  },

  [OrderFormFieldKey.QUANTITY]: {},
  [OrderFormFieldKey.CONDITIONAL_TYPE]: {},
  [OrderFormFieldKey.PRICE]: {},
  [OrderFormFieldKey.TRIGGER_PRICE]: {
    style: {
      marginLeft: 10,
    },
  },
  [OrderFormFieldKey.STOP_PRICE]: {},
  [OrderFormFieldKey.LIMIT_PRICE]: {},
  [OrderFormFieldKey.TRADING_VALUE]: {
    style: {
      gridColumn: '1/3',
    },
  },
  [OrderFormFieldKey.STOP_TIME]: {},
  [OrderFormFieldKey.PROFIT]: {},
  [OrderFormFieldKey.PROFIT_STEP]: {
    style: {
      marginRight: 10,
    },
  },
  [OrderFormFieldKey.PROFIT_PRICE]: {},
  [OrderFormFieldKey.LOSS]: {},
  [OrderFormFieldKey.LOSS_STEP]: {
    style: {
      marginRight: 10,
    },
  },
  [OrderFormFieldKey.LOSS_PRICE]: {},
  [OrderFormFieldKey.STOP_DATE]: {
    style: {
      gridColumn: '1/3',
    },
  },
  [OrderFormFieldKey.TOLER]: {},
  [OrderFormFieldKey.CONFIRM]: {
    style: {
      gridColumn: '1/3',
    },
  },
  [OrderFormFieldKey.POSITION]: {},
};

export const DERIVATIVES_CONDITIONAL_ORDER_HORIZONTAL_CONFIG: IOrderFormConfig = {
  [OrderFormFieldKey.BUY_SELL]: {
    style: {
      gridColumn: '1/6',
    },
  },
  [OrderFormFieldKey.ACCOUNT]: {
    style: {
      order: 1,
    },
  },
  [OrderFormFieldKey.SYMBOL]: {
    style: {
      order: 2,
    },
  },
  [OrderFormFieldKey.CONDITIONAL_TYPE]: {
    style: {
      order: 3,
    },
  },
  [OrderFormFieldKey.QUANTITY]: {
    style: {
      order: 5,
    },
  },
  [OrderFormFieldKey.PRICE]: {
    style: {
      order: 6,
    },
  },
  [OrderFormFieldKey.TRIGGER_PRICE]: {
    style: {
      order: 7,
    },
  },
  [OrderFormFieldKey.STOP_TIME]: {
    style: {
      order: 8,
    },
  },
  [OrderFormFieldKey.PROFIT]: {
    style: {
      order: 9,
    },
  },
  [OrderFormFieldKey.PROFIT_STEP]: {},
  [OrderFormFieldKey.PROFIT_PRICE]: {},
  [OrderFormFieldKey.LOSS]: {
    style: {
      order: 9,
    },
  },
  [OrderFormFieldKey.LOSS_STEP]: {},
  [OrderFormFieldKey.LOSS_PRICE]: {},
  [OrderFormFieldKey.TOLER]: {
    style: {
      order: 10,
    },
  },
  [OrderFormFieldKey.STOP_PRICE]: {
    style: {
      order: 9,
    },
  },
  [OrderFormFieldKey.LIMIT_PRICE]: {
    style: {
      order: 9,
    },
  },
  [OrderFormFieldKey.STOP_DATE]: {
    style: {
      gridColumn: '2/4',
      order: 9,
    },
  },
  [OrderFormFieldKey.TRADING_VALUE]: {
    style: {
      order: 9,
    },
  },
  [OrderFormFieldKey.CONFIRM]: {
    style: {
      gridColumn: '4/6',
      order: 9,
      marginRight: 20,
      justifyContent: 'flex-end',
    },
  },
};
