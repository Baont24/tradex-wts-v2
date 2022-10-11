// import { FlagVi, FlagKor, FlagUK } from 'assets/svg';
import {
  DerivativesAdvanceOrderType,
  Lang,
  Market,
  OrderKind,
  OrderType,
  WS,
} from './enum';
import { FlagUK, FlagVi } from 'assets/svg';
import { IConfig } from 'interfaces/config';
import { ISocket, ISubscribeChannel } from 'interfaces/common';
import { SymbolsStorage } from 'components/common/TVChart/datafeeds/symbols-storage';

export const DERIVATIVES_SUB_ACCOUNT = '80';
export const EQUITY_DEFAULT_SUB_ACCOUNT = '00';
export const EQUITY_DEFAULT_BANK_CODE = '9999';
export const MAIN_INDEX_SHOW_COUNT = 5;

export const STOCK_LIST_DATA_STORAGE_KEY = 'stockListData';
export const INDEX_LIST_DATA_STORAGE_KEY = 'indexListData';
export const FUTURES_LIST_DATA_STORAGE_KEY = 'futuresListData';
export const CW_LIST_DATA_STORAGE_KEY = 'cwListData';
export const VIEW_MODE_KEY = 'view_mode_key';
export const INDEX_SLIDER_STATE_KEY = 'IndexSliderState';
export const TV_CHART_DATA_STORAGE_KEY = 'tradingview.chartData';
export const STORED_USERNAME = 'TX_USERNAME';
export const STORED_SELECTED_ACCOUNT = 'STORED_SELECTED_ACCOUNT';

export const VIEW_MODE_ONLY = 'VIEW_MODE_ONLY';

export const QUERY_FETCH_COUNT = 50;

export const WATCHLIST_KEY = 'Watchlist';

export const TIME_FORMAT_INPUT = 'HHmmss';
export const DATE_FORMAT_INPUT = 'yyyyMMdd';
export const DATE_TIME_FORMAT_INPUT = DATE_FORMAT_INPUT + TIME_FORMAT_INPUT;

export const TIME_FORMAT_DISPLAY = 'HH:mm:ss';
export const DATE_FORMAT_DISPLAY = 'dd/MM/yyyy';

export const AlarmsNotificationOptionList = [
  { value: 'ONCE', label: 'Alarm one' },
  { value: 'MULTIPLE', label: 'Alarm Multiple' },
];

export const TICK_OPTIONS = [
  { label: '1', value: 1 },
  { label: '5', value: 5 },
  { label: '10', value: 10 },
  { label: '15', value: 15 },
];

export const MINUTE_OPTIONS = [
  { label: '1', value: 1 },
  { label: '5', value: 5 },
  { label: '10', value: 10 },
  { label: '30', value: 30 },
];

export const ORDER_TYPES: {
  readonly [m in Market]?: {
    readonly [o in OrderKind]?: Array<{
      readonly label: string;
      readonly value: OrderType;
    }>;
  };
} = {
  [Market.HOSE]: {
    [OrderKind.NORMAL_ORDER]: [
      { label: 'LO', value: OrderType.LO },
      { label: 'MP', value: OrderType.MP },
      { label: 'ATO', value: OrderType.ATO },
      { label: 'ATC', value: OrderType.ATC },
      { label: 'ODDLOT', value: OrderType.ODDLOT },
    ],
    [OrderKind.QUICK_ORDER]: [
      { label: 'LO', value: OrderType.LO },
      { label: 'MP', value: OrderType.MP },
      { label: 'ATO', value: OrderType.ATO },
      { label: 'ATC', value: OrderType.ATC },
    ],
    [OrderKind.STOP_LIMIT_ORDER]: [
      { label: 'LO', value: OrderType.LO },
      { label: 'MP', value: OrderType.MP },
    ],
  },
  [Market.HNX]: {
    [OrderKind.NORMAL_ORDER]: [
      { label: 'LO', value: OrderType.LO },
      { label: 'ATC', value: OrderType.ATC },
      { label: 'MOK', value: OrderType.MOK },
      { label: 'MAK', value: OrderType.MAK },
      { label: 'MTL', value: OrderType.MTL },
      { label: 'PLO', value: OrderType.PLO },
      { label: 'ODDLOT', value: OrderType.ODDLOT },
    ],
    [OrderKind.QUICK_ORDER]: [
      { label: 'LO', value: OrderType.LO },
      { label: 'ATC', value: OrderType.ATC },
      { label: 'MOK', value: OrderType.MOK },
      { label: 'MAK', value: OrderType.MAK },
      { label: 'MTL', value: OrderType.MTL },
      { label: 'PLO', value: OrderType.PLO },
    ],
    [OrderKind.STOP_LIMIT_ORDER]: [
      { label: 'LO', value: OrderType.LO },
      { label: 'MTL', value: OrderType.MTL },
    ],
    [OrderKind.CONDITIONAL_ORDER]: [
      { label: 'LO', value: OrderType.LO },
      { label: 'MTL', value: OrderType.MTL },
    ],
  },
  [Market.UPCOM]: {
    [OrderKind.NORMAL_ORDER]: [
      { label: 'LO', value: OrderType.LO },
      { label: 'ODDLOT', value: OrderType.ODDLOT },
    ],
    [OrderKind.QUICK_ORDER]: [{ label: 'LO', value: OrderType.LO }],
    [OrderKind.STOP_LIMIT_ORDER]: [{ label: 'LO', value: OrderType.LO }],
  },
};

