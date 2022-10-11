import { BoardMarketRoutes } from 'constants/routes';
import { IBoardTab } from 'interfaces/common';
import { Market, SymbolType, Domain } from 'constants/enum';

export const masBoardTabs: IBoardTab[] = [
  {
    key: 'WATCHLIST',
  },
  {
    key: 'HOSE',
    title: 'VN30',
    market: Market.HOSE,
    route: BoardMarketRoutes.VN30,
    default: true,
    data: [
      { title: 'HSX', key: 'HOSE', route: BoardMarketRoutes.HOSE },
      {
        title: 'VN30',
        key: `VN30-${SymbolType.INDEX}`,
        route: BoardMarketRoutes.VN30,
        default: true,
      },
    ],
  },
  {
    key: 'HNX',
    market: Market.HNX,
    route: BoardMarketRoutes.HNX,
    data: [
      { title: 'HNX', key: 'HNX', route: BoardMarketRoutes.HNX },
      {
        title: 'HNX30',
        key: `HNX30-${SymbolType.INDEX}`,
        route: BoardMarketRoutes.HNX30,
      },
    ],
  },
  {
    key: 'UPCOM',
    market: Market.UPCOM,
    route: BoardMarketRoutes.UPCOM,
  },
  {
    key: 'FUTURES',
    title: 'Derivatives',
    route: BoardMarketRoutes.FUTURES,
    data: [
      {
        title: 'Futures Index',
        key: SymbolType.INDEX,
        route: BoardMarketRoutes.FUTURES,
      },
      {
        title: 'Futures Bond',
        key: SymbolType.BOND,
        route: BoardMarketRoutes.FUTURES_BOND,
      },
    ],
  },
  {
    key: 'CW',
    title: 'Covered Warrant',
    route: BoardMarketRoutes.CW,
  },
  {
    key: 'ETF',
    title: 'ETF',
    route: BoardMarketRoutes.ETF,
  },
];

export const vcscBoardTabs: IBoardTab[] = [
  {
    key: 'WATCHLIST',
  },
  {
    key: 'HOSE',
    title: 'VN30',
    market: Market.HOSE,
    route: BoardMarketRoutes.VN30,
    default: true,
    data: [
      { title: 'HSX', key: 'HOSE', route: BoardMarketRoutes.HOSE },
      {
        title: 'VN30',
        key: `VN30-${SymbolType.INDEX}`,
        route: BoardMarketRoutes.VN30,
        default: true,
      },
    ],
  },
  {
    key: 'HNX',
    market: Market.HNX,
    route: BoardMarketRoutes.HNX,
    data: [
      { title: 'HNX', key: 'HNX', route: BoardMarketRoutes.HNX },
      {
        title: 'HNX30',
        key: `HNX30-${SymbolType.INDEX}`,
        route: BoardMarketRoutes.HNX30,
      },
    ],
  },
  {
    key: 'UPCOM',
    market: Market.UPCOM,
    route: BoardMarketRoutes.UPCOM,
  },
  {
    key: 'FUTURES',
    title: 'Derivatives',
    route: BoardMarketRoutes.FUTURES,
    data: [
      {
        title: 'Futures Index',
        key: SymbolType.INDEX,
        route: BoardMarketRoutes.FUTURES,
      },
      {
        title: 'Futures Bond',
        key: SymbolType.BOND,
        route: BoardMarketRoutes.FUTURES_BOND,
      },
    ],
  },
  {
    key: 'CW',
    title: 'Covered Warrant',
    route: BoardMarketRoutes.CW,
  },
  {
    key: 'ETF',
    title: 'ETF',
    route: BoardMarketRoutes.ETF,
    data: [
      {
        title: `${SymbolType.ETF}-HSX`,
        key: Market.HOSE,
        route: BoardMarketRoutes.ETF_HSX,
        default: true,
      },
      {
        title: `${SymbolType.ETF}-HNX`,
        key: Market.HNX,
        route: BoardMarketRoutes.ETF_HNX,
      },
    ],
  },
];

export function adjusByConfig(
  disablePt: boolean,
  disableTabFilter: {
    oddlot: boolean;
    putThrough: boolean;
  },
  domain: string
) {
  if (domain === Domain.VCSC) {
    if (disableTabFilter.putThrough !== true) {
      // eslint-disable-next-line: no-array-mutation
      vcscBoardTabs.push({
        key: 'PutThrough',
        title: 'Put-Through 1',
        route: BoardMarketRoutes.PUTTHROUGH_HSX,
        data: [
          {
            title: 'Put-Through HSX',
            key: Market.HOSE,
            route: BoardMarketRoutes.PUTTHROUGH_HSX,
          },
          {
            title: 'Put-Through HNX',
            key: Market.HNX,
            route: BoardMarketRoutes.PUTTHROUGH_HNX,
          },
          {
            title: 'Put-Through UPCOM',
            key: Market.UPCOM,
            route: BoardMarketRoutes.PUTTHROUGH_UPCOM,
          },
        ],
      });
    }
    if (disableTabFilter.oddlot !== true) {
      // eslint-disable-next-line: no-array-mutation
      vcscBoardTabs.push({
        key: 'Oddlot',
        title: 'Oddlot',
        route: BoardMarketRoutes.ODDLOT_HNX,
        data: [
          {
            title: 'Oddlot - HNX',
            key: Market.HNX,
            route: BoardMarketRoutes.ODDLOT_HNX,
          },
          {
            title: 'Oddlot - UPCOM',
            key: Market.UPCOM,
            route: BoardMarketRoutes.ODDLOT_UPCOM,
          },
        ],
      });
    }
    return vcscBoardTabs;
  }
  if (disableTabFilter.putThrough !== true) {
    // eslint-disable-next-line: no-array-mutation
    masBoardTabs.push({
      key: 'PutThrough',
      title: 'Put-Through 1',
      route: BoardMarketRoutes.PUTTHROUGH_HSX,
      data: [
        {
          title: 'Put-Through HSX',
          key: Market.HOSE,
          route: BoardMarketRoutes.PUTTHROUGH_HSX,
        },
        {
          title: 'Put-Through HNX',
          key: Market.HNX,
          route: BoardMarketRoutes.PUTTHROUGH_HNX,
        },
        {
          title: 'Put-Through UPCOM',
          key: Market.UPCOM,
          route: BoardMarketRoutes.PUTTHROUGH_UPCOM,
        },
      ],
    });
  }
  if (disableTabFilter.oddlot !== true) {
    // eslint-disable-next-line: no-array-mutation
    masBoardTabs.push({
      key: 'Oddlot',
      title: 'Oddlot',
      route: BoardMarketRoutes.ODDLOT_HNX,
      data: [
        {
          title: 'Oddlot - HNX',
          key: Market.HNX,
          route: BoardMarketRoutes.ODDLOT_HNX,
        },
        {
          title: 'Oddlot - UPCOM',
          key: Market.UPCOM,
          route: BoardMarketRoutes.ODDLOT_UPCOM,
        },
      ],
    });
  }
  return masBoardTabs;
}
