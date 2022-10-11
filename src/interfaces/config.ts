/* eslint-disable */
import { Core, WS, SymbolType, Domain, Lang, SystemType } from 'constants/enum';
import { IAuthEngineOptions } from 'utils/authEngine';
import {
  IQueryOtpMatrixForKisResponse,
  IVerifyOtpRequest,
  IUpdateWatchListRequest,
} from './api';
import { IQueryOtpMatrixResponse } from 'interfaces/responses/IQueryOtpMatrixResponse';
import { IQueryOtpTypeResponse } from 'interfaces/responses/IQueryOtpTypeResponse';
import { IVerifyOtpResponse } from 'interfaces/responses/IVerifyOtpResponse';
import { IBoardTab, ILocale } from './common';
import { Routes } from 'constants/routes';

export interface ISocketConfig {
  hostname?: string;
  secure?: boolean;
  port?: number;
  codecEngine: string | object;
  authEngine?: object;
  authEngineOptions?: IAuthEngineOptions;
  authTokenName?: string;
  autoReconnect?: boolean;
}

export interface IAPI {
  uri: string;
  useFullUri?: boolean;
  method?: string;
  wsName: string;
  useOtpToken?: boolean;
}

export interface IDAPI<I, R> extends IAPI {}

interface INavbarTab {
  readonly title: string;
  readonly route: string;
  readonly hide?: boolean;
  readonly subTab?: INavbarTab[];
}

export enum INavbarTitle {
  Board = 'Board',
  Account = 'Account',
  Information = 'Information',
}
export enum INavbarTitleVietNamese {
  Board = 'Bảng Giá',
  Account = 'Tài Khoản',
  Information = 'Thông Tin Tài Khoản',
}

export interface INavbar {
  readonly key: string;
  readonly title: INavbarTitle;
  readonly route: string;
  readonly isAuthenticated: boolean;
  readonly systemType?: SystemType;
  readonly tab: INavbarTab[];
  readonly pinned?: boolean;
  readonly hide?: boolean;
}