export const DERIVATIVES_ORDER_TYPES: {
  readonly [m in Market]?: {
    readonly [o in OrderKind]?: Array<{
      readonly label: string;
      readonly value: OrderType;
    }>;
  };
} = {
  [Market.HNX]: {
    [OrderKind.NORMAL_ORDER]: [
      { label: 'LO', value: OrderType.LO },
      { label: 'ATO', value: OrderType.ATO },
      { label: 'MOK', value: OrderType.MOK },
      { label: 'MAK', value: OrderType.MAK },
      { label: 'MTL', value: OrderType.MTL },
      { label: 'ATC', value: OrderType.ATC },
    ],
    [OrderKind.STOP_LIMIT_ORDER]: [{ label: 'LO', value: OrderType.LO }],
    [OrderKind.CONDITIONAL_ORDER]: [
      { label: 'LO', value: OrderType.LO },
      { label: 'MTL', value: OrderType.MTL },
    ],
  },
};

export const QUANTITY_LIST = {
  1: [
    [1, 2, 3, 4, 5, 6, 7],
    [8, 9, 10, 15, 20, 25, 30],
    [35, 40, 45, 50, 75, 100, 150],
    [200, 250, 300, 350, 400, 450, 500],
  ],
  10: [
    [10, 20, 30, 40, 50, 60, 70],
    [80, 90, 100, 200, 300, 400, 500],
    [600, 700, 800, 900, 1000, 2000, 5000],
    [10000, 20000, 30000, 40000, 50000, 100000, 500000],
  ],
  100: [
    [100, 200, 300, 400, 500, 600, 700],
    [800, 900, 1000, 1500, 2000, 5000, 7500],
    [10000, 20000, 30000, 40000, 50000, 100000, 500000],
  ],
  oddLot: [
    [1, 2, 3, 4, 5, 6, 7],
    [8, 9, 10, 15, 20, 25, 30],
    [35, 40, 45, 50, 55, 60, 65],
    [70, 75, 80, 95, 99],
  ],
};

export const PERCENTAGE_LIST = [10, 25, 50, 75, 100];

export const DERIVATIVES_ADVANCE_ORDER_TYPES = [
  { label: 'AO', value: DerivativesAdvanceOrderType.AO },
  { label: 'CAO', value: DerivativesAdvanceOrderType.CAO },
];

export const DERIVATIVES_MARKET_SESSION_OPTION = [
  { label: 'ATO', value: OrderType.ATO },
  { label: 'MORNING', value: 'MORNING' },
  { label: 'AFTERNOON', value: 'AFTERNOON' },
  { label: 'ATC', value: OrderType.ATC },
];

export const COLOR = {
  DOWN: '#ff0000',
  UP: '#00ff00',
  REF: '#ffff00',
  CEIL: '#ff00ff',
  FLOOR: '#00ffff',
};

export const CHARACTERS = 'abcdefghijklmnopqrstuvwxyz0123456789'.split('');

export const LANGUAGES = [
  {
    text: 'Việt Nam',
    value: Lang.VI,
    flag: FlagVi,
  },
  {
    text: 'English',
    value: Lang.EN,
    flag: FlagUK,
  },
  // {
  //   text: '한국어',
  //   value: Lang.KO,
  //   flag: FlagKor,
  // },
];

export const STOCK_BOARD_INFO = {
  WATCHLIST:
    'Derivatives : Price x 1, Qty x 1 - Equity: Price x 1000, Qty x 10',
  FUTURES: 'Price x 1 VND. Quantity x 1',
  STOCK: 'Price x 1000 VND. Quantity x 10',
  ODDLOT: 'Price x 1000 VND. Quantity x 1',
};

/* eslint-disable */
export const Global: {
  sockets: Record<WS, ISocket | undefined>;
  quoteChannels: Record<string, ISubscribeChannel>;
  bidOfferChannels: Record<string, ISubscribeChannel>;
  extraChannels: Record<string, ISubscribeChannel>;
  mobileServerQuoteChannels: Record<string, ISubscribeChannel>;
  config?: IConfig;
  tvSymbolStorage?: SymbolsStorage;
} = {
  sockets: {
    [WS.PRICE_BOARD]: undefined,
    [WS.WTS]: undefined,
    [WS.TTL]: undefined,
    [WS.EKYC]: undefined,
    [WS.MOBILE_SERVER]: undefined,
  },
  quoteChannels: {},
  bidOfferChannels: {},
  extraChannels: {},
  mobileServerQuoteChannels: {},
  tvSymbolStorage: undefined,
};
