import * as accountSagas from './Account';
import * as assetInformationSagas from 'components/areas/Account/AssetInformation/sagas';
import * as authSagas from './Authentication';
import * as cashAdvancedSagas from 'components/areas/Account/CashAdvanced/sagas';
import * as cashStatementSagas from 'components/areas/Account/CashStatement/sagas';
import * as cashTransferHistorySagas from 'components/areas/Account/CashTransfer/CashTransferHistory/sagas';
import * as cashTransferInternalSubSagas from 'components/areas/Account/CashTransfer/CashTransferInternalSub/saga';
import * as cashTransferSagas from 'components/areas/Account/CashTransfer/saga';
import * as cashTransferToBankSagas from 'components/areas/Account/CashTransfer/CashTransferToBank/saga';
import * as commonSagas from './Common';
import * as confirmDebt from 'components/areas/Account/LoadDetail/ConfirmDebt/sagas';
import * as ekyc from './KisEkyc';
import * as forgotPassword from '../../screens/ForgotPassword/saga';
import * as interestExpenseStatementSagas from 'components/areas/Account/LoadDetail/InterestExpenseStatement/sagas';
import * as localizationSagas from './Localization';
import * as marketPutThroughSagas from 'components/areas/Board/PriceBoard/PutThroughBoard/sagas';
import * as marketSagas from './Market';
import * as orderBookSagas from 'components/areas/Account/OrderBook/sagas';
import * as orderConfirmationSagas from 'components/areas/Account/OrderConfirmation/sagas';
import * as orderFormSagas from 'components/common/OrderForm/sagas';
import * as orderSagas from './Order';
import * as portfolioSagas from 'components/areas/Account/Portfolio/sagas';
import * as positionStatementSagas from 'components/areas/Account/PositionStatement/sagas';
import * as priceBoardSagas from 'components/areas/Board/PriceBoard/sagas';
import * as realizedPortfolioSagas from 'components/areas/Account/RealizedPortfolio/saga';
import * as rightInformationSagas from 'components/areas/Account/RightInfomation/sagas';
import * as securitiesStatementSagas from 'components/areas/Account/SecuritiesStatement/sagas';
import * as socketSagas from './Socket';
import * as speedOrderSagas from 'components/common/SpeedOrder/sagas';
import * as stockTransferSagas from 'components/areas/Account/StockTransfer/sagas';
import * as stopOrderHistorySagas from 'components/areas/Account/StopOrderHistory/sagas';
import * as watchlistSagas from './WatchList/QueryWatchList';
import { all } from 'redux-saga/effects';

export default function* () {
  yield all([
    // Socket
    socketSagas.initSocket(),
    socketSagas.authenticateSocket(),
    socketSagas.unauthenticateSocket(),

    // Localization
    localizationSagas.initI18n(),
    localizationSagas.changeLanguage(),

    //ekyc
    ekyc.ekycSendOTP(),
    ekyc.ekycVerifyOTP(),
    ekyc.uploadImage(),
    ekyc.registerEkyc(),

    // Authentication
    authSagas.login(),
    authSagas.otp(),
    authSagas.logout(),
    authSagas.verifyOTP(),
    authSagas.changePassword(),
    authSagas.changePIN(),

    // Common
    commonSagas.getNotifications(),
    commonSagas.showNotification(),
    commonSagas.clearAllNotifications(),
    commonSagas.clearNotificationUnseenCount(),
    commonSagas.changeAccount(),
    commonSagas.getLastTradingDate(),

    // Board
    priceBoardSagas.watchPriceBoardActions(),

    // Market
    marketSagas.initMarket(),
    marketSagas.getIndexStockList(),
    marketSagas.querySymbolData(),
    marketSagas.queryIndexData(),
    marketSagas.queryWatchlistData(),
    marketSagas.subscribeSymbol(),
    marketSagas.unsubscribeSymbol(),
    marketSagas.getIndexMinutes(),
    marketSagas.refreshMarket(),
    marketSagas.symbolQuoteData(),
    marketSagas.getCurrentSymbol(),
    marketSagas.getMarketStatus(),
    marketSagas.getWatchlistData(),
    marketSagas.toggleSymbolInfoModal(),
    marketSagas.getSymbolOddlot(),
    marketSagas.subscribeOrderMatch(),
    stopOrderHistorySagas.watchQueryStockTransfer(),
    marketPutThroughSagas.watchQueryMarketPutthrough(),

    // Order
    orderSagas.placeEquityOrder(),
    orderSagas.modifyEquityOrder(),
    orderSagas.cancelEquityOrder(),
    orderSagas.placeDerivativesOrder(),
    orderSagas.modifyDerivativesOrder(),
    orderSagas.cancelDerivativesOrder(),
    orderFormSagas.watchGetOrderStockInfo(),
    speedOrderSagas.watchGetSpeedOrderData(),

    // Account
    accountSagas.enquiryPortfolio(),
    accountSagas.enquiryPortfolios(),
    accountSagas.queryRightSubscriptions(),
    stockTransferSagas.watchQueryStockTransfer(),
    orderBookSagas.watchQueryOrderBook(),
    orderBookSagas.watchQueryOrderBookDetail(),
    assetInformationSagas.getAssetInformation(),
    assetInformationSagas.getAssetInforDerivatives(),
    rightInformationSagas.watchRightInformation(),
    rightInformationSagas.watchRightSubsHistory(),
    rightInformationSagas.watchRightInforOnPopUp(),
    rightInformationSagas.watchRightInforResgisterPost(),
    rightInformationSagas.watchAvailablePowerExerciseRight(),
    cashStatementSagas.watchCashStatement(),
    cashAdvancedSagas.watchQueryEquityCashAdvanced(),
    portfolioSagas.watchGetAccountOpenPositionItem(),
    realizedPortfolioSagas.watchGetAccountRealizedPortfolio(),
    positionStatementSagas.watchQueryPositionStatement(),
    interestExpenseStatementSagas.watchQueryInterestExpenseStatement(),
    confirmDebt.watchConfirmDebt(),
    orderConfirmationSagas.watchQueryOrderConfirmation(),
    watchlistSagas.watchQueryWatchList(),
    accountSagas.getEquityOrderHistory(),
    accountSagas.getDrOrderHistory(),
    accountSagas.queryEquityLoanStatement(),
    accountSagas.queryClientDetail(),
    accountSagas.queryTransferableAmount(),
    cashTransferInternalSubSagas.watchEquitySubAccount(),
    cashTransferToBankSagas.watchEquityBankInfo(),
    cashTransferHistorySagas.watchEquityCashTransferHistory(),
    cashTransferHistorySagas.watchDerivativeCashTransferHistory(),
    cashTransferHistorySagas.watchVSDCashTransferHistory(),
    cashTransferSagas.watchDoCashTransfer(),
    cashTransferSagas.watchDoDerivativeBankCashTransfer(),
    cashTransferSagas.watchDoDerivativeInternalCashTransfer(),
    cashTransferSagas.watchDoVSDCashTransfer(),
    cashTransferSagas.watchDodoQueryVSDTransferableAmount(),
    cashTransferSagas.watchShowCashTransferNotification(),
    accountSagas.loadBankInfo(),
    securitiesStatementSagas.watchGetStockTransactionHistory(),
    forgotPassword.verifyIdentity(),
  ]);
}
