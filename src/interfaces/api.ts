import {
  ActiveOrderStatus,
  CashTransferStatus,
  Market,
  OrderStatus,
  OrderStatusResponse,
  OrderType,
  SellBuyType,
  StockTransferHisStatus,
  StopOrderStatus,
  StopOrderType,
  SystemType,
  TransferType,
  TransferTypeResponse,
} from 'constants/enum';
import { IParams } from './common';

export interface ISymbolLatestParams {
  readonly symbolList: string[];
}

export interface IParamsIndexStockList extends IParams {
  readonly indexCode: string;
}

export interface IParamsQueryIndexMinutes extends IParams {
  readonly symbol: string;
  readonly minuteUnit: number;
  readonly fromTime: string;
  readonly toTime: string;
  readonly fetchCount: number;
}

export interface IMarketPutthroughDealRequest {
  readonly marketType: Market | 'ALL';
  readonly offset?: number;
  readonly fetchCount?: number;
}

export interface IMarketPutthroughDealResponse {
  /**
   * Symbol code
   */
  readonly s: string;
  /**
   * Time (yyyyMMddhhmmss)
   */
  readonly t: string;
  /**
   * Matched Price
   */
  readonly mp: number;
  /**
   * Matched Volume
   */
  readonly mvo: number;
  /**
   * Matched Value
   */
  readonly mva: number;
  /**
   * Put Through Volume
   */
  readonly pvo: number;
  /**
   * Put Through Value
   */
  readonly pva: number;
  /**
   * Market
   */
  readonly m: string;
  /**
   * Reference price
   */
  readonly re?: number;
  /**
   * Ceiling price
   */
  readonly ce?: number;
  /**
   * Floor price
   */
  readonly fl?: number;
}

export interface IMarketPutthroughAdvertiseRequest {
  readonly marketType: Market | 'ALL';
  readonly sellBuyType: SellBuyType | 'ALL';
  readonly offset?: number;
  readonly fetchCount?: number;
}

export interface IMarketPutthroughAdvertiseResponse {
  /**
   * Symbol Code
   */
  readonly s: string;
  /**
   * Time (yyyyMMddhhmmss)
   */
  readonly t: string;
  /**
   * Sell Buy Type
   */
  readonly sb: SellBuyType;
  /**
   * Price
   */
  readonly p: number;
  /**
   * Volume
   */
  readonly v: number;
  /**
   * Market
   */
  readonly m: string;
  /**
   * Reference price
   */
  readonly re?: number;
  /**
   * Ceiling price
   */
  readonly ce?: number;
  /**
   * Floor price
   */
  readonly fl?: number;
}

export interface IParamsLogin extends IParams {
  readonly grant_type: 'password' | 'password_otp' | 'access_domain';
  readonly client_id: string;
  readonly client_secret: string;
  readonly session_time_in_minute: number;
  readonly sec_code?: string;
  readonly username?: string;
  readonly password?: string;
  readonly platform?: 'web' | 'mobile' | 'hts';
  readonly access_token?: string;
  readonly domain?: string;
}

export interface IEquityPlaceOrderParams {
  readonly accountNumber: string;
  readonly sellBuyType: SellBuyType;
  readonly code: string;
  readonly expiryDate?: string;
  readonly marketType: Market;
  readonly orderType: OrderType | StopOrderType;
  readonly orderPrice: number;
  readonly orderQuantity: number;
}

export interface IPlaceStopOrderParams {
  readonly accountNumber: string;
  readonly code: string;
  readonly orderQuantity: number;
  readonly sellBuyType: SellBuyType;
  readonly orderType: StopOrderType;
  readonly stopPrice: number;
  readonly orderPrice?: number;
  readonly fromDate: string;
  readonly toDate: string;
}

export interface IPlaceStopOrderResponse {
  readonly id: number;
}

export interface IModifyStopOrderParams {
  readonly stopOrderId: number;
  readonly orderQuantity: number;
  readonly stopPrice: number;
  readonly orderPrice: number | null;
  readonly fromDate: string;
  readonly toDate: string;
}

export interface IModifyStopOrderResponse {
  readonly success: boolean;
}

export interface ICancelStopOrderParams {
  readonly stopOrderId: number;
}
export interface ICancelStopOrderMultiParams {
  readonly idList: string[];
}

export interface ICancelStopOrderResponse {
  readonly success: boolean;
}

export interface ICashStatementRequest extends IParams {
  readonly accountNo: string;
  readonly transactionType?: string;
  readonly fromDate: string;
  readonly toDate: string;
}
export interface ITransactionHistoryParams extends IParams {
  readonly subAccountID?: string;
  readonly fromDate?: string;
  readonly toDate?: string;
  readonly txnType?: string;
  readonly language?: string;
}

export interface IParamsEquityLoanStatement extends IParams {
  readonly accountNo?: string;
  readonly fromDate?: string;
  readonly toDate?: string;
  readonly start?: number;
  readonly limit?: number;
}

export interface IParamsEquityConfirmDebt extends IParams {
  readonly accountNumber: string;
  readonly historyBy: number;
  readonly signed: boolean;
}

export interface IEquityConfirmDebtResponse {
  readonly accountNumber: string;
  readonly beginningBalance: number;
  readonly additionalDisbursement: number;
  readonly repaymentAmount: number;
  readonly endingBalance: number;
  readonly outstandingInterest: number;
  readonly outstandingDept: number;
  readonly originalOutstanding: number;
  readonly status: boolean;
  readonly dateConfirm: string;
  readonly signable: boolean;
  readonly applicationID: string;
  readonly applicationDate: string;
}

export interface ISubmitConfirmDebt {
  readonly accountNumber: string;
  readonly endingBalance: number;
  readonly outstandingInterest: number;
  readonly status: boolean;
  readonly dateConfirm: string;
  readonly signable: boolean;
  readonly applicationID: string;
  readonly applicationDate: string;
}
export interface IConfirmDebtResponse {
  readonly mainResult: string;
}
export interface IParamsEquityOrderHistory {
  readonly accountNo?: string;
  readonly fromDate?: string;
  readonly toDate?: string;
  readonly sellBuyType?: string;
  readonly stockSymbol?: string;
  readonly status?: string;
  readonly validity?: string;
  readonly offset?: number;
  readonly fetchCount?: number;
}

