import { IBoardTab, IQueryState } from './common';
import {
  IDerivativesAccountSummaryDetail,
  IDrAccountClosePositionItem,
  IDrAccountOpenPositionItem,
  IEquityEnquiryPortfolioAccountSummaryResponse,
  IEquityEnquiryPortfolioBeanItemResponse,
  ILoanExpenseStatementResponse,
  IMarketPutthroughDealResponse,
  IMarketPutthroughDealTotalResponse,
  IResponseEquityOrderDetail,
} from './api';
import { INewSymbolData } from './market';
import {
  Market,
  OrderKind,
  OrderStatusResponse,
  OrderType,
  SellBuyType,
  StopOrderStatus,
  SystemType,
} from 'constants/enum';

export interface ILoginDomainInfo {
  readonly showOTP: boolean;
  readonly showLogin?: boolean;
  readonly otpIndex?: number;
  readonly registerMobileOtp?: boolean;
  readonly message?: string;
  readonly errorParams?: {
    readonly [s: string]: string;
  };
}

export interface IOtpToken {
  readonly token: string;
  readonly expiryTime: number;
}

export interface IOtpMatrix {
  readonly otpMatrixNumbers: string[];
  readonly otpMatrixKey: number;
}
export interface IOtp {
  // type
  readonly type: IQueryState<string>;

  // matrix
  readonly otpMatrix: IQueryState<IOtpMatrix>;

  // verify result
  readonly otpToken: IQueryState<IOtpToken>;

  // display
  readonly showOtpForm?: boolean;
  readonly otpRememberExpiryTime?: number;
  readonly isValid?: boolean;
}

export interface IOtpSendToNotifyOrSms {
  readonly countDownSeconds: number;
  readonly countSentOtp: number;
  readonly countDownMessage15s: string;
  readonly textBtn?: string;
}

export interface IOrderStockInfo {
  readonly accountNumber: string;
  readonly symbolCode: string;
  readonly market: Market;
  readonly sellBuyType: SellBuyType;
  readonly price: number;
  readonly PP: number;
  readonly marginRatio: number;
  readonly maxQty?: number;
}

export interface IPortfoliosReducer {
  readonly accountNumber: string;
  readonly type: SystemType;
  readonly summary:
    | IEquityEnquiryPortfolioAccountSummaryResponse
    | IDerivativesAccountSummaryDetail;
  readonly portfolioList:
    | IEquityEnquiryPortfolioBeanItemResponse[]
    | IDrAccountOpenPositionItem[];
}

export interface IEquityPortfoliosReducer {
  readonly accountNumber: string;
  readonly type: SystemType;
  readonly summary: IEquityEnquiryPortfolioAccountSummaryResponse;
  readonly portfolioList: IEquityEnquiryPortfolioBeanItemResponse[];
  readonly total?: Partial<IEquityEnquiryPortfolioBeanItemResponse>;
}

export interface IDerivativesPortfoliosReducer {
  readonly accountNumber: string;
  readonly type: SystemType;
  readonly summary: IDerivativesAccountSummaryDetail;
  readonly openPositionList: IDrAccountOpenPositionItem[];
  readonly closePositionList: IDrAccountClosePositionItem[];
  readonly totalOpenPosition?: Partial<IDrAccountOpenPositionItem>;
  readonly totalClosePosition?: Partial<IDrAccountClosePositionItem>;
  readonly minPP?: number;
  readonly minAccountRatio?: number;
}

export interface ILoanExpenseStatementReducer {
  readonly list: ILoanExpenseStatementResponse[];
  readonly total?: Partial<ILoanExpenseStatementResponse>;
}

export interface IMarketPutthroughDealReducer {
  readonly list: IMarketPutthroughDealResponse[];
  readonly total: IMarketPutthroughDealTotalResponse;
}

export interface IOrderBookReducer {
  readonly accountNumber: string;
  readonly symbol: string;
  readonly orderGroupNo?: string;
  readonly channel?: string;
  readonly canceledQty?: number;
  readonly sellBuyType: SellBuyType;
  readonly orderQuantity: number;
  readonly orderPrice: number;
  readonly matchedQuantity: number;
  readonly matchedPrice: number;
  readonly unmatchedQuantity: number;
  readonly orderType: OrderType;
  readonly orderStatus: OrderStatusResponse;
  readonly matchedValue: number;
  readonly orderNumber?: string;
  readonly orderTime: string;
  readonly validity: string;
  readonly modifiable: boolean;
  readonly cancellable: boolean;
  readonly rejectReason?: string;
  readonly marketID?: string;
  readonly commodityName?: string;
  readonly contractMonth?: string;
  readonly orderGroupID: string;
  readonly validityDate?: string;
  readonly position?: string;
  readonly minQty?: number;
  readonly stopType?: string;
  readonly stopPrice?: number;
  readonly tPlus1?: boolean;
  readonly userID?: string;
  readonly stopOrder?: boolean;
  readonly auctionOrder?: boolean;
  readonly conditionOrderGroupID?: string;

  // Stop Order History Response
  readonly stopOrderId?: number;
  readonly code?: string;
  readonly status?: StopOrderStatus;
  readonly createTime?: string;
  readonly cancelTime?: string;
  readonly errorMessage?: string;
  readonly fromDate?: string;
  readonly toDate?: string;
}

export interface IPlaceOrderReducer {
  readonly orderKind: OrderKind;
  readonly sellBuyType?: SellBuyType;
  readonly id?: number;
  readonly orderNumber?: string;
  readonly orderGroupID?: string;
  readonly success?: string;
  readonly message?: string;
  readonly orderDetail?: IResponseEquityOrderDetail;
}

export interface IModifyOrderReducer {
  readonly orderKind: OrderKind;
  readonly sellBuyType?: SellBuyType;
  readonly orderNo?: string;
  readonly orderGroupNo?: string;
  readonly success?: boolean;
  readonly quantity?: number;
  readonly price?: number;
  readonly pendingQty?: number;
  readonly orderId?: string;
  readonly orderGroupId?: string;
}

export interface ICancelOrderReducer {
  readonly orderKind: OrderKind;
  readonly result: Array<{
    readonly orderNo?: string;
    readonly orderGroupNo?: string;
    readonly success: boolean;
    readonly rejectCause?: string;
  }>;
}

export interface IPriceBoardReducer {
  readonly symbol: INewSymbolData[];
  readonly symbolMap: Record<string, INewSymbolData>;
  readonly selectedBoard: IBoardTab;
  readonly selectedSymbol?: INewSymbolData;
}
export interface IOrderConfirmationSubmitReducer {
  readonly result?: string;
  readonly success: boolean;
  readonly returnCode?: number;
  readonly message?: string;
}
