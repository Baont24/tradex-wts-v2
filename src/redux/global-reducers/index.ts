import * as Ekyc from 'screens/KisEkyc/reducer';
import * as accountInforReducer from 'components/areas/Information/AccountInformation/reducer';
import * as accountListReducers from './AccountList';
import * as accountOpenPositionItemReducer from 'components/areas/Account/Portfolio/reducer';
import * as accountRealizedPortfolioReducer from 'components/areas/Account/RealizedPortfolio/reducer';
import * as assetInforReducers from 'components/areas/Account/AssetInformation/reducers';
import * as bankInfoReducers from './BankInfo';
import * as cashAdvancedReducers from 'components/areas/Account/CashAdvanced/reducers';
import * as cashStatementReducers from 'components/areas/Account/CashStatement/reducers';
import * as cashTransferHistoryReducers from 'components/areas/Account/CashTransfer/CashTransferHistory/reducer';
import * as cashTransferInternalSubReducer from 'components/areas/Account/CashTransfer/CashTransferInternalSub/reducer';
import * as cashTransferReducers from 'components/areas/Account/CashTransfer/reducer';
import * as cashTransferToBankReducer from 'components/areas/Account/CashTransfer/CashTransferToBank/reducer';
import * as clientDetailReducer from './ClientDetail';
import * as currentSymbolReducers from './CurrentSymbol';
import * as equityConfirmDebtReducer from 'components/areas/Account/LoadDetail/ConfirmDebt/reducer';
import * as indexSliderChartReucers from 'components/areas/Board/PriceBoard/IndexSliderContainer/IndexSlider/IndexSliderChart/reducers';
import * as interestExpenseStatementReducer from 'components/areas/Account/LoadDetail/InterestExpenseStatement/reducers';
import * as isAuthenticatedReducer from './IsAuthenticated';
import * as langReducers from './Lang';
import * as loanContractReducer from 'components/areas/Account/LoadDetail/LoanContract/reducer';
import * as loanStatementReducer from 'components/areas/Account/LoadDetail/LoanStatement/reducer';
import * as loginDomainInfoReducer from './Login';
import * as logoutDomainInfoReducer from './Logout';
import * as marketStatusReducer from './MarketStatus';
import * as notificationReducer from './Notification';
import * as orderBookReducers from 'components/areas/Account/OrderBook/reducers';
import * as orderConfirmationReducers from 'components/areas/Account/OrderConfirmation/reducers';
import * as orderFormReducers from 'components/common/OrderForm/reducers';
import * as orderHistoryReducers from 'components/areas/Account/OrderHistory/reducer';
import * as orderResultReducers from './OrderResult';
import * as otpReducers from './Otp';
import * as portfolioReducers from './Portfolio';
import * as positionStatementReducer from 'components/areas/Account/PositionStatement/reducers';
import * as priceBoardReducer from 'components/areas/Board/PriceBoard/reducers';
import * as putThroughBoardReducers from 'components/areas/Board/PriceBoard/PutThroughBoard/reducers';
import * as resetBoardDataTriggerReducer from './ResetBoardData';
import * as resetMarketDataTriggerReducer from './ResetMarketData';
import * as resetPasswordReducers from '../../screens/ForgotPassword/reducers';
import * as rightInfomationReducers from 'components/areas/Account/RightInfomation/reducers';
import * as rightSubscriptionsReducer from 'components/areas/Account/RightSubscriptions/reducer';
import * as routersReducers from 'routers/reducers';
import * as securitiesStatementReducer from 'components/areas/Account/SecuritiesStatement/reducer';
import * as selectedAccountReducer from './SelectedAccount';
import * as settingsFunctionReducer from 'components/common/SettingsNav/reducers';
import * as sideBarFunctionReducer from 'components/common/SideBarFunction/reducers';
import * as socketReducers from './Socket';
import * as speedOrderReducers from 'components/common/SpeedOrder/reducers';
import * as stockTransferReducers from 'components/areas/Account/StockTransfer/reducers';
import * as stopOrderHistoryReducer from 'components/areas/Account/StopOrderHistory/reducers';
import * as symbolCachedDataReducers from './SymbolCachedData';
import * as symbolDataReducers from './SymbolData';
import * as symbolListReducers from './SymbolList';
import * as symbolQuoteReducers from 'components/common/SymbolQuote/reducers';
import * as transferableAmountReducers from './TransferableAmount';
import * as userInfoReducers from './UserInfo';
import * as watchlistReducer from './Watchlist';
import * as watchlistServerReducer from './WatchlistServer';
import { AnyAction, combineReducers } from 'redux';
import { Config } from './Config';
import { IAction, IReducer } from 'interfaces/common';
import { UPDATE_DEBUGGING } from 'redux/actions';
import SelectedWatchlist from './SelectedWatchlist';
import WatchlistData from './WatchlistData';

const IsDebugging: IReducer<boolean> = (
  state: boolean = window.location.search.includes('debug'),
  action: IAction<boolean>
) => {
  switch (action.type) {
    case UPDATE_DEBUGGING:
      return action.payload;
    default:
      return state;
  }
};