export interface IDrOrderHistoryParams {
  readonly accountNumber: string;
  readonly fromDate?: string;
  readonly toDate?: string;
  readonly status: string[];
  readonly code?: string;
  readonly sellBuyType?: string;
  readonly offset?: number;
  readonly fetchCount?: number;
}

export interface IDrOrderHistoryResponse {
  readonly accountNumber: string;
  readonly symbol: string;
  readonly sellBuyType: string;
  readonly orderQuantity: number;
  readonly orderPrice: number;
  readonly matchedQuantity: number;
  readonly matchedPrice: number;
  readonly unmatchedQuantity: number;
  readonly orderType: string;
  readonly orderStatus: string;
  readonly matchedValue: number;
  readonly orderNumber: string;
  readonly orderTime: string;
  readonly validity: string;
  readonly modifiable: boolean;
  readonly cancellable: boolean;
  readonly rejectReason: string;
  readonly commodityName: string;
  readonly contractMonth: string;
  readonly transactionFee: number;
  readonly tax: number;
  readonly date: string;
  readonly time: string;
  readonly channel: string;
  readonly volume: number;
}
export interface IParamsEquityStockTransactionHistory {
  readonly accountNumber?: string;
  readonly fromDate: string;
  readonly toDate: string;
  readonly offset?: number;
  readonly fetchCount?: number;
}

export interface IParamsChangePassword extends IParams {
  readonly clientID?: string;
  readonly oldPassword?: string;
  readonly newPassword?: string;
  readonly currentPassword?: string;
}
export interface IParamsEquitySellable extends IParams {
  readonly accountNumber?: string;
  readonly subNumber?: string;
  readonly date?: string;
  readonly stockCode?: string;
  readonly fetchCount?: number;
}

export interface IDerivativesPlaceOrderParams {
  readonly code: string;
  readonly orderType: OrderType | StopOrderType;
  readonly orderPrice: number;
  readonly sellBuyType: SellBuyType;
  readonly accountNumber: string;
  readonly orderQuantity: number;
  readonly validity?: string;
  readonly expiryDate?: string;
}

export interface IEquityPlaceOrderResponse {
  readonly orderNumber: string;
  readonly orderGroupID: string;
  readonly success: string;
  readonly message: string;
  readonly orderDetail: IResponseEquityOrderDetail;
}

export interface IResponseEquityOrderDetail {
  readonly clientID: string;
  readonly tradingAccSeq: string;
  readonly subAccountID: string;
  readonly shortName: string;
  readonly branchID: string;
  readonly orderID: string;
  readonly orderGroupID: string;
  readonly instrumentID: string;
  readonly instrumentName: string;
  readonly bs: string;
  readonly qty: string;
  readonly msQty: string;
  readonly ccy: string;
  readonly clientBaseCcy: string;
  readonly price: string;
  readonly origin: string;
  readonly hedge: string;
  readonly shortSell: string;
  readonly allOrNothing: string;
  readonly timeInForce: string;
  readonly orderType: string;
  readonly stopOrderType: string;
  readonly stopPrice: string;
  readonly goodTillDate: string;
  readonly activationDate: string;
  readonly holdAmText: string;
  readonly batchOrderID: string;
  readonly bankID: string;
  readonly bankACID: string;
  readonly userApprovalRemark: string;
  readonly fees: object[];
}

export interface IDerivativesPlaceOrderResponse {
  readonly orderNumber: string;
}

export interface IEquityEnquiryPortfolioPerSubAccResponse {
  readonly accountNumber: string;
  readonly summary: IEquityEnquiryPortfolioAccountSummaryResponse;
  readonly portfolioList: IEquityEnquiryPortfolioBeanItemResponse[];
  // readonly total: ITotalPerSubItem;
}

export interface IDerivativesPortfolioResponse {
  readonly accountSummary: IDerivativesAccountSummaryDetail;
  readonly portfolioAssessment: IPortfolioAssessment;
  readonly cashInformation: ICashInformation;
}
export interface IDerivativesAccountSummaryDetail {
  readonly totalStockMarketValue: number;
  readonly dailyPL: number;
  readonly cashBalance: number;
  readonly liability: string;
  readonly netAssetValue: number;
  readonly PP: number;
  readonly totalEquity: number;
  readonly accountBalance: number;
  readonly commission_tax: string;
  readonly interest: number;
  readonly extLoan: number;
  readonly deliveryAmount: number;
  readonly floatingPL_tradingPL: string;
  readonly totalPL: number;
  readonly minReserve: number;
  readonly marginable: number;
  readonly rcCall: number;
  readonly cash_nonCash: string;
  readonly totalAsset?: number;
}
export interface IPortfolioAssessment {
  readonly internal: IPortfolioAssessmentInternal;
  readonly exchange: IPortfolioAssessmentExchange;
}
export interface ICashInformation {
  readonly internal: ICashInformationInternal;
  readonly exchange: ICashInformationExchange;
}
export interface IPortfolioAssessmentInternal {
  readonly initialMargin: number;
  readonly spreadMargin: number;
  readonly deliveryMargin: number;
  readonly marginReq: number;
  readonly accountRatio: number;
  readonly warning123: string;
  readonly marginCall: number;
}
export interface IPortfolioAssessmentExchange {
  readonly initialMargin: number;
  readonly spreadMargin: number;
  readonly deliveryMargin: number;
  readonly marginReq: number;
  readonly accountRatio: number;
  readonly warning123: string;
  readonly marginCall: number;
}
export interface ICashInformationInternal {
  readonly cash: number;
  readonly totalValue: number;
  readonly cashWithdrawable: number;
}
export interface ICashInformationExchange {
  readonly cash: number;
  readonly totalValue: number;
  readonly cashWithdrawable: number;
}

export interface IDerivativesPortfolioPositionResponse {
  readonly openPositionList: IDrAccountOpenPositionItem[];
  readonly closePositionList: IDrAccountClosePositionItem[];
  readonly accountNo: string;
}

