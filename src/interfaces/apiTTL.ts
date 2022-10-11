export interface IMASCommonResponse {
  readonly msgSeq?: number;
  readonly messageID?: string;
  /**
   * eqt: OLS0000= Success,
   * dr: OLS0000 | null = Success
   */
  readonly errorCode: string | null;
  readonly errorMessage: string;
  readonly returnCode?: number;
}

export interface IMASEquityCashAdvancedParams {
  readonly subAccountID: string;
  readonly mvBankID: string;
  readonly mvSettlement: string; // Fixed "3T"
}

export interface IMASEquityCashAdvancedResponse extends IMASCommonResponse {
  readonly success: boolean;
  readonly mvErrorCode: string;
  readonly mvErrorResult: string;
  readonly mvParentBean: {
    readonly mvClientID: string;
    readonly mvBankID: string;
    readonly mvBankAccID: string;
    readonly mvSettlement: string;
    readonly mvCurrencySymbol: string;
    readonly mvLendAmt: string;
    readonly mvFeeRate: string;
    readonly mvMaxFeeAmt: string;
    readonly mvMinFeeAmt: string;
  };
  readonly mvChildBeanList: Array<{
    readonly mvOrderID: string;
    readonly mvContractID: string;
    readonly mvAmount: string;
    readonly mvFormatedAmount: string;
    readonly mvQuantity: string;
    readonly mvStockID: string;
    readonly mvSettleDay: string;
    readonly mvMarketId: string;
    readonly mvPrice: string;
    readonly tradeDate: string;
    readonly tranDate: string;
    readonly tradingFee: string;
    readonly cashSettleDay: string;
    readonly mvAvailableAmount: string;
  }>;
  readonly mvResult: string;
}

export interface IMASEquityCalculateInterestAmtParams {
  readonly subAccountID: string;
  readonly mvAmount: string;
  readonly mvSettlement: string;
}

export interface IMASEquityCalculateInterestAmtResponse
  extends IMASCommonResponse {
  readonly totalCount: number;
  readonly mvResult: string;
  readonly mvInterestAmt: string;
}

export interface IMASEquityCashAdvancedPaymentParams {
  readonly subAccountID: string;
  readonly mvOrderIDStrArray: string;
  readonly mvContractIDStrArray: string;
  readonly mvBankID: string;
  readonly mvTPLUSX: string;
  readonly mvAmount: string;
  readonly mvTotalAmt: string;
}

export interface IMASEquityCashAdvancedPaymentResponse
  extends IMASCommonResponse {
  readonly mvErrorCode: string;
  readonly mvErrorResult: string;
  readonly mvResult: string;
  readonly mvReturnCode: number;
  readonly success: boolean;
}

export interface IMASEquityRightSubscriptionsParams {
  readonly subAccountID?: string;
  readonly mvActionType?: string;
  readonly mvStockId?: string;
  readonly mvStartDate?: string;
  readonly mvEndDate?: string;
  readonly start?: number;
  readonly limit?: number;
}

export interface IMASEquityRightSubscriptionsResponse
  extends IMASCommonResponse {
  readonly mvErrorCode?: string;
  readonly mvErrorResult?: string;
  readonly mvResult?: string;
  readonly mvReturnCode?: number;
  readonly success?: boolean;
  readonly rightList?: Array<{
    readonly bookCloseDate?: string;
    readonly bookCloseQty?: string;
    readonly cashRate?: string;
    readonly isStockCash?: string;
    readonly issueRatioDelivery?: string;
    readonly issueRatioPer?: string;
    readonly issueType?: string;
    readonly paidDate?: string;
    readonly payableDate?: string;
    readonly price?: string;
    readonly remark?: string;
    readonly startDate?: string;
    readonly status?: string;
    readonly stockId?: string;
    readonly stockRate?: string;
    readonly totalBonusRight?: string;
    readonly totalIssue?: string;
    readonly totalRemainAmt?: string;
    readonly totalScript?: string;
    readonly totalStock?: string;
    readonly typeDescription?: string;
  }>;
}
export interface IMASEquityPortfolioResponse extends IMASCommonResponse {
  readonly errorParam?: string;
  readonly rowCount: number;
  readonly mvResult: string;
  readonly mainResult?: string;
  readonly clientID?: string;
  readonly tradingAccSeq?: number;
  readonly totalMarketValue?: string;
  readonly mvAccountType?: string;
  readonly totalPL?: string;
  readonly totalPLPercent?: string;
  readonly totalWACValue?: string;
  readonly mvPortfolioAccSummaryBean?: IMASPortfolioSummary;
  readonly mvPortfolioBeanList?: IMASPortfolioBeanList[];
}