const appReducer = combineReducers({
  // Global
  config: Config,
  priceBoardSocket: socketReducers.PriceBoardSocket,
  wtsSocket: socketReducers.WtsSocket,
  socketStatus: socketReducers.SocketStatus,
  wtsSocketStatus: socketReducers.WTSSocketStatus,
  sideBarFunction: sideBarFunctionReducer.SideBarFunction,
  settingsNav: settingsFunctionReducer.SettingsNav,

  // Router
  router: routersReducers.Router,
  resetRouter: routersReducers.RouterReset,

  // I18n
  i18n: langReducers.I18n,
  lang: langReducers.Language,

  // Authentication
  isAuthenticated: isAuthenticatedReducer.IsAuthenticated,
  userInfo: userInfoReducers.UserInfo,
  otp: otpReducers.Otp,
  otpToken: otpReducers.OtpToken,
  otpSending: otpReducers.OtpSending,
  domainUserInfo: userInfoReducers.DomainUserInfo,
  userExtraInfo: userInfoReducers.UserExtraInfo,
  selectedAccount: selectedAccountReducer.SelectedAccount,
  accountList: accountListReducers.AccountList,
  loginDomainInfo: loginDomainInfoReducer.LoginDomainInfo,
  logoutDomainInfo: logoutDomainInfoReducer.Logout,

  // Market
  currentSymbol: currentSymbolReducers.CurrentSymbol,
  currentSymbolData: currentSymbolReducers.CurrentSymbolData,
  stockList: symbolListReducers.StockList,
  futuresList: symbolListReducers.FuturesList,
  indexList: symbolListReducers.IndexList,
  indexMinutes: indexSliderChartReucers.IndexMinutes,
  lastTradingDate: indexSliderChartReucers.LastTradingDate,
  cwList: symbolListReducers.CWList,
  symbolList: symbolListReducers.SymbolList,
  notifications: notificationReducer.Notifications,
  bankInfo: bankInfoReducers.BankInfo,

  // Board
  priceBoard: priceBoardReducer.PriceBoard,
  marketStatus: marketStatusReducer.MarketStatus,
  newSymbolData: symbolDataReducers.NewSymbolData,
  newIndexData: symbolDataReducers.NewIndexData,
  newSymbolOddlotData: symbolDataReducers.NewSymbolOddlotData,
  boardData: symbolDataReducers.BoardData,
  symbolOddlotBoardData: symbolDataReducers.SymbolOddlotBoardData,
  indexBoardData: symbolDataReducers.IndexBoardData,
  indexBoardRealtimeData: symbolDataReducers.IndexBoardRealtimeData,
  putthroughDeal: putThroughBoardReducers.PutthroughDeal,
  putthroughAdvertiseBid: putThroughBoardReducers.PutthroughAdvertiseBid,
  putthroughAdvertiseAsk: putThroughBoardReducers.PutthroughAdvertiseAsk,
  resetMarketDataTrigger: resetMarketDataTriggerReducer.ResetMarketDataTrigger,
  resetBoardDataTrigger: resetBoardDataTriggerReducer.ResetBoardDataTrigger,
  symbolQuoteData: symbolQuoteReducers.SymbolQuoteData,
  symbolQuoteChart: symbolQuoteReducers.SymbolQuoteChart,
  symbolQuoteSubscribedData: symbolQuoteReducers.SymbolQuoteSubscribedData,
  symbolCachedData: symbolCachedDataReducers.SymbolCachedData,
  symbolOddlotCachedData: symbolCachedDataReducers.SymbolOddlotCachedData,
  symbolInfoModal: currentSymbolReducers.SymbolInfoModal,
  watchlist: watchlistReducer.Watchlist,
  watchlistServer: watchlistServerReducer.WatchlistServer,
  selectedWatchlist: SelectedWatchlist,
  watchlistData: WatchlistData,
  indexStockList: priceBoardReducer.IndexStockList,

  // Account
  portfolios: portfolioReducers.Portfolios,
  equityPortfolio: portfolioReducers.EquityPortfolio,
  derivativesPortfolio: portfolioReducers.DerivativesPortfolio,
  stockTransfer: stockTransferReducers.StockTransfer,
  stockTransferHistory: stockTransferReducers.StockTransferHistory,
  stockTransferSubmit: stockTransferReducers.StockTransferSubmit,
  assetInformation: assetInforReducers.AssetInformation,
  assetInforDerivatives: assetInforReducers.AssetInforDerivatives,
  accountOpenPositionItem:
    accountOpenPositionItemReducer.AccountOpenPositionItem,
  accountRealizedPortfolio:
    accountRealizedPortfolioReducer.AccountRealizedPortfolio,
  securitiesStatement: securitiesStatementReducer.SecuritiesStatement,
  equityOrderHistory: orderHistoryReducers.EquityOrderHistory,
  drOrderHistory: orderHistoryReducers.DrOrderHistory,
  stopOrderHistory: stopOrderHistoryReducer.StopOrderHistory,
  equityLoanStatement: loanStatementReducer.EquityLoanStatementReducer,
  equityLoanContract: loanContractReducer.EquityLoanContractReducer,
  orderBook: orderBookReducers.OrderBook,
  orderBookDetail: orderBookReducers.OrderBookDetail,
  orderConfirmation: orderConfirmationReducers.OrderConfirmation,
  orderConfirmationSubmit: orderConfirmationReducers.OrderConfirmationSubmit,
  equytyRightExerciseSubscriptions:
    rightSubscriptionsReducer.EquytyRightExerciseSubscriptions,
  equityRightInformation: rightInfomationReducers.EquityRightInformation,
  equityAvailablePowerExercise:
    rightInfomationReducers.EquityAvailablePowerExercise,
  equityRightSubsHistory: rightInfomationReducers.EquityRightSubsHistory,
  equityRightInforOnPopUp: rightInfomationReducers.EquityRightInforOnPopUp,
  statusRightInforResgisterPost:
    rightInfomationReducers.StatusRightInforResgisterPost,
  equityCashAdvanced: cashAdvancedReducers.EquityCashAdvanced,
  equityCashAdvancedHistory: cashAdvancedReducers.EquityCashAdvancedHistory,
  equityCashAdvancedAmount: cashAdvancedReducers.EquityCashAdvancedAmount,
  equityCashAdvancedPayment: cashAdvancedReducers.EquityCashAdvancedPayment,
  equityCashAdvancedPaymentTime:
    cashAdvancedReducers.EquityCashAdvancedPaymentTime,
  equityCashAdvancedInterestAmt:
    cashAdvancedReducers.EquityCashAdvancedInterestAmt,
  positionStatement: positionStatementReducer.PositionStatement,
  equityInterestExpenseStatement:
    interestExpenseStatementReducer.EquityInterestExpenseStatement,
  equityConfirmDebt: equityConfirmDebtReducer.EquityConfirmDebt,
  equitySubmitConfirmDebt: equityConfirmDebtReducer.EquitySubmitConfirmDebt,
  equityCashTransferHistory:
    cashTransferHistoryReducers.EquityCashTransferHistoryReducer,
  equityTransferableAmount: transferableAmountReducers.EquityTransferableAmount,
  equitySubAccount: cashTransferInternalSubReducer.EquitySubAccount,
  equityBankInfo: cashTransferToBankReducer.EquityBankInfo,
  DerivativeTransferableAmount:
    transferableAmountReducers.DerivativeTransferableAmount,
  VSDCashTransferHistory:
    cashTransferHistoryReducers.VSDCashTransferHistoryReducer,
  equityCashTransferResult: cashTransferReducers.CashTransferResult,
  VSDCashTransferResult: cashTransferReducers.VSDCashTransferResult,
  derivativeInternalCashTransferResult:
    cashTransferReducers.DerivativeInternalCashTransferResult,
  derivativeBankCashTransferResult:
    cashTransferReducers.DerivativeBankCashTransferResult,
  derivativeCashTransferHistory:
    cashTransferHistoryReducers.DerivativeCashTransferHistoryReducer,
  derivativeTransferableAmount:
    transferableAmountReducers.DerivativeTransferableAmount,
  equityCashStatement: cashStatementReducers.EquityCashStatement,
  derivativesCashStatement: cashStatementReducers.DerivativesCashStatement,
  orderStockInfo: orderFormReducers.OrderStockInfo,
  orderStockInfoModal: orderFormReducers.OrderStockInfoModal,
  orderStockChangeHeight: orderFormReducers.OrderChangeHeight,
  resetPassword: resetPasswordReducers.resetPassword,

  // Order
  placeOrderResult: orderResultReducers.PlaceOrderResult,
  modifyOrderResult: orderResultReducers.ModifyOrderResult,
  cancelOrderResult: orderResultReducers.CancelOrderResult,
  speedOrder: speedOrderReducers.SpeedOrder,
  modifySpeedOrderResult: speedOrderReducers.ModifySpeedOrderResult,
  cancelSpeedOrderResult: speedOrderReducers.CancelSpeedOrderResult,
  isSingleClickSpeedOrder: speedOrderReducers.IsSingleClickSpeedOrder,

  // Debugging
  isDebugging: IsDebugging,

  // ChangePasswordStatus
  changePasswordStatus: accountInforReducer.ChangePasswordStatus,
  changePINStatus: accountInforReducer.ChangePINStatus,
  clientDetail: clientDetailReducer.ClientDetail,

  //EKYC
  ekycParams: Ekyc.EkycParams,
  ekycDocumentType: Ekyc.EkycDocumentType,
  ekycSdkData: Ekyc.EkycSdkData,
  ekycOTP: Ekyc.EkycOTP,
  ekycOTPResult: Ekyc.EkycOTPResult,
  ekycUploadImageFailed: Ekyc.EkycUploadImageFailed,
  ekycRegisterResult: Ekyc.EkycRegisterResult,
});

export type IState = ReturnType<typeof appReducer>;

export const rootReducer = (state: IState, action: AnyAction) => {
  return appReducer(state, action);
};