export interface IDrAccountOpenPositionItem {
  readonly seriesID: string;
  readonly expiredDate: string;
  readonly long: number;
  readonly short: number;
  readonly averageBid: number;
  readonly averageAsk: number;
  readonly marketPrice: number;
  readonly floatingPL: number;
}
export interface IDrAccountClosePositionItem {
  readonly seriesID: string;
  readonly expiredDate: string;
  readonly long: number;
  readonly short: number;
  readonly averageBid: number;
  readonly averageAsk: number;
  readonly marketPrice: number;
  readonly tradingPL: number;
}

export interface IEquityCashStatementResponse {
  readonly list: IEquityCashStatementList[];
  readonly sumCreditAmount: number;
  readonly sumDebitAmount: number;
  readonly beginningBalance: number;
  readonly endingBalance: number;
}

export interface IEquityCashStatementList {
  readonly no?: number | string;
  readonly date?: string;
  readonly transactionType?: string;
  readonly description?: string;
  readonly creditAmount?: number;
  readonly debitAmount?: number;
  readonly balance: number;
}

export interface IDerivativesCashStatementResponse {
  readonly list?: IDerivativesCashStatementList[];
  readonly beginningBalance?: {
    readonly cashAtMasBalance: string;
    readonly cashAtVSDBalance: string;
    readonly totalBalance: string;
  };
  readonly endingBalance?: string;
}
export interface ITransactionHistoryResponse {
  readonly listTransactionHistory: IDrCashStatementItemResponse[];
  readonly beginningBalance?: number;
  readonly endingBalance?: string;
  readonly total?: string;
}

export interface IDrCashStatementItemResponse {
  readonly creationTime: string;
  readonly valueDate: string;
  readonly counterPartyAC: string;
  readonly remarks: string;
  readonly tranType: string;
  readonly txnType: string;
  readonly clientCredit: number;
  readonly clientDebit: number;
  readonly brokerCredit: number;
  readonly brokerDebit: number;
  readonly totalBalance: number;
}

export interface IDerivativesCashStatementList {
  readonly date: string;
  readonly transactionType: string;
  readonly description: string;
  readonly cashAtMasDebit: number;
  readonly cashAtMasCredit: number;
  readonly cashAtMasBalance: string;
  readonly cashAtVSDDebit: number;
  readonly cashAtVSDCredit: number;
  readonly cashAtVSDBalance: string;
  readonly totalBalance: number;
}

export interface ISecuritiesStatementList {
  readonly orderNo: string;
  readonly transactionDate: string;
  readonly stock: string;
  readonly action: string;
  readonly creditQty: number;
  readonly creditAvgPrice: number;
  readonly creditAmount: number;
  readonly debitQty: number;
  readonly debitAvgPrice: number;
  readonly debitAmount: number;
  readonly fee: string;
  readonly tax: string;
  readonly feeTax: number;
  readonly description: string;
}

export interface ISecuritiesStatementResponse {
  readonly totalCount: number;
  readonly list: ISecuritiesStatementList[];
}

export interface IOrderHistoryResponse {
  readonly accountNo: string;
  readonly symbol: string;
  readonly sellBuyType: string;
  readonly orderQty: number;
  readonly orderPrice: number;
  readonly matchedQty: number;
  readonly matchedPrice: number;
  readonly unmatchedQty: number;
  readonly orderType: string;
  readonly orderStatus: string;
  readonly matchedValue: number;
  readonly transactionFee: string;
  readonly tax: string;
  readonly orderNo: string;
  readonly orderTime: string;
  readonly validity: string;
}
export interface ILoanStatementResponse {
  readonly no: string;
  readonly date: string;
  readonly beginningOutstandingLoan: number;
  readonly newDebtIncrease: number;
  readonly paidAmountDecrease: number;
  readonly totalDebt: number;
  readonly marginCall: number;
  readonly forceSell: number;
}

export interface IDebtMarginResponse {
  readonly content: string;
  readonly transactionAmount?: number;
}

export interface ILoanContractResponse {
  readonly no?: string;
  readonly date?: string;
  readonly beginningOutstandingLoan?: number;
  readonly newDebtIncrease?: number;
  readonly paidAmountDecrease?: number;
  readonly totalDebt?: number;
  readonly marginCall?: number;
  readonly forceSell?: number;
}

export interface ILoanExpenseStatementRequest extends IParams {
  readonly accountNumber: string;
  readonly fromDate: string;
  readonly toDate: string;
}

export interface ILoanExpenseStatementResponse {
  readonly accountNumber: string;
  readonly tradingAccSeq: string;
  readonly tranDate: string;
  readonly loanD: string;
  readonly cManualReserve: string;
  readonly debitInterest: number;
  readonly advanceAvailable: string;
  readonly interestRate: string;
  readonly accruedInterestAmount: string;
}

export interface IEquityEnquiryPortfolioAccountSummaryResponse {
  readonly netAssetValue: number;
  readonly marketValue: number;
  readonly totalStockMarketValue: number;
  readonly marginRatio: number;
  readonly PP: number;
  readonly cashBalance: number;
  readonly profitLoss: number;
  readonly profitLossPercent: number;
  readonly liability: string;
  readonly dailyPL: number;
  readonly totalEquity?: number;
  readonly totalAsset?: number;
}
export interface IEquityEnquiryPortfolioBeanItemResponse {
  readonly symbol: string;
  readonly totalVol: number;
  readonly sellable: number;
  readonly holdToSell: number;
  readonly boughtT0: number;
  readonly boughtT1: number;
  readonly boughtT2: number;
  readonly mortgage: number;
  readonly hold: string;
  readonly right: number;
  readonly awaitTrading: number;
  readonly avgPrice: number;
  readonly value: number;
  readonly marketPrice: number;
  readonly dayChangeValue: number | string;
  readonly dayChangePercent: number | string;
  readonly marketValue: number;
  readonly lendingRate: number;
  readonly unrealizedPLValue: number;
  readonly unrealizedPLPercent: number;
  readonly others: number;
  readonly weight: string;
}
export interface ITotalPerSubItem {
  readonly totalValue: number;
  readonly totalUnrealizedPL: number;
  readonly totalMarketValue: number;
  readonly totalWeight: string;
}
export interface ISymbolQuoteParams {
  readonly symbol: string;
  readonly lastTradingVolume?: number;
  readonly fetchCount: number;
}