export interface IConfig {
  htsEnv?: IHTSEnvironment;
  isFinishInjected: boolean;
  domain: Domain;
  domainGrantType: 'password_otp' | 'password';
  core: Core;
  indexChartUpdateTime: number;
  redirect?: Routes;
  disableLogin?: boolean;
  disableForeignerIndex?: boolean;
  disablePt: boolean;
  disableTabFilter: {
    oddlot: boolean;
    putThrough: boolean;
  };
  isHideTopMenu: boolean;
  disableTradingTemplate?: boolean;
  hideMarginCall?: boolean;
  assetInfoFollowingDomain?: string;
  hideConfirmDebtProfitFields?: boolean;
  hideAllIndexChart?: boolean;
  cellFlashDelay?: number;
  tradingUrl: string | null;
  serviceName: string;
  indexChartConfig?: {
    time: {
      [market: string]: {
        fromTime: number[];
        toTime: number[];
      };
    };
  };
  enableEkyc: boolean;
  advertise?: {
    url: string;
    adsVersion: string;
    isShow: boolean;
  };
  companyInfo: {
    [s: string]: {
      companyName?: string;
      companyAddress?: string;
      phone?: string;
      email?: string;
      fax?: string;
      caPlugin?: {
        window?: string;
        macOS?: string;
      };
      caLicense?: string;
      slogan?: string;
      socialUrl?: string;
      hyperlink?: { [s: string]: { [l in Lang]?: string } };
    };
  };
  defaultSymbol: {
    code: string;
    symbolType: SymbolType;
  };
  rest: {
    enable: boolean;
    baseUri: {
      [WS.PRICE_BOARD]?: string;
      [WS.WTS]?: string;
      [WS.TTL]?: string;
    };
  };
  apiUrl: {
    baseURI: string;
    sockets: {
      [WS.PRICE_BOARD]: ISocketConfig;
      [WS.WTS]: ISocketConfig;
    };
  };
  regex: {
    orderPassword: RegExp;
    HTSPassword: RegExp;
    email: RegExp;
    phoneNumber: RegExp;
    number: RegExp;
    orderPasswordKBSV: RegExp;
  };
  languages?: ILocale[];
  fetchCount: number;
  notificationExpirationTime: number;
  defaultAvatar: string;
  symbolURL: string;
  bankInfoURL: string;
  oneSignalAppId?: string;
  tvAdditionalCodeUrl?: string;
  tvResolutions: string[];
  tvTimeFrames: {
    text: string;
    resolution: string;
    titles?: { [key: string]: string };
    descs?: { [key: string]: string };
  }[];
  apis: {
    symbolList: IAPI;
    symbolInfoLatest: IAPI;
    symbolOddlotLatest: IAPI;
    notifyOtp: IAPI;
    locale: IAPI;
    symbolMinutes: IAPI;
    symbolLatest: IAPI;
    symbolQuote: IAPI;
    indexStockList: IAPI;
    sessionStatus: IAPI;
    lastTradingDate: IAPI;
    putthroughDeal: IAPI;
    putthroughDealTotal: IAPI;
    putthroughAdvertise: IAPI;

    queryEquityPortfolio: IAPI;
    queryDerivativesPortfolio: IAPI;
    queryDerivativesSummary: IAPI;
    queryStockTransfer: IAPI;
    queryStockTransferHistory: IAPI;
    submitStockTransfer: IAPI;
    equityAssetInformation: IAPI;
    equityAssetInfoMarginCallBy: IAPI;
    equityAccountOpenPositionItem: IAPI;
    equityAccountRealizedPortfolio: IAPI;
    equityQueryStockInfo: IAPI;
    equityQueryMaxQty: IAPI;
    derivativesQueryMaxQty: IAPI;

    equityPlaceOrder: IAPI;
    equityModifyOrder: IAPI;
    equityCancelOrder: IAPI;
    derivativesPlaceOrder: IAPI;
    derivativesModifyOrder: IAPI;
    derivativesCancelOrder: IAPI;
    placeStopOrder: IAPI;
    modifyStopOrder: IAPI;
    cancelStopOrder: IAPI;
    cancelStopOrderMulti: IAPI;
    speedOrderModifyOrder: IAPI;
    speedOrderCancelOrder: IAPI;
    speedOrderModifySpeedOrder: IAPI;
    speedOrderCancelSpeedOrder: IAPI;

    equityStockTransactionHistory: IAPI;
    equityOrderHistory: IAPI;
    derivativeOrderHistory: IAPI;
    stopOrderHistory: IAPI;
    equityCashStatement: IAPI;
    equityTransactionhistory: IAPI;
    derivativesCashStatement: IAPI;
    equityLoanStatement: IAPI;
    equityInterestExpenseStatement: IAPI;
    equityConfirmDebt: IAPI;
    submitConfirmDebt: IAPI;
    equityOrderBook: IAPI;
    equityOrderBookDetail: IAPI;
    derivativeOrderBookDetail: IAPI;
    equityRightSubscriptions: IAPI;
    equityRightInformation: IAPI;
    equityRightSubsHistory: IAPI;
    equityRightInforOnPopUp: IAPI;
    rightInforResgisterPost: IAPI;
    equityCashAdvanced: IAPI;
    equityCashAdvancedHistory: IAPI;
    equityCashAdvancedAmount: IAPI;
    equityCashAdvancedPayment: IAPI;
    equityCashAdvancedPaymentTime: IAPI;
    queryPositionStatement: IAPI;
    equityOrderConfirmation: IAPI;
    equityOrderConfirmationSubmit: IAPI;
    derivativesOrderConfirmation: IAPI;
    derivativesOrderConfirmationSubmit: IAPI;
    equityRightSubsciptionsIICA: IAPI;
    equityCalculateInterestAmtIICA: IAPI;

    derivativesOrderBook: IAPI;
    equityCashTransferHistory: IAPI;
    equityTransferableAmount: IAPI;
    equitySubAccount: IAPI;
    equityCashTransferInternal: IAPI;
    equityBankInfo: IAPI;
    equityBankInfoForKis: IAPI;
    derivativesBankInfoForKis: IAPI;
    VSDTransferableAmount: IAPI;
    VSDCashTransfer: IAPI;
    VSDCashTransferHistory: IAPI;
    derivativeCashTransferHistory: IAPI;
    derivativeInternalTransfer: IAPI;
    derivativeBankTransfer: IAPI;

    queryWatchList: IAPI;
    // queryWatchListDetail: IDAPI<IQueryWatchListDetailRequest, IQueryWatchListDetailResponse>;
    updateWatchList: IDAPI<IUpdateWatchListRequest[], object>;
    addWatchList: IDAPI<IUpdateWatchListRequest, object>;
    delWatchList: IDAPI<IUpdateWatchListRequest, object>;
    queryOtpType: IDAPI<object, IQueryOtpTypeResponse>;
    verifyOtpMatrix: IDAPI<IVerifyOtpRequest, IVerifyOtpResponse>;
    queryOtpMatrix: IDAPI<object, IQueryOtpMatrixResponse>;
    queryOtpMatrixforKis: IDAPI<object, IQueryOtpMatrixForKisResponse>;
    changePassword: IAPI;
    changePIN: IAPI;
    clientDetail: IAPI;

    changeLanguage: IAPI;
    queryServerTime: IAPI;
    queryServerTimeForKis: IAPI;

    equityPortfolioIICA: IAPI;
    equityCashAdvancedIICA: IAPI;
    equityCashAdvancedPaymentIICA: IAPI;
    matchingData: IAPI;
    clearCookies: IAPI;
    ekycCheckNationalId: IAPI;
    ekycAdminSendOtp: IAPI;
    ekycAdminVerifyOtp: IAPI;
    ekycAdminEkyc: IAPI;

    verifyIdentity: IAPI;
    resetPassword: IAPI;
  };
  boardTabs: IBoardTab[];
  nav: INavbar[];
  usernamePrefix: {
    filterBy: 'lang';
    ignoreChar: string;
    mapValues: { [s: string]: string };
  };
  watchlist: {
    serverSupportAdd?: boolean;
    serverSupportDel?: boolean;
  };
  schedules: {
    /**
     * Market open time [hour, minute]
     */
    refreshBoardOpen: [number, number];
    /**
     * Market close time [hour, minute]
     */
    refreshBoardClose: [number, number];
    /**
     * Random time range to refresh board [minute, minute]
     */
    refreshBoardRange: [number, number];
    /**
     * Time to reload page [hour, minute]
     */
    refreshPage: [number, number];
    /**
     * Cash transfer start time [hour, minute]
     */
    transferTimeStart: [number, number];
    /**
     * Cash transfer to sub account end time [hour, minute]
     */
    transferToSubEnd: [number, number];
    /**
     * Cash transfer to bank end time [hour, minute]
     */
    transferToBankEnd: [number, number];
  };
  loginUrl?: string;
}

export interface IHTSEnvironment {
  readonly enable: boolean;
}
