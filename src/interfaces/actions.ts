import {
  AccountType,
  ActiveOrderStatus,
  IndexStock,
  Market,
  OrderKind,
  OrderStatus,
  SellBuyType,
  StopOrderStatus,
  StopOrderType,
  SymbolType,
  SystemType,
} from 'constants/enum';
import { BoardMarketRoutes } from 'constants/routes';
import { ICurrentSymbol, IIndexBoardData, INewSymbolData } from './market';
import {
  IDerivativesPlaceOrderParams,
  IEquityPlaceOrderParams,
  IOrderConfirmationParams,
  IParamsEquityOrderHistory,
  IPlaceStopOrderParams,
} from './api';

export interface IQueryLogin {
  readonly username: string;
  readonly password: string;
  readonly session_time_in_minute: number;
  readonly rememberUsername?: boolean;
  readonly lang?: string;
}

export interface IVerifyOTP {
  readonly otpValue?: string;
  readonly otpIndex?: number;
  readonly registerMobileOtp?: boolean;
  readonly mobileOTP?: string;
}

export interface IQueryLogout {
  readonly force?: boolean;
  readonly isSessionTimeout?: boolean;
}

export interface ISymbolInfoModal {
  readonly show: boolean;
  readonly data?: INewSymbolData;
  readonly symbol?: ICurrentSymbol;
}

export interface IEquityPlaceOrderAction {
  readonly data: IEquityPlaceOrderParams | IPlaceStopOrderParams;
  readonly orderKind: OrderKind;
}

export interface IEquityOrderHistory {
  readonly data: IParamsEquityOrderHistory;
}

export interface IDerivativesPlaceOrderAction {
  readonly data: IDerivativesPlaceOrderParams;
  readonly orderKind: OrderKind;
}

export interface IEquityOrderStockInfoAction {
  readonly accountNumber: string;
  readonly accountType: AccountType;
  readonly symbolCode: string;
  readonly market: Market;
  readonly sellBuyType: SellBuyType;
  readonly price: number;
  readonly onlyGetMaxQty?: boolean;
  /**
   * Use for modify order book modal
   */
  readonly isModal?: boolean;
}
export interface IChangeOrderFormHeight {
  readonly height: number;
}

export interface IOrderConfirmationAction extends IOrderConfirmationParams {
  readonly systemType: SystemType;
}

export interface IOrderConfirmationSubmitAction {
  readonly systemType: SystemType;
  readonly accountNumber: string;
  readonly details: Array<{
    readonly orderGroupId?: string;
    readonly refId?: string;
    readonly isHistory: string;
  }>;
}

export interface IOrderBookAction {
  readonly accountNumber: string;
  readonly systemType: SystemType;
  readonly stockSymbol: string;
  readonly sellBuyType?: SellBuyType | 'ALL';
  readonly status: OrderStatus | ActiveOrderStatus;
  readonly validity: string;
  readonly offset?: number;
  readonly fetchCount?: number;
}
export interface IIdentityAction {
  readonly clientID: string;
  readonly idCardNo?: string;
  readonly locale?: string;
  readonly isResendOTP?: boolean;
}
export interface IResetPasswordAction {
  readonly clientID: string;
  readonly otpValue?: string;
  readonly newPassword?: string;
}

export interface IQuerySymbolData {
  readonly symbolList: string[];
  /**
   * VN30/HNX30
   */
  readonly indexStock?: IndexStock;
  readonly symbolType?: SymbolType;
  readonly indexType?: IIndexBoardData['type'];
  readonly isWatchlist?: boolean;
}

export interface IOrderBookDetailAction {
  readonly accountNumber: string;
  readonly orderGroupNo: string;
  readonly type: string;
  readonly orderNumber?: string;
}

export interface IEquityCashAdvancedPaymentAction {
  readonly accountNo: string;
  readonly availableAmount: number;
  readonly submitAmount: number;
  readonly itemSelected?: Array<{
    readonly netSoldAmount?: number;
    readonly mvAvailableAmount?: number;
    readonly value?: number;
    readonly volume?: number;
    readonly feeTax?: number;
    readonly soldDate?: string;
    readonly stock?: string;
    readonly id?: string;
    readonly paymentDate?: string;
    readonly mvSettleDay?: string;
    readonly mvOrderID?: string;
  }>;
}
export interface IPriceBoardAction {
  readonly key?: BoardMarketRoutes;
  readonly selectedSymbol?: string;
}

export interface IStopOrderHistoryAction {
  readonly code?: string;
  readonly sellBuyType?: SellBuyType | 'All';
  readonly status?: StopOrderStatus | 'All';
  readonly orderType?: StopOrderType;
  readonly fromDate?: Date;
  readonly toDate?: Date;
}