export interface IStockTransferParams {
  readonly accountNo: string;
}

export interface IStockTransferResponse {
  readonly stockSymbol: string;
  readonly stockType: string;
  readonly availableVolume: number;
  readonly marketID: string;
}

export interface IStockTransferHistoryParams {
  readonly accountNumber: string;
  readonly fromDate: string;
  readonly toDate: string;
  readonly symbol: string;
  readonly status?: StockTransferHisStatus;
  readonly offset?: number;
  readonly fetchCount?: number;
}

export interface IStockTransferHistoryResponse {
  readonly symbol: string;
  readonly stockType: string;
  readonly requestTime: string;
  readonly senderAccount: string;
  readonly receiverAccount: string;
  readonly volume: number;
  readonly status: StockTransferHisStatus;
}

export interface IStockTransferSubmitParams {
  readonly senderAccountNo: string;
  readonly receiverAccountNo: string;
  readonly stockSymbol: string;
  readonly transferVolume: number;
  readonly marketID: string;
}

export interface IStockTransferSubmitResponse {
  readonly result: string;
  readonly tranID: string;
}

export interface IStockTransferTimeResponse {
  readonly result: string;
}

export interface IAssetInformationParams {
  readonly accountNumber: string;
}
export interface IAssetInformationResponse {
  readonly accountSummary: Partial<IEquityAssetInfoAccountSummaryResponse>;
  readonly buyingPower: Partial<IEquityAssetInfoBuyingPowerResponse>;
  readonly cashInformation: Partial<IEquityAssetInfoCashInfoResponse>;
  readonly fee: IEquityAssetInfoFeeResponse;
  readonly margin: IEquityAssetInfoMarginResponse;
  readonly marginCallBy: IEquityAssetInfoMarginCallByResponse;
  readonly total: ITotalStockMarketValueResponse;
}

export interface ITotalStockMarketValueResponse {
  readonly marketValue: number;
}
export interface IEquityAssetInfoMarginCallByResponse {
  readonly marginCallByStockMainAmount: number;
  readonly marginCallByCash: number;
  readonly buyingPower?: number;
  readonly buyingPowerByCashSubM?: number;
  readonly withdrawable?: number;
  readonly readonlyavailableAdvance?: number;
  readonly holdForPendingPurchase?: number;
  readonly holdForExecutedPurchase?: number;
  readonly outstandingLoan?: number;
  readonly marginCall?: number;
  readonly deposit?: number;
  readonly sellingStockOutMarginPortfolio?: number;
  readonly availablePowerToExerciseRight?: number;
}
export interface IEquityAssetInfoAccountSummaryResponse {
  readonly totalAsset: string;
  readonly totalStockMarketValue: number;
  readonly cashBalance: string;
  readonly loan: string;
  readonly pendingCashDividendCW: string;
  readonly netInterestFee: string;
  readonly netAssetValue: number;
}

export interface IEquityAssetInfoBuyingPowerResponse {
  readonly extraCredit: string;
  readonly nonMarginPurchasingPower: string;
  readonly purchasingPower: number;
}

export interface IEquityAssetInfoCashInfoResponse {
  readonly cashWithdrawal: number;
  readonly pendingApprovalForWithdrawal: number;
  readonly holdForPendingPurchaseT0: string;
  readonly holdForExecutedPurchaseT0: number;
  readonly executedPurchaseT1: string;
  readonly availableAdvancedCash: number;
  readonly soldT0: number;
  readonly soldT1: number;
  readonly accuredCreditInterest: string;
}

export interface IEquityAssetInfoFeeResponse {
  readonly pendingFee: string;
}

export interface IEquityAssetInfoMarginResponse {
  readonly fixedLoan: string;
  readonly dayLoan: string;
  readonly accuredDebitInterest: string;
  readonly stockMain: number;
  readonly equity: number;
  readonly marginRatio: string;
  readonly maintenanceRatio: string;
  readonly marginInterestRate: string;
}
export interface IEquityOrderStockInfoParams {
  readonly accountNumber: string;
  readonly symbolCode: string;
  readonly market: Market;
  readonly sellBuyType: SellBuyType;
}

export interface IEquityOrderStockInfoResponse {
  readonly PP: number;
  readonly marginRatio: number;
}

export interface IEquityOrderMaxQtyParams {
  readonly accountNo: string;
  readonly symbolCode: string;
  readonly market: Market;
  readonly price: number;
  readonly sellBuyType: SellBuyType;
  readonly PP: number;
}

export interface IEquityOrderMaxQtyResponse {
  readonly maxQtty: number;
}

export interface IDerivativesOrderMaxQtyParams {
  readonly accountNumber: string;
  readonly symbolCode: string;
  readonly sellBuyType: SellBuyType;
  readonly price: number;
}

export interface IDerivativesOrderMaxQtyResponse {
  readonly maxLong: number;
  readonly maxShort: number;
}

export interface IIdentityParams {
  readonly clientID: string;
  readonly idCardNo?: string;
  readonly locale?: string;
}
export interface IResetPasswordParams {
  readonly clientID: string;
  readonly otpValue?: string;
  readonly newPassword?: string;
}
export interface IEquityOrderBookParams {
  readonly accountNo: string;
  readonly stockSymbol: string;
  readonly sellBuyType?: SellBuyType | 'ALL';
  readonly status: OrderStatus | ActiveOrderStatus;
  readonly validity?: string;
  readonly offset?: number;
  readonly fetchCount?: number;
}

export interface IDerivativesOrderBookParams {
  readonly accountNumber: string;
  readonly stockSymbol: string;
  readonly sellBuyType?: SellBuyType | 'ALL';
  readonly status: OrderStatus | ActiveOrderStatus;
  readonly validity: string;
  readonly offset?: number;
  readonly fetchCount: number;
}

