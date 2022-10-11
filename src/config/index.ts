/* eslint-disable */
import * as _ from 'lodash';
import * as boardConfig from './board';
import * as scCodecMinBin from 'sc-codec-min-bin';
import { Core, Domain, Lang, SymbolType, WS } from 'constants/enum';
import { IConfig, IHTSEnvironment } from 'interfaces/config';
import { BoardRoutes, Routes } from 'constants/routes';
import AuthEngine from 'utils/authEngine';
import apisConfig from './apis';
import navConfig from './nav';
import { ISelf } from 'interfaces/common';

declare var self: ISelf;

let config: IConfig = {
  isFinishInjected: false,
  disablePt: false,
  disableTabFilter: { oddlot: false, putThrough: false },
  isHideTopMenu: false,
  enableEkyc: false,
  tradingUrl: null,
  indexChartUpdateTime: 1,
  domain: Domain.MAS,
  core: Core.TTL,
  redirect: Routes.BOARD,
  domainGrantType: 'password_otp',
  companyInfo: {
    [Domain.MAS]: {},
  },
  defaultSymbol: {
    code: 'AAA',
    symbolType: SymbolType.STOCK,
  },
  rest: {
    enable: true,
    baseUri: {
      [WS.PRICE_BOARD]: '/rest',
      [WS.WTS]: '/rest',
    },
  },
  apiUrl: {
    baseURI: '/api/v2/',
    sockets: {
      [WS.PRICE_BOARD]: {
        secure: false,
        port: 8000,
        codecEngine: 'socketMinBin',
        authTokenName: 'priceboard.sctoken',
        autoReconnect: true,
      },
      [WS.WTS]: {
        secure: false,
        port: 8000,
        codecEngine: 'socketMinBin',
        authTokenName: 'wts.sctoken',
        autoReconnect: true,
        authEngineOptions: {
          useCookie: true,
          cookieDomain: '.masvn.',
        },
      },
    },
  },
  regex: {
    orderPassword: /^\d{4}$/,
    HTSPassword: /^[^-\s]{8}$/,
    email: /^[a-z][a-z0-9_\.]{5,32}@[a-z0-9]{2,}(\.[a-z0-9]{2,4}){1,2}$/,
    phoneNumber: /^\d{10}$/,
    number: /^[0-9]*$/,
    orderPasswordKBSV: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{7,}$/,
  },
  fetchCount: 40,
  notificationExpirationTime: 604800,
  defaultAvatar:
    'https://tradex-vn.s3-ap-southeast-1.amazonaws.com/avatar/default.png',
  symbolURL:
    'https://tradex-vn.s3.ap-southeast-1.amazonaws.com/market_data/market_data_gzip.json',
  bankInfoURL: '/files/resources/bank_info_data.json',
  tvAdditionalCodeUrl:
    'https://tradex-vn.s3.ap-southeast-1.amazonaws.com/market_data/market_data_additional.json',
  tvResolutions: [
    '1',
    '3',
    '5',
    '10',
    '15',
    '30',
    '60',
    '1D',
    '1W',
    '1M',
    '6M',
  ],
  tvTimeFrames: [
    {
      text: '5y',
      resolution: 'W',
      titles: { en: '5y', ko: '5년', vi: '5y' },
      descs: { en: '5 Years', ko: '5년', vi: '5 Năm' },
    },
    {
      text: '1y',
      resolution: 'D',
      titles: { en: '1y', ko: '1년', vi: '1y' },
      descs: { en: 'Year', ko: '년', vi: '1 Năm' },
    },
    {
      text: '6m',
      resolution: 'D',
      titles: { en: '6m', ko: '6개월', vi: '6m' },
      descs: { en: '6 Months', ko: '6개월', vi: '6 Tháng' },
    },
    {
      text: '3m',
      resolution: '120',
      titles: { en: '3m', ko: '3개월', vi: '3m' },
      descs: { en: '3 Months', ko: '3개월', vi: '3 Tháng' },
    },
    {
      text: '1m',
      resolution: '60',
      titles: { en: '1m', ko: '1개월', vi: '1m' },
      descs: { en: '1 Month', ko: '1개월', vi: '1 Tháng' },
    },
    {
      text: '5d',
      resolution: '5',
      titles: { en: '5d', ko: '5일', vi: '5d' },
      descs: { en: '5 Days', ko: '5일', vi: '5 Ngày' },
    },
    {
      text: '1d',
      resolution: '1',
      titles: { en: '1d', ko: '1일', vi: '1d' },
      descs: { en: '1 Day', ko: '1일', vi: '1 Ngày' },
    },
  ],
  apis: apisConfig,
  boardTabs: boardConfig.masBoardTabs,
  nav: navConfig,
  serviceName: 'wts',
  usernamePrefix: {
    filterBy: 'lang',
    ignoreChar: '077',
    mapValues: {
      [Lang.VI]: '077C',
      [Lang.EN]: '077F',
      '': '077C',
    },
  },
  watchlist: {
    serverSupportAdd: true,
    serverSupportDel: true,
  },
  schedules: {
    refreshBoardOpen: [1, 15],
    refreshBoardClose: [8, 5],
    refreshBoardRange: [-5, 5],
    refreshPage: [1, 30],
    transferTimeStart: [1, 0],
    transferToBankEnd: [9, 0],
    transferToSubEnd: [8, 55],
  },
};