interface IMASPortfolioSummary {
  readonly pendCashDiv: string;
  readonly mvCT0UnsettleSell: string;
  readonly mvSettledBalance: string;
  readonly mvCashWithdrawable: string;
  readonly mvTodaySettlement: string;
  readonly mvHoldAmount: string;
  readonly mvReserveAmount?: string;
  readonly mvInterest: string;
  readonly mvDPWD: string;
  readonly mvUsable: string;
  readonly mvOutstandingLoan: string;
  readonly mvTotalOutAdvance: string;
  readonly mvTotalHoldAmount: string;
  readonly mvBuyHoldAmount: string;
  readonly mvBuyingPowerd: string;
  readonly mvPendingWithdraw: string;
  readonly mvPendingSettled: string;
  readonly mvMarginCall: string;
  readonly mvDueBalance: string;
  readonly mvTodayBS: string;
  readonly mvMarketValue: string;
  readonly mvMarginValue: string;
  readonly mvCreditLimit: string;
  readonly mvMarginPercentage: string;
  readonly mvExtraCreditd: string;
  readonly mvAvailAdvanceMoney: string;
  readonly totalAsset: string;
  readonly equity: string;
  readonly stockValue: string;
  readonly profitLoss: string;
  readonly cashBalance: string;
  readonly pendingHold: string;
  readonly pendingWithdrawal: string;
  readonly soldT0: string;
  readonly soldT1: string;
  readonly soldT2: string;
  readonly totalAssetMaintenance: string;
  readonly equityMar: string;
  readonly stockMaintenance: string;
  readonly cashMaintenance: string;
  readonly outStandingLoan: string;
  readonly debtIncByPurchase: string;
  readonly creditLimit: string;
  readonly lendableValue: string;
  readonly minMarginReq: string;
  readonly curLiqMargin: string;
  readonly cashDeposit: string;
  readonly sellStkInMarPort: string;
  readonly sellStkNotInMarPort: string;
  readonly mvMaintenanceCall: string;
  readonly mvCashBalance: string;
  readonly toCurrencyID?: string;
  readonly currencyID?: string;
  readonly availableBal: string;
  readonly marginableBalf?: string;
  readonly accruedInterest?: string;
  readonly baseCcy?: string;
  readonly evaluationRate?: string;
  readonly conversionRate?: string;
  readonly tradableBal?: string;
  readonly accountSeq: number;
  readonly drawableBal: string;
  readonly ledgerBal: string;
  readonly marginableBal: string;
  readonly debitAccruedInterest: string;
  readonly clientID?: string;
  readonly CUnsettleBuy?: string;
  readonly CTodayConfirmShortsell?: string;
  readonly CManualHold?: string;
  readonly CCreditLine?: string;
  readonly CMortgagePendingAmt?: string;
  readonly CMortgageHoldAmt?: string;
  readonly CDailyOpenBal?: string;
  readonly CDailyMarginableBal?: string;
  readonly CMonthlyOpenBal?: string;
  readonly CNextDayDueSell?: string;
  readonly CNextDayDueBuy?: string;
  readonly CInactiveBuy?: string;
  readonly CTodayHoldAmtExt?: string;
  readonly CShortSellAmt?: string;
  readonly CTodayOverrideAmt?: string;
  readonly TDMortgageAmt?: string;
  readonly CManualReleaseAmt?: string;
  readonly CTodayUnsettleBuy?: string;
  readonly CT1UnsettleBuy?: string;
  readonly CT2UnsettleBuy?: string;
  readonly CT3UnsettleBuy?: string;
  readonly CT4UnsettleBuy?: string;
  readonly CT4UnsettleSell?: string;
  readonly CPendingDeposit?: string;
  readonly CUnrealizedLoan?: string;
  readonly CChargeableAmt?: string;
  readonly CTodayBuy?: string;
  readonly creditAccruedInterest?: string;
  readonly PLPercent: string;
  readonly CTodayUnsettleSell: string;
  readonly CT1UnsettleSell: string;
  readonly CT2UnsettleSell: string;
  readonly CTodayIn: string;
  readonly CTodayConfirmSell: string;
  readonly CDueSell: string;
  readonly CDueBuy: string;
  readonly CTodayOut: string;
  readonly CSettled: string;
  readonly CManualReserve: string;
  readonly CTodaySell: string;
  readonly CTodayConfirmBuy: string;
  readonly CT3UnsettleSell: string;
  readonly CUnsettleSell: string;
  readonly CPendingWithdrawal: string;
}