export interface IEquityOrderBookResponse {
  readonly accountNo: string;
  readonly symbol: string;
  readonly buySellOrder: SellBuyType;
  readonly orderQty: number;
  readonly orderPrice: number;
  readonly matchedQty: number;
  readonly unmatchedQty: number;
  readonly matchedPrice: number;
  readonly orderType: OrderType;
  readonly orderStatus: OrderStatusResponse;
  readonly matchedValue: number;
  readonly orderNo: string;
  readonly orderGroupNo: string;
  readonly orderGroupID: string;
  readonly orderTime: string;
  readonly validity: string;
  readonly modifiable: boolean;
  readonly cancellable: boolean;
  readonly channel: string;
  readonly canceledQty: number;
  readonly rejectReason?: string;
}

export interface IVerifyIdentityResponse {
  readonly matrixKey?: string;
  readonly verificationExpiresAt?: string;
  readonly isCountDown?: boolean;
  readonly countDownMessage?: string;
  readonly seconds?: number;
}

export interface IDerivativesOrderBookResponse {
  readonly accountNumber: string;
  readonly symbol: string;
  readonly sellBuyType: SellBuyType;
  readonly orderQuantity: number;
  readonly orderPrice: number;
  readonly matchedQuantity: number;
  readonly matchedPrice: number;
  readonly unmatchedQuantity: number;
  readonly orderType: OrderType;
  readonly orderStatus: OrderStatusResponse;
  readonly matchedValue: number;
  readonly orderNumber: string;
  readonly orderTime: string;
  readonly validity: string;
  readonly modifiable: boolean;
  readonly cancellable: boolean;
  readonly rejectReason: string;
  readonly marketID: string;
  readonly commodityName: string;
  readonly contractMonth: string;
  readonly orderGroupID: string;
  readonly validityDate: string;
  readonly position: string;
  readonly minQty: number;
  readonly stopType: string;
  readonly stopPrice: number;
  readonly tPlus1: boolean;
  readonly userID: string;
  readonly stopOrder: boolean;
  readonly auctionOrder: boolean;
  readonly conditionOrderGroupID: string;
}

export interface IEquityOrderBookListResponse {
  readonly beanList: IEquityOrderBookResponse[];
}

export interface IOrderBookDetailResponse {
  readonly time: string;
  readonly orderID: string;
  readonly action: string;
  readonly price: number;
  readonly quantity: number;
  readonly status: string;
  readonly remark: string;
}

export interface IEquityOrderBookDetailParams {
  readonly accountNumber: string;
  readonly orderGroupNo: string;
}

export interface IDerivativeOrderBookDetailParams {
  readonly accountNumber: string;
  readonly orderGroupID: string;
  readonly orderID?: string;
  readonly isHistory?: boolean;
}
export interface IEquityModifyOrderParams {
  readonly accountNo: string;
  readonly orderNo: string;
  readonly orderGroupNo: string;
  readonly newPrice: number;
  readonly newQuantity: number;
  readonly stockSymbol: string;
  readonly market: string;
  readonly originalQuantity: number;
}

export interface IEquityModifyOrderResponse {
  readonly orderNo: string;
  readonly orderGroupNo: string;
  readonly success: boolean;
  readonly quantity: number;
  readonly price: number;
  readonly pendingQty: number;
}

export interface IEquityCancelOrderParams {
  readonly accountNo: string;
  readonly orders: Array<{
    readonly orderNo: string;
    readonly orderGroupNo: string;
  }>;
}

export interface IEquityCancelOrderResponse {
  readonly orderNo: string;
  readonly orderGroupNo: string;
  readonly success: boolean;
  readonly rejectCause: string;
}

export interface IDerivativesModifyOrderParams {
  readonly accountNumber: string;
  readonly orderQty: number;
  readonly orderPrice: number;
  readonly orderInfo: Pick<
    IDerivativesOrderBookResponse,
    | 'marketID'
    | 'symbol'
    | 'commodityName'
    | 'contractMonth'
    | 'orderNumber'
    | 'validity'
    | 'orderType'
    | 'orderGroupID'
    | 'sellBuyType'
    | 'conditionOrderGroupID'
    | 'validityDate'
    | 'matchedQuantity'
    | 'position'
    | 'minQty'
    | 'stopType'
    | 'stopPrice'
    | 'tPlus1'
    | 'userID'
    | 'stopOrder'
    | 'auctionOrder'
  >;
}

export interface IDerivativesModifyOrderResponse {
  readonly orderId: string;
  readonly orderGroupId: string;
}

export interface IDerivativesCancelOrderParams {
  readonly accountNumber: string;
  readonly orderInfo: Array<
    Pick<
      IDerivativesOrderBookResponse,
      | 'marketID'
      | 'commodityName'
      | 'contractMonth'
      | 'orderNumber'
      | 'validity'
      | 'orderType'
      | 'validityDate'
      | 'orderGroupID'
      | 'sellBuyType'
    > & {
      readonly symbolCode: string;
    }
  >;
}

export interface IDerivativesCancelOrderResponse {
  readonly orderGroupNo: string;
  readonly success: boolean;
  readonly orderNo: string;
  readonly rejectCause: string;
}

export interface IEquityRightSubscriptionsResponse {
  readonly symbol: string;
  readonly rightType: string;
  readonly closedDate: string;
  readonly exerciseDate: string;
  readonly qtyAtClosedDate: number;
  readonly ratio: number;
  readonly receivableCash: number;
  readonly rightStock: string;
  readonly receivableQty: number;
  readonly status: string;
  readonly parValue: number;
}
export interface IEquityRightSubscriptionsParams {
  readonly accountNo: string;
  readonly symbol: string;
  readonly status?: string;
  readonly fromDate?: string;
  readonly toDate?: string;
  readonly offset?: number;
  readonly fetchCount?: number;
}

export interface IEquityRightInformationParams {
  readonly accountNumber: string;
  readonly offset?: number;
  readonly fetchCount?: number;
}

export interface IEquityRightInformationResponse {
  readonly symbol: string;
  readonly ratioLeft: number;
  readonly ratioRight: number;
  readonly offeringPrice: number;
  readonly rightStock: string;
  readonly closedDate: string;
  readonly lastRegistrationDateLeft: string;
  readonly lastRegistrationDateRight: string;
  readonly lastTransferDateLeft: string;
  readonly lastTransferDateRight: string;
  readonly qtyAtClosedDate: number;
  readonly initialRightQty: number;
  readonly availableRightQty: number;
  readonly amount: number;
  readonly registeredQty: number;
  readonly purchaseAmount: number;
  readonly status: number;
  readonly marketID: string;
  readonly entitlementId: string;
  readonly locationID: string;
}