export const env = _.cloneDeep(self.env);
export const htsEnv = _.cloneDeep(self.htsEnv);

export function loadConfig(env: IConfig, hts?: IHTSEnvironment) {
  config.advertise = env.advertise;
  config.domain = env.domain;
  config.disableLogin = env.disableLogin;
  config.disableForeignerIndex = env.disableForeignerIndex;
  config.disableTradingTemplate = env.disableTradingTemplate;
  config.hideAllIndexChart = env.hideAllIndexChart;
  config.isHideTopMenu = env.isHideTopMenu;
  config.enableEkyc = env.enableEkyc;
  config.usernamePrefix = env.usernamePrefix;
  config.boardTabs = boardConfig.adjusByConfig(
    env.disablePt,
    env.disableTabFilter,
    env.domain
  );
  if (hts) {
    config.htsEnv = hts;
  }

  if (env.indexChartConfig) {
    config.indexChartConfig = env.indexChartConfig;
  }

  if (env.cellFlashDelay) {
    config.cellFlashDelay = env.cellFlashDelay;
  }

  if (env.redirect != null) {
    config.redirect = env.redirect;
  }

  if (env.core) {
    config.core = env.core;
  }

  if (env.tradingUrl != null) {
    config.tradingUrl = env.tradingUrl;
  }

  if (env.serviceName) {
    config.serviceName = env.serviceName;
  }

  if (env.domainGrantType) {
    config.domainGrantType = env.domainGrantType;
  }

  if (env.symbolURL) {
    config.symbolURL = env.symbolURL;
  }

  if (env.bankInfoURL) {
    config.bankInfoURL = env.bankInfoURL;
  }

  config.companyInfo = env.companyInfo;
  if (env.rest != null) {
    config.rest = { ...config.rest, ...env.rest };
  }
  config.apiUrl.baseURI = env.apiUrl.baseURI;
  if (env.apiUrl.sockets != null) {
    config.apiUrl.sockets = env.apiUrl.sockets;
  }

  if (env.oneSignalAppId) {
    config.oneSignalAppId = env.oneSignalAppId;
  }

  if (env.regex != null) {
    config.regex = env.regex;
  }

  if (env.fetchCount != null) {
    config.fetchCount = env.fetchCount;
  }
  if (env.hideMarginCall != null) {
    config.hideMarginCall = env.hideMarginCall;
  }
  if (env.assetInfoFollowingDomain != null) {
    config.assetInfoFollowingDomain = env.assetInfoFollowingDomain;
  }
  if (env.hideConfirmDebtProfitFields != null) {
    config.hideConfirmDebtProfitFields = env.hideConfirmDebtProfitFields;
  }

  if (env.indexChartUpdateTime != null) {
    config.indexChartUpdateTime = env.indexChartUpdateTime;
  }

  if (env.notificationExpirationTime != null) {
    config.notificationExpirationTime = env.notificationExpirationTime;
  }

  if (env.defaultAvatar != null) {
    config.defaultAvatar = env.defaultAvatar;
  }

  if (env.languages) {
    config.languages = env.languages;
  }

  if (env.tvTimeFrames != null) {
    config.tvTimeFrames = env.tvTimeFrames;
  }

  if (env.apis != null) {
    Object.keys(env.apis).forEach((apiName) => {
      const current = config.apis[apiName];
      if (current == null) {
        config.apis[apiName] = env.apis[apiName];
      } else {
        config.apis[apiName] = { ...current, ...env.apis[apiName] };
      }
    });
  }

  if (env.watchlist != null) {
    config.watchlist = { ...config.watchlist, ...env.watchlist };
  }
  config.isFinishInjected = true;
  if (env.schedules != null) {
    config.schedules = { ...config.schedules, ...env.schedules };
  }

  if (env.boardTabs != null) {
    config.boardTabs = env.boardTabs;
  }

  if (env.loginUrl != null) {
    config.loginUrl = env.loginUrl;
  }

  if (env.usernamePrefix != null) {
    config.usernamePrefix = env.usernamePrefix;
  }

  if (env.disableTradingTemplate) {
    config.nav = config.nav.map((val) =>
      val.key === 'board-auth'
        ? {
            ...val,
            tab: val.tab.map((tab) =>
              tab.route === BoardRoutes.TRADING_TEMPLATE
                ? {
                    ...tab,
                    hide: true,
                  }
                : tab
            ),
          }
        : val
    );
  }

  return config;
}

export function loadWsConfig(config: IConfig) {
  Object.keys(config.apiUrl.sockets).forEach((name) => {
    const sc = config.apiUrl.sockets[name];
    if (
      sc.codecEngine === 'codecMinBin' ||
      sc.codecEngine === '' ||
      sc.codecEngine == null
    ) {
      sc.codecEngine = scCodecMinBin;
    }
    if (sc.authTokenName == null) {
      sc.authTokenName = `${name}.scToken`;
    }
    if (sc.authEngineOptions != null && sc.authEngine == null) {
      sc.authEngine = new AuthEngine(sc.authEngineOptions);
    }
    sc.authEngineOptions = undefined;
  });
  return config;
}

export default config;