interface IMASPortfolioBeanList {
  readonly mvStockID: string;
  readonly mvStockName: string;
  readonly mvQueuingBuy: string;
  readonly mvQueuingSell: string;
  readonly mvTTodayConfirmBuy: string;
  readonly mvTTodayConfirmSell: string;
  readonly mvTManualHold: string;
  readonly normalHold: string;
  readonly conditionalHold: string;
  readonly maintenancePercentage: string;
  readonly maintenanceValue: string;
  readonly mvTradableQty: string;
  readonly mvMarketValue: string;
  readonly mvMarginPercentage?: string;
  readonly mvMartginValue?: string;
  readonly mvBuySell: string;
  readonly mvMarketID: string;
  readonly mvLedgerBal: string;
  readonly mvAvgPrice: string;
  readonly mvWAC: string;
  readonly mvMarketPrice: string;
  readonly mvPL: string;
  readonly mvPLPercent: string;
  readonly mvPdBuy: string;
  readonly mvPdSell: string;
  readonly mvHoldingAmt: string;
  readonly mvProfitPrc?: string;
  readonly mvLossPrc?: string;
  readonly mvTEntitlementQty: string;
  readonly mvTAwaitingTraceCert: string;
  readonly mvTAwaitingDepositCert: string;
  readonly mvTAwaitingWithdrawalCert: string;
  readonly mvTMortgageQty: string;
  readonly mvTTodayUnsettleBuy: string;
  readonly mvTTodayUnsettleSell: string;
  readonly mvTT1UnsettleBuy: string;
  readonly mvTT2UnsettleBuy: string;
  readonly mvTT3UnsettleBuy?: string;
  readonly mvTT1UnsettleSell: string;
  readonly mvTT2UnsettleSell: string;
  readonly mvTT3UnsettleSell?: string;
  readonly mvTDueBuy: string;
  readonly mvTSettled: string;
  readonly mvTotalVol: string;
  readonly totalPendingBuy: string;
  readonly mvTUnSettleSell: string;
  readonly mvCurrencyID: string;
}

export interface IMatchingDataResponse {
  readonly next: string;
  readonly nrec: string;
  readonly rcod: string;
  readonly skey: string;
  readonly rec: IMatchingDataRecord[];
}

export interface IMatchingDataRecord {
  readonly avol: string;
  readonly curr: string;
  readonly diff: string;
  readonly high: string;
  readonly lowe: string;
  readonly lvol: string;
  readonly mtim: string;
  readonly open: string;
  readonly rate: string;
}
