import { IConfig } from 'interfaces/config';
import { METHOD } from 'utils/METHOD';
import { WS } from 'constants/enum';

const apis: IConfig['apis'] = {
  symbolList: {
    uri: 'market/symbol/staticInfo',
    wsName: WS.PRICE_BOARD,
  },
  symbolInfoLatest: {
    uri: 'market/symbol/latest',
    wsName: WS.PRICE_BOARD,
  },
  symbolOddlotLatest: {
    uri: 'market/symbol/oddlotLatest',
    wsName: WS.PRICE_BOARD,
  },
  locale: {
    uri: '/api/v1/locale',
    useFullUri: true,
    wsName: WS.PRICE_BOARD,
  },
  changePassword: {
    uri: '/api/v1/services/eqt/changepassword',
    wsName: WS.WTS,
    method: METHOD.PUT,
    useOtpToken: true,
    useFullUri: true,
  },
  clientDetail: {
    uri: '/api/v1/services/eqt/getclientdetail',
    wsName: WS.WTS,
    useFullUri: true,
  },
  notifyOtp: {
    uri: 'api/v1/notifyMobileOtpKisTtl',
    wsName: WS.WTS,
    method: METHOD.POST,
    useOtpToken: true,
  },
  symbolMinutes: {
    uri: 'market/symbol/{symbol}/minuteChart',
    wsName: WS.PRICE_BOARD,
  },
  symbolLatest: {
    uri: 'market/symbol/latest',
    wsName: WS.PRICE_BOARD,
  },
  symbolQuote: {
    uri: 'market/symbol/{symbol}/quote',
    wsName: WS.PRICE_BOARD,
  },
  indexStockList: {
    uri: 'market/indexStockList/{indexCode}',
    wsName: WS.PRICE_BOARD,
  },
  sessionStatus: {
    uri: 'market/sessionStatus',
    wsName: WS.PRICE_BOARD,
  },
  lastTradingDate: {
    uri: 'market/lastTradingDate',
    wsName: WS.PRICE_BOARD,
  },
  putthroughDeal: {
    uri: 'market/putthrough/deal',
    wsName: WS.PRICE_BOARD,
  },
  putthroughDealTotal: {
    uri: 'market/putthrough/dealTotal',
    wsName: WS.PRICE_BOARD,
  },
  putthroughAdvertise: {
    uri: 'market/putthrough/advertise',
    wsName: WS.PRICE_BOARD,
  },
  queryEquityPortfolio: {
    uri: '/api/v1/services/eqt/enquiryportfolio',
    useFullUri: true,
    wsName: WS.WTS,
  },
  queryDerivativesPortfolio: {
    uri: '/api/v1/services/fno/clientportfolio',
    useFullUri: true,
    wsName: WS.WTS,
  },
  queryDerivativesSummary: {
    uri: '/api/v1/services/fno/queryclientcashbalance',
    useFullUri: true,
    wsName: WS.WTS,
  },
  submitStockTransfer: {
    uri: '/api/v1/services/eqt/instrumentDW',
    useFullUri: true,
    wsName: WS.WTS,
    method: METHOD.POST,
    useOtpToken: true,
  },
  queryStockTransfer: {
    uri: '/api/v1/services/eqt/listInstrumenPortfolio',
    useFullUri: true,
    wsName: WS.WTS,
  },
  queryStockTransferHistory: {
    uri: '/api/v1/services/eqt/enquiryInstrumentDW',
    useFullUri: true,
    wsName: WS.WTS,
  },
  equityPlaceOrder: {
    uri: '/api/v1/services/eqt/enterorder',
    wsName: WS.WTS,
    method: METHOD.POST,
    useOtpToken: true,
    useFullUri: true,
  },
  equityModifyOrder: {
    uri: '/api/v1/services/eqt/modifyOrder',
    wsName: WS.WTS,
    method: METHOD.PUT,
    useOtpToken: true,
    useFullUri: true,
  },
  equityCancelOrder: {
    uri: '/api/v1/services/eqt/cancelOrder',
    wsName: WS.WTS,
    method: METHOD.PUT,
    useOtpToken: true,
    useFullUri: true,
  },
  placeStopOrder: {
    uri: '/api/v1/stopOrder',
    wsName: WS.WTS,
    method: METHOD.POST,
    useOtpToken: true,
    useFullUri: true,
  },
  modifyStopOrder: {
    uri: '/api/v1/stopOrder/modify',
    wsName: WS.WTS,
    method: METHOD.PUT,
    useOtpToken: true,
    useFullUri: true,
  },
  cancelStopOrder: {
    uri: '/api/v1/stopOrder/cancel',
    wsName: WS.WTS,
    method: METHOD.PUT,
    useOtpToken: true,
    useFullUri: true,
  },
  cancelStopOrderMulti: {
    uri: '/api/v1/stopOrder/cancel/multi',
    wsName: WS.WTS,
    method: METHOD.PUT,
    useOtpToken: true,
    useFullUri: true,
  },

  equityStockTransactionHistory: {
    uri: '/api/v1/services/eqt/hksStockTransactionHistory',
    wsName: WS.WTS,
    useFullUri: true,
  },
  equityQueryStockInfo: {
    uri: '/api/v1/services/eqt/stockInfo',
    wsName: WS.WTS,
    useFullUri: true,
  },
  equityQueryMaxQty: {
    uri: '/api/v1/services/eqt/genbuyall',
    wsName: WS.WTS,
    useFullUri: true,
  },
  derivativesQueryMaxQty: {
    uri: '/api/v1/services/fno/maxlongshortenquiry',
    wsName: WS.WTS,
    useFullUri: true,
  },

  equityOrderHistory: {
    uri: '/api/v1/services/eqt/enquiryhistoryorder',
    wsName: WS.WTS,
    useFullUri: true,
  },
  derivativeOrderHistory: {
    uri: '/api/v1/services/fno/orderenquiryhistory',
    wsName: WS.WTS,
    useFullUri: true,
  },
  stopOrderHistory: {
    uri: '/api/v1/stopOrder/history',
    wsName: WS.WTS,
    useFullUri: true,
  },
  equityOrderBook: {
    uri: '/api/v1/services/eqt/enquiryorder',
    wsName: WS.WTS,
    useFullUri: true,
  },
  verifyIdentity: {
    uri: '/api/v1/resetPassword/verifyIdentity',
    useFullUri: true,
    wsName: WS.WTS,
    method: METHOD.POST,
  },
  resetPassword: {
    uri: '/api/v1/resetPassword',
    wsName: WS.WTS,
    method: METHOD.POST,
    useFullUri: true,
  },
  equityOrderBookDetail: {
    uri: '/api/v1/services/eqt/orderDetail',
    wsName: WS.WTS,
    useFullUri: true,
  },
  derivativeOrderBookDetail: {
    uri: '/api/v1/services/fno/orderaudit',
    wsName: WS.WTS,
    useFullUri: true,
  },
  equityCashAdvanced: {
    uri: '/api/v1/services/eqt/querySoldOrders',
    wsName: WS.WTS,
    useFullUri: true,
  },
  equityCashAdvancedHistory: {
    uri: '/api/v1/services/eqt/getCashAdvanceHistory',
    wsName: WS.WTS,
    useFullUri: true,
  },
  equityCashAdvancedAmount: {
    uri: '/api/v1/services/eqt/getLocalAdvanceCreation',
    wsName: WS.WTS,
    useFullUri: true,
  },
  equityCashAdvancedPayment: {
    uri: '/api/v1/services/eqt/submitAdvancePaymentCreation',
    wsName: WS.WTS,
    useFullUri: true,
    method: METHOD.POST,
    useOtpToken: true,
  },
  equityCashAdvancedPaymentTime: {
    uri: '/api/v1/services/eqt/checkAdvancePaymentTime',
    wsName: WS.WTS,
    useFullUri: true,
  },
  queryPositionStatement: {
    uri: '/api/v1/services/fno/clientstockstatementenquiry',
    wsName: WS.WTS,
    useFullUri: true,
  },
  equityOrderConfirmation: {
    uri: '/api/v1/services/eqt/enquirysignorder',
    wsName: WS.WTS,
    useFullUri: true,
  },
  equityOrderConfirmationSubmit: {
    uri: '/api/v1/services/eqt/submitSignOrder',
    wsName: WS.WTS,
    useFullUri: true,
    method: METHOD.POST,
    useOtpToken: true,
  },
  derivativesOrderConfirmation: {
    uri: '/api/v1/services/fno/signorderenquiry',
    wsName: WS.WTS,
    useFullUri: true,
  },
  derivativesOrderConfirmationSubmit: {
    uri: '/api/v1/services/fno/submitsignorder',
    wsName: WS.WTS,
    useFullUri: true,
    method: METHOD.POST,
    useOtpToken: true,
  },
  equityCashStatement: {
    uri: '/api/v1/services/eqt/queryCashTranHisReport',
    wsName: WS.WTS,
    useFullUri: true,
  },
  equityTransactionhistory: {
    uri: '/api/v1/services/fno/transactionhistory',
    wsName: WS.WTS,
    useFullUri: true,
  },
  derivativesCashStatement: {
    uri: '/api/v1/services/fno/cashenquiry',
    wsName: WS.WTS,
    useFullUri: true,
  },

  equityLoanStatement: {
    uri: '/api/v1/services/eqt/marginLoan',
    wsName: WS.WTS,
    useFullUri: true,
  },
  equityInterestExpenseStatement: {
    uri: '/api/v2/bridge/queryLoanInterestExpense',
    wsName: WS.WTS,
    useFullUri: true,
  },
  equityConfirmDebt: {
    uri: '/api/v1/services/eqt/loanConfirmEnquiry',
    wsName: WS.WTS,
    useFullUri: true,
  },
  submitConfirmDebt: {
    uri: '/api/v1/services/eqt/submitLoanConfirm',
    wsName: WS.WTS,
    useFullUri: true,
    method: METHOD.POST,
  },

  derivativesPlaceOrder: {
    uri: '/api/v1/services/fno/enterorder',
    wsName: WS.WTS,
    method: METHOD.POST,
    useOtpToken: true,
    useFullUri: true,
  },
  derivativesModifyOrder: {
    uri: '/api/v1/services/fno/modifyorder',
    wsName: WS.WTS,
    method: METHOD.PUT,
    useOtpToken: true,
    useFullUri: true,
  },
  derivativesCancelOrder: {
    uri: '/api/v1/services/fno/cancelorder',
    wsName: WS.WTS,
    method: METHOD.PUT,
    useOtpToken: true,
    useFullUri: true,
  },
  speedOrderModifyOrder: {
    uri: '/api/v1/services/speedOrder/modify',
    wsName: WS.WTS,
    method: METHOD.PUT,
    useOtpToken: true,
    useFullUri: true,
  },
  speedOrderCancelOrder: {
    uri: '/api/v1/services/speedOrder/cancel',
    wsName: WS.WTS,
    method: METHOD.PUT,
    useOtpToken: true,
    useFullUri: true,
  },
  speedOrderModifySpeedOrder: {
    uri: '/api/v1/stopOrder/speedModify',
    wsName: WS.WTS,
    method: METHOD.PUT,
    useOtpToken: true,
    useFullUri: true,
  },
  speedOrderCancelSpeedOrder: {
    uri: '/api/v1/stopOrder/speedCancel',
    wsName: WS.WTS,
    method: METHOD.PUT,
    useOtpToken: true,
    useFullUri: true,
  },
  equityAssetInformation: {
    uri: '/api/v1/services/eqt/assetInfoFromPortfolio',
    useFullUri: true,
    wsName: WS.WTS,
  },
  equityAssetInfoMarginCallBy: {
    uri: '/api/v1/services/eqt/accountbalance',
    useFullUri: true,
    wsName: WS.WTS,
  },
  equityAccountOpenPositionItem: {
    uri: '/api/v1/services/fno/clientportfolio',
    useFullUri: true,
    wsName: WS.WTS,
  },
  equityAccountRealizedPortfolio: {
    uri: '/api/v1/services/fno/clientportfolio',
    useFullUri: true,
    wsName: WS.WTS,
  },
  equityRightSubscriptions: {
    uri: '/api/v1/services/eqt/getAllRightList',
    wsName: WS.WTS,
    useFullUri: true,
  },
  equityRightInformation: {
    uri: '/api/v1/services/eqt/getAdditionIssueShareInfo',
    wsName: WS.WTS,
    useFullUri: true,
  },
  equityRightSubsHistory: {
    uri: '/api/v1/services/eqt/getEntitlementHistory',
    wsName: WS.WTS,
    useFullUri: true,
  },
  equityRightInforOnPopUp: {
    uri: '/api/v1/services/eqt/getEntitlementStockList',
    wsName: WS.WTS,
    useFullUri: true,
  },
  rightInforResgisterPost: {
    uri: '/api/v1/services/eqt/doRegisterExercise',
    wsName: WS.WTS,
    method: METHOD.POST,
    useOtpToken: true,
    useFullUri: true,
  },
  queryWatchList: {
    uri: '/api/v1/favorite',
    wsName: WS.WTS,
    useFullUri: true,
    method: METHOD.GET,
  },
  addWatchList: {
    uri: '/api/v1/favorite',
    wsName: WS.WTS,
    useFullUri: true,
    method: METHOD.POST,
  },
  delWatchList: {
    uri: '/api/v1/favorite',
    wsName: WS.WTS,
    useFullUri: true,
    method: METHOD.DELETE,
  },
  updateWatchList: {
    uri: '/api/v1/favorite',
    method: METHOD.PUT,
    useOtpToken: true,
    wsName: WS.WTS,
    useFullUri: true,
  },
  queryOtpType: {
    uri: '/api/v1/auth/eqt/retrieveClientAuthen',
    useFullUri: true,
    wsName: WS.WTS,
  },
  verifyOtpMatrix: {
    uri: '/api/v1/verifyAndSaveOTP',
    useFullUri: true,
    method: METHOD.POST,
    wsName: WS.WTS,
  },
  queryOtpMatrix: {
    uri: '/api/v1/services/eqt/generateMatrixKey',
    useFullUri: true,
    method: METHOD.POST,
    wsName: WS.WTS,
  },

  queryOtpMatrixforKis: {
    uri: '/api/v1/auth/matrix/genNewKisCard',
    useFullUri: true,
    method: METHOD.POST,
    wsName: WS.WTS,
  },

  changePIN: {
    uri: '/api/v1/services/eqt/changePin',
    wsName: WS.WTS,
    method: METHOD.PUT,
    useOtpToken: true,
    useFullUri: true,
  },

  equityCashTransferHistory: {
    uri: '/api/v1/services/eqt/hksCashTransactionHistory',
    wsName: WS.WTS,
    useFullUri: true,
  },

  equityTransferableAmount: {
    uri: '/api/v1/services/eqt/genfundtransfer',
    wsName: WS.WTS,
    useFullUri: true,
  },

  equitySubAccount: {
    uri: '/api/v1/subaccount/retrieve',
    wsName: WS.WTS,
    useFullUri: true,
  },

  equityCashTransferInternal: {
    uri: '/api/v1/services/eqt/dofundtransfer',
    wsName: WS.WTS,
    method: METHOD.POST,
    useOtpToken: true,
    useFullUri: true,
  },

  equityBankInfo: {
    uri: '/api/v2/bank/queryBankInfo',
    wsName: WS.WTS,
    useFullUri: true,
  },

  equityBankInfoForKis: {
    uri: '/api/v1/services/eqt/queryBankInfo',
    wsName: WS.WTS,
    useFullUri: true,
  },
  derivativesBankInfoForKis: {
    uri: '/api/v1/services/fno/queryBankInfo',
    wsName: WS.WTS,
    useFullUri: true,
  },

  VSDTransferableAmount: {
    uri: '/api/v1/services/fno/clientcashbalanceshortver',
    wsName: WS.WTS,
    useFullUri: true,
  },

  VSDCashTransfer: {
    uri: '/api/v1/services/fno/cpcashDW',
    wsName: WS.WTS,
    method: METHOD.POST,
    useOtpToken: true,
    useFullUri: true,
  },

  VSDCashTransferHistory: {
    uri: '/api/v1/services/fno/cpcashDWenquiry',
    wsName: WS.WTS,
    useFullUri: true,
  },

  derivativeCashTransferHistory: {
    uri: '/api/v1/services/fno/cashDWenquiry',
    wsName: WS.WTS,
    useFullUri: true,
  },

  derivativeInternalTransfer: {
    uri: '/api/v1/services/fno/cashtransfer',
    wsName: WS.WTS,
    method: METHOD.POST,
    useOtpToken: true,
    useFullUri: true,
  },

  derivativeBankTransfer: {
    uri: '/api/v1/services/fno/cashDW',
    wsName: WS.WTS,
    method: METHOD.POST,
    useOtpToken: true,
    useFullUri: true,
  },
  derivativesOrderBook: {
    uri: '/api/v1/services/fno/orderenquiry',
    wsName: WS.WTS,
    useFullUri: true,
  },
  changeLanguage: {
    uri: '/api/v1/changelanguage',
    wsName: WS.WTS,
    method: METHOD.POST,
    useOtpToken: true,
    useFullUri: true,
  },
  equityCashAdvancedIICA: {
    uri: '/services/eqt/queryAdvancePaymentInfo',
    wsName: WS.TTL,
    useFullUri: true,
    method: METHOD.POST,
  },
  equityPortfolioIICA: {
    uri: '/services/eqt/enquiryportfolioNEW',
    wsName: WS.TTL,
    useFullUri: true,
    method: METHOD.POST,
  },
  equityCashAdvancedPaymentIICA: {
    uri: '/services/eqt/submitBankAdvancePayment',
    wsName: WS.TTL,
    useFullUri: true,
    method: METHOD.POST,
  },
  queryServerTime: {
    uri: 'queryServerTime',
    wsName: WS.WTS,
    useFullUri: true,
  },
  queryServerTimeForKis: {
    uri: '/api/v1/tradedate',
    wsName: WS.WTS,
    useFullUri: true,
  },
  equityRightSubsciptionsIICA: {
    uri: '/services/eqt/getAllRightList',
    wsName: WS.TTL,
    useFullUri: true,
    method: METHOD.POST,
  },
  equityCalculateInterestAmtIICA: {
    uri: '/services/eqt/calculateInterestAmt',
    wsName: WS.WTS,
    useFullUri: true,
    method: METHOD.POST,
  },
  matchingData: {
    uri: '/matchingData',
    useFullUri: true,
    wsName: WS.MOBILE_SERVER,
  },
  clearCookies: {
    uri: '/api/v1/clearCookie/{key}',
    wsName: WS.WTS,
    useFullUri: true,
  },
  ekycCheckNationalId: {
    uri: '/api/v1/equity/account/checkNationalId',
    wsName: WS.EKYC,
    useFullUri: true,
    method: METHOD.POST,
  },
  ekycAdminSendOtp: {
    uri: '/api/v1/ekyc-admin/sendOtp',
    wsName: WS.EKYC,
    useFullUri: true,
    method: METHOD.POST,
  },
  ekycAdminVerifyOtp: {
    uri: '/api/v1/ekyc-admin/verifyOtp',
    wsName: WS.EKYC,
    useFullUri: true,
    method: METHOD.POST,
  },
  ekycAdminEkyc: {
    uri: '/api/v1/ekyc-admin/ekyc',
    wsName: WS.EKYC,
    useFullUri: true,
    method: METHOD.POST,
  },
};

export default apis;