export interface IEquityRightSubsHistoryParams {
  readonly accountNumber: string;
  readonly symbol?: string;
  readonly fromDate: string;
  readonly toDate: string;
  readonly offset?: number;
  readonly fetchCount?: number;
}

export interface IEquityRightSubsHistoryResponse {
  readonly registeredTime: string;
  readonly symbol: string;
  readonly ratio: number;
  readonly offeringPrice: number;
  readonly closedDate: string;
  readonly lastRegistrationDate: string;
  readonly rightStock: string;
  readonly registeredQty: number;
  readonly purchasedAmount: number;
  readonly executeDate: string;
  readonly status: string;
  readonly remark: string;
}

export interface IEquityRightInforOnPopUpParams {
  readonly accountNumber: string;
  readonly entitlementID: string;
}

export interface IEquityRightInforOnPopUpResponse {
  readonly accountName: string;
  readonly bankAccountNumber: string;
  readonly symbolCode: string;
  readonly cashAvailable: number;
  readonly companyName: string;
  readonly securitiesType: string;
  readonly closedDate: string;
  readonly ratio: string;
  readonly offeringPrice: number;
  readonly rightQty: number;
  readonly entitlementId: string;
  readonly marketId: string;
  readonly locationId: string;
  readonly interfaceSeq: string;
}

export interface IRightInforRegisterPostParams {
  readonly accountNumber: string;
  readonly entitlementId: string;
  readonly locationId: string;
  readonly marketId: string;
  readonly registerQuantity: string;
  readonly bankAccountNumber: string;
  readonly symbolCode: string;
  readonly interfaceSeq: string;
}

export interface IRightInforRegisterPostRespone {
  readonly message: string;
  readonly mvResult: string;
  readonly mvReturnCode: string;
  readonly savedAuthen: string;
}
export interface IEquityCashAdvancedParams {
  readonly accountNo: string;
  readonly offset?: number;
  readonly fetchCount?: number;
}

export interface IEquityCashAdvancedResponse {
  readonly id: string;
  readonly soldDate: string;
  readonly paymentDate: string;
  readonly stock: string;
  readonly volume: number;
  readonly value: number;
  readonly feeTax: number;
  readonly netSoldAmount: number;
}

export interface IEquityCashAdvancedHistoryParams {
  readonly accountNo: string;
  readonly offset?: number;
  readonly fetchCount?: number;
  readonly status?: string;
  readonly fromDate?: string;
  readonly toDate?: string;
}

export interface IEquityCashAdvancedHistoryResponse {
  readonly date: string;
  readonly requestTime: string;
  readonly soldAmountInAdvance: number;
  readonly requireAdvanceAmount: number;
  readonly advanceFee: number;
  readonly tax: number;
  readonly status: string;
  readonly channel: string;
}

export interface IEquityCashAdvancedAmountParams {
  readonly accountNo: string;
}

export interface IEquityCashAdvancedAmountResponse {
  readonly availableCashAdvance: number;
  readonly maxFee: number;
  readonly tax: number;
  readonly t2AdvAvailable: number;
  readonly t1AdvAvailable: number;
  readonly t0AdvAvailable: number;
  readonly t2Days: number;
  readonly t1Days: number;
  readonly t0Days: number;
  readonly interestRate: number;
}

export interface IEquityCashAdvancedPaymentParams {
  readonly accountNo: string;
  readonly availableAmount: number;
  readonly submitAmount: number;
}

export interface IEquityCashAdvancedPaymentResponse {
  readonly success: boolean;
}

export interface IEquityCashAdvancedPaymentTimeParams {
  readonly accountNo: string;
}

export interface IEquityCashAdvancedPaymentTimeResponse {
  readonly result: boolean;
}

export interface IEquityIDrAccountOpenPositionItemParams extends IParams {
  readonly accountNo: string;
}

export interface IDrAccountOpenPositionItemResponse {
  readonly openPositionList: IDrAccountOpenPositionItem[];
  readonly accountNo: string;
}
export interface IDrAccountOpenPositionItem {
  readonly seriesID: string;
  readonly expiredDate: string;
  readonly long: number;
  readonly short: number;
  readonly averageBid: number;
  readonly averageAsk: number;
  readonly marketPrice: number;
  readonly floatingPL: number;
}

export interface IPositionStatementParams {
  readonly accountNo: string;
  readonly fromDate: string;
  readonly toDate: string;
}

export interface IPositionStatementResponse {
  readonly seriesID: string;
  readonly date: string;
  readonly longQtty: number;
  readonly longAveragePrice: string;
  readonly shortQtty: number;
  readonly shortAverageAsk: string;
  readonly netoffLong: number;
  readonly netoffShort: number;
  readonly expiredLong: number;
  readonly expiredShort: number;
  readonly balanceLong: number;
  readonly balanceShort: number;
  readonly balanceClosingPrice: number;
  readonly totalPL: number;
}

export interface IAssetInformationDerivativesParams {
  readonly accountNo: string;
}
export interface IEquityAssetInformationResponse {
  readonly accountSummary: IAccountSummaryDetail;
  readonly portfolioAssessment: IPortfolioAssessment;
  readonly cashInformation: ICashInformation;
}
export interface IAccountSummaryDetail {
  readonly totalStockMarketValue: number;
  readonly dailyPL: number;
  readonly cashBalance: string;
  readonly liability: string;
  readonly netAssetValue: number;
  readonly PP: string;
  readonly totalEquity: number;
  readonly accountBalance: number;
  readonly commission_tax: string;
  readonly interest: number;
  readonly extLoan: number;
  readonly floatingPL_tradingPL: string;
  readonly totalPL: number;
  readonly minReserve: number;
  readonly marginable: number;
  readonly rcCall: number;
  readonly cash_nonCash: string;
  readonly deliveryAmount: string;
}

export interface IPortfolioAssessment {
  readonly internal: IPortfolioAssessmentInternal;
  readonly exchange: IPortfolioAssessmentExchange;
}
export interface ICashInformation {
  readonly internal: ICashInformationInternal;
  readonly exchange: ICashInformationExchange;
}
export interface IPortfolioAssessmentInternal {
  readonly initialMargin: number;
  readonly spreadMargin: number;
  readonly deliveryMargin: number;
  readonly marginReq: number;
  readonly accountRatio: number;
  readonly warning123: string;
  readonly marginCall: number;
}
export interface IPortfolioAssessmentExchange {
  readonly initialMargin: number;
  readonly spreadMargin: number;
  readonly deliveryMargin: number;
  readonly marginReq: number;
  readonly accountRatio: number;
  readonly warning123: string;
  readonly marginCall: number;
}
export interface ICashInformationInternal {
  readonly cash: number;
  readonly totalValue: number;
  readonly cashWithdrawable: number;
  readonly EE: number;
}
export interface ICashInformationExchange {
  readonly cash: number;
  readonly totalValue: number;
  readonly cashWithdrawable: number;
  readonly EE: number;
}

export interface IDrAccountClosePositionItemParams {
  readonly accountNo: string;
}

export interface IDrAccountClosePositionItemResponse {
  readonly closePositionList: IDrAccountClosePositionItem[];
  readonly accountSummary: IEquityEnquiryPortfolioAccountSummaryResponse;
}
// Cash Transfer
export interface IEquityTransferableAmountResponse {
  readonly clientID?: string;
  readonly transferableAmount?: number;
  readonly beneficiaryAccountList?: IBeneficiaryAccountInfo[];
}

export interface IEquitySubAccountResponse {
  readonly subAccountID: string;
  readonly subAccountName: string;
  readonly subAccountType: string;
  readonly clientID: string;
  readonly tradingAccSeq: number;
  readonly service: string;
  readonly investorType: string;
  readonly counterPartyAC: string;
  readonly accountState: string;
  readonly sessionID: string;
  readonly defaultSubAccount: boolean;
  readonly investorTypeName: string;
  readonly prohibitBuy: boolean;
  readonly prohibitSell: boolean;
}

export interface IEquityBankInfoResponse {
  readonly bankId: string;
  readonly bankAccNo: string;
  readonly balance: number;
  readonly isDefault: boolean;
  readonly ownerName: string;
  readonly bankBranchID: string;
  readonly bankBranchName: string;
  readonly bankName: string;
}

export interface IBankInfoForKisResponse {
  readonly bankID: string;
  readonly bankAccNo?: string;
  readonly balance?: number;
  readonly isDefault?: boolean;
}

export interface ICashTransferResult {
  readonly result: string;
  readonly tranID: string;
}

export interface IDerivativeTransferResult {
  readonly tranID: string;
  readonly dwChannel: string;
  readonly transferFee: string;
}

export interface IVSDCashTransferResult {
  readonly transactionID: string;
}

export interface IBeneficiaryAccountInfo {
  readonly accountNo: string;
  readonly fullName: string;
  readonly bankName: string;
  readonly bankBranch: string;
  readonly transferFee: string | number;
}
export interface ICashTransferHistoryResponse {
  readonly date: string;
  readonly transferAccount: string;
  readonly transferType: TransferTypeResponse;
  readonly beneficiary: string;
  readonly beneficiaryAccNo: string;
  readonly beneficiaryBank: string;
  readonly beneficiaryAccountNo: string;
  readonly transferAmount: number;
  readonly transferFee: string;
  readonly status: CashTransferStatus;
}
export interface IEquityCashTransferHistoryResponse {
  readonly totalCount: number;
  readonly list: ICashTransferHistoryResponse[];
}

export interface IParamsCashTransferHistory {
  readonly accountNo?: string;
  readonly transferType: TransferType;
  readonly status?: CashTransferStatus;
  readonly fromDate?: string;
  readonly toDate?: string;
  readonly offset?: number;
  readonly fetchCount?: number;
}

export interface IParamsTransferableAmount extends IParams {
  readonly accountNo?: string;
}

export interface IParamsSubAccount extends IParams {
  readonly clientID?: string;
}

export interface IParamsDoInternalTransfer {
  readonly transferType?: TransferType;
  readonly senderAccountNo?: string;
  readonly senderFullName?: string;
  readonly transferableAmount?: number;
  readonly beneficiaryAccountNo?: string;
  readonly beneficiaryFullName?: string;
  readonly transferAmount?: number;
  readonly content?: string;
  readonly transferFee?: number;
  readonly beneficiaryBankName?: string;
  readonly beneficiaryBankBranch?: string;
  readonly beneficiaryBankBranchId?: string;
  readonly sendingAccountNumber?: string;
  readonly sendingFullName?: string;
  readonly beneficiaryBankNumber?: string;
  readonly beneficiaryBank?: string;
  readonly beneficiaryAccountNumber?: string;
  readonly otpToken?: string;
}

export interface IParamsQueryBankInfo {
  readonly accountNo?: string;
  readonly systemType?: string;
}

export interface IVSDTransferableAmountResponse {
  readonly transferableAmountToInternalSubsOrToBank: number;
  readonly transferableAmountToVSDAccount: number;
  readonly transferableAmountOfVSDAccount: number;
}

export interface IVSDCashTransferParams {
  readonly sendingAccountNo?: string;
  readonly beneficiaryAccountNo?: string;
  readonly transferType: TransferType;
  readonly transferAmount: number;
  readonly transferableAmount?: number;
  readonly content?: string;
  readonly otpToken?: string;
}

export interface IDerCashTransferParams {
  readonly accountNumber?: string;
  readonly transferType: TransferType;
  readonly transferAmount: number;
  readonly transferableAmount?: number;
  readonly content?: string;
}
export interface IVSDCashTransferResponse {
  readonly transactionID: string;
}

export interface ISpeedOrderModifyOrderParams {
  readonly accountNumber: string;
  readonly stockCode: string;
  readonly orderPrice: number;
  readonly newOrderPrice: number;
  readonly sellBuyType: SellBuyType;
  readonly accountType?: SystemType;
  readonly market: Market;
}

export interface ISpeedOrderModifyOrderResponse {
  readonly state: 0 | 1 | 2;
  readonly result?: {
    readonly orderNo: string;
    readonly orderGroupNo: string;
    readonly success: boolean;
    readonly quantity: number;
    readonly price: number;
    readonly pendingQty: number;
  } & {
    readonly orderId: string;
    readonly orderGroupId: string;
  };
  readonly error?: {
    readonly code: string;
    readonly isSystemError: boolean;
    readonly params?: string;
  };
}

export interface ISpeedOrderCancelOrderParams {
  readonly accountNumber: string;
  readonly stockCode: string;
  readonly sellBuyType: string;
  readonly orderPrice?: number;
  readonly accountType: string;
}

export interface ISpeedOrderCancelOrderResponse {
  readonly orderNo: string;
  readonly orderGroupNo: string;
  readonly success: boolean;
  readonly rejectCause: string;
  readonly orderGroupId: string;
  readonly errorCode: string;
  readonly reject: boolean;
}

export interface ISpeedOrderModifyStopOrderParams {
  readonly accountNumber: string;
  readonly code: string;
  readonly sellBuyType: SellBuyType;
  readonly stopPrice: number;
  readonly newStopPrice: number;
}

export interface ISpeedOrderState {
  readonly isOneClick?: boolean;
  readonly isWithPrompt?: boolean;
}

export interface ISpeedOrderModifyStopOrderResponse {
  readonly success: boolean;
}

export interface ISpeedOrderCancelStopOrderParams {
  readonly accountNumber: string;
  readonly code: string;
  readonly sellBuyType: SellBuyType;
  readonly stopPrice?: number;
}

export interface ISpeedOrderCancelStopOrderResponse {
  readonly success: boolean;
}

export interface IOrderConfirmationParams {
  readonly accountNo: string;
  readonly stockSymbol: string;
  readonly status?: OrderStatus;
  readonly fromDate: string;
  readonly toDate: string;
  readonly channel?: string;
  readonly offset?: number;
  readonly fetchCount?: number;
}

export interface IOrderConfirmationResponse {
  readonly date: string;
  readonly time: string;
  readonly accountNo: string;
  readonly orderType: string;
  readonly stockSymbol: string;
  readonly volume: number;
  readonly price: number;
  readonly status: OrderStatusResponse;
  readonly channel: string;
  readonly isHistory: string;
  readonly orderNo?: string;
  readonly refID?: string;
  readonly orderGroupId?: string;
  readonly refId?: string;
}

export interface IDerivativesOrderConfirmationResponse {
  readonly totalCount: number;
  readonly list: IOrderConfirmationResponse[];
}

export interface IEquityOrderConfirmationSubmitParams {
  readonly accountNo: string;
  /**
   * [orderNo, isHistory, refID][]
   */
  readonly mvOrderList: string[][];
}

export interface IEquityOrderConfirmationSubmitResponse {
  readonly result: string;
  readonly success: boolean;
  readonly returnCode: number;
  readonly message: string;
}

export interface IDerivativesOrderConfirmationSubmitParams {
  readonly accountNo: string;
  readonly language: string;
  readonly details: Array<{
    readonly orderGroupId: string;
    readonly isHistory: string;
    readonly refId: string;
  }>;
}

export interface IDerivativesOrderConfirmationSubmitResponse {
  readonly success: boolean;
}

export interface IMarketPutthroughDealTotalResponse {
  readonly tvo: number;
  readonly tva: number;
}

export interface IBankInfo {
  readonly id: string;
  readonly name: string;
  readonly branch: IBranch[];
}

export interface IBranch {
  readonly branchName: string;
  readonly branchCode: string;
}

export interface IStopOrderHistoryParams {
  readonly accountNumber: string;
  readonly code?: string;
  readonly sellBuyType?: SellBuyType;
  readonly orderType?: StopOrderType;
  readonly status?: StopOrderStatus;
  readonly lastStopOrderId?: number;
  readonly offset?: number;
  readonly fetchCount?: number;
  readonly fromDate?: string;
  readonly toDate?: string;
}

export interface IStopOrderHistoryResponse {
  readonly stopOrderId: number;
  readonly accountNumber: string;
  readonly code: string;
  readonly orderQuantity: number;
  readonly sellBuyType: SellBuyType;
  readonly stopPrice: number;
  readonly orderPrice: number;
  readonly orderType: StopOrderType;
  readonly orderNumber: string;
  readonly status: StopOrderStatus;
  readonly createTime: string;
  readonly orderTime: string;
  readonly cancelTime: string;
  readonly errorMessage: string;
  readonly fromDate: string;
  readonly toDate: string;
}

export interface IServerTimeResponse {
  readonly datetime: string;
  readonly businessDay?: boolean;
  readonly weekDay: number;
  readonly coreTime?: string;
}

export interface IQueryWatchListItem {
  readonly id: number;
  readonly name: string;
  readonly itemList?: IFavoriteItem[];
  readonly maxCount?: number;
  readonly order?: number;
}

export type IQueryWatchListResponse = IQueryWatchListItem[];

export interface IUpdateWatchListRequest {
  readonly id?: number;
  readonly name?: string;
  readonly order?: number;
  readonly itemList?: IFavoriteItem[];
  readonly items?: number[];
}

export interface IFavoriteItem {
  readonly isNote: boolean;
  readonly data: string;
}
export interface ISentOtp {
  readonly playerId?: string;
  readonly forceSMS?: boolean;
  readonly matrixId?: number;
  readonly isOtpOneModal?: boolean;
}

export interface IQueryOtpMatrixForKisResponse {
  readonly wordMatrixKey: string;
  readonly wordMatrixId: number;
}

export interface IVerifyOtpRequest {
  readonly otp?: string;
  readonly wordMatrixValue01?: string;
  readonly wordMatrixId?: number;
  readonly wordMatrixValue02?: string;
  /**
   * unit: h
   */
  readonly expireTime?: number;
  /**
   * MATRIX_CARD/SMART_OTP
   */
  readonly verifyType: string;
  /**
   * Make otp immediately cannot be removed
   * https://jira.tradex.vn/browse/TRADEX-1463
   */
  readonly isValid?: boolean;

  readonly wordMatrixValue?: string;
}
