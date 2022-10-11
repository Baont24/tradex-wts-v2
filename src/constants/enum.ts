export enum Domain {
  MAS = 'mas',
  VCSC = 'vcsc',
  KIS = 'kis',
}

export enum Lang {
  VI = 'vi',
  EN = 'en',
  KO = 'ko',
  ZH = 'zh',
}

export enum WS {
  PRICE_BOARD = 'priceBoard',
  WTS = 'wts',
  TTL = 'ttl',
  EKYC = 'ekyc',
  MOBILE_SERVER = 'mobileServer',
}

export enum SystemType {
  EQUITY = 'EQUITY',
  DERIVATIVES = 'DERIVATIVES',
}

export enum Core {
  LOTTEHPT = 'LOTTEHPT',
  FSS = 'FSS',
  TTL = 'TTL',
}

export enum SymbolType {
  STOCK = 'STOCK',
  FUND = 'FUND',
  ETF = 'ETF',
  FUTURES = 'FUTURES',
  CW = 'CW',
  BOND = 'BOND',
  INDEX = 'INDEX',
}

export enum SpeedOrderClickType {
  SINGLE_CLICK = 'SINGLE_CLICK',
  DOUBLE_CLICK = 'DOUBLE_CLICK',
}

export enum Market {
  HOSE = 'HOSE',
  HNX = 'HNX',
  UPCOM = 'UPCOM',
}

export enum CandleType {
  HIGH_LOW = 'HIGH_LOW',
  CE_FL = 'CE_FL',
}

export enum HiddenType {
  HIDDEN_INDEX_LIST = 'HIDDEN_INDEX_LIST',
  HIDDEN_BOARD = 'HIDDEN_BOARD',
}

export enum RealtimeChannelDataType {
  QUOTE = 'QUOTE',
  BID_OFFER = 'BID_OFFER',
  EXTRA = 'EXTRA',
}

export enum PeriodOptions {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
}

export enum OrderFormViewMode {
  VERTICAL,
  HORIZONTAL,
}

export enum OrderFormDisplayMode {
  FORM,
  MODAL,
  BOTTOM_FORM,
}

export enum SellBuyType {
  BUY = 'BUY',
  SELL = 'SELL',
}

export enum OrderKind {
  NORMAL_ORDER = 'Normal Order',
  QUICK_ORDER = 'Quick Order',
  STOP_LIMIT_ORDER = 'Stop Limit Order',
  CONDITIONAL_ORDER = 'Conditional Order',
}

export enum OrderFormActionMode {
  CANCEL = 'Cancel',
  MODIFY = 'Modify',
}

export enum OrderType {
  LO = 'LO',
  MP = 'MP',
  ATO = 'ATO',
  ATC = 'ATC',
  MOK = 'MOK',
  MAK = 'MAK',
  MTL = 'MTL',
  PLO = 'PLO',
  ODDLOT = 'ODDLOT',
}

export enum MarketStatus {
  ATO = 'ATO',
  LO = 'LO',
  INTERMISSION = 'INTERMISSION',
  ATC = 'ATC',
  PLO = 'PLO',
  RUNOFF = 'RUNOFF',
  CLOSED = 'CLOSED',
}

export enum StopOrderStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
  Sending = 'SENDING',
}

export enum StopOrderType {
  STOP = 'STOP',
  STOP_LIMIT = 'STOP_LIMIT',
}

export enum DERIVATIVES_TRANSFER_IM_TYPE {
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW',
}

export enum DERIVATIVES_TRANSFER_IM_BANK_TYPE {
  DEPOSIT_FROM = 'DEPOSIT_FROM',
  DEPOSIT_TO = 'DEPOSIT_TO',
  WITHDRAW_FROM = 'WITHDRAW_FROM',
  WITHDRAW_TO = 'WITHDRAW_TO',
}

export enum DerivativesAdvanceOrderType {
  AO = 'AO',
  CAO = 'CAO',
}

export enum DerivativesMarketSession {
  ATO = 'ATO',
  MORNING = 'MORNING',
  AFTERNOON = 'AFTERNOON',
  ATC = 'ATC',
}

export enum OrderPass {
  PIN = 'PIN',
  OTP = 'OTP',
  CA = 'CA',
}

export enum SendOTP {
  WITHDRAW_CASH = 'WITHDRAW_CASH',
  DEPOSIT_CASH = 'DEPOSIT_CASH',
  PAY_OVERDRAFT = 'PAY_OVERDRAFT',
  CASH_TRANSFER_EXTERNAL = 'CASH_TRANSFER_EXTERNAL',
  CASH_TRANSFER_INTERNAL = 'CASH_TRANSFER_INTERNAL',
  TRANSFER_REGISTER = 'TRANSFER_REGISTER',
  CONFIRM_ORDER = 'CONFIRM_ORDER',
  CONVERTIBLE_BOND = 'CONVERTIBLE_BOND',
  CONFIRM_ORDER_DERIVATIVES = 'CONFIRM_ORDER_DERIVATIVES',
  ODD_ORDER_REGISTER = 'ODD_ORDER_REGISTER',
  ODD_ORDER_HISTORY = 'ODD_ORDER_HISTORY',
  ORDER_FORM = 'ORDER_FORM',
  AVAILABLE_LOAN = 'AVAILABLE_LOAN',
  SHARE_BUYING_RIGHT = 'SHARE_BUYING_RIGHT',
  SPEED_ORDER = 'SPEEDORDER',
}

export enum SEND_OTP_METHOD {
  SMS = 'SMS',
  EMAIL = 'EMAIL',
}

export enum REPORT_TYPE {
  PDF = 'PDF',
  XLSX = 'XLSX',
}

export enum FEE_TYPE {
  IN_FEE = 'inFee',
  OUT_FEE = 'outFee',
}

export enum CASH_TRANSFER_TYPE {
  INTERNAL = 'internal',
  EXTERNAL = 'external',
}

export enum SocketStatus {
  CONNECTED = 'Connected',
  DISCONNECTED = 'Disconnected',
  CONNECTING = 'Connecting',
}

export enum IndexSliderState {
  HIDE,
  HALF_SHOW,
  SHOW,
}

export enum SymbolSession {
  ATO = 'ATO',
  ATC = 'ATC',
  CONTINUOUS = 'CONTINUOUS',
}

export enum IndexStock {
  VN30 = 'VN30',
  HNX30 = 'HNX30',
}

export enum SocketAuthState {
  AUTHENTICATED = 'authenticated',
  UNAUTHENTICATED = 'unauthenticated',
}

export enum FormAction {
  CREATE = 'CREATE',
  EDIT = 'EDIT',
}

export enum OtpCodeEnum {
  MATRIX = 'MATRIX_CARD',
  HARDWARE_OTP = 'SMART_OTP',
  SMART_OTP = 'SMART_OTP',
}

export enum MatrixOtpType {
  SINGLE_KEY = 'SINGLE_KEY',
  DOUBLE_KEY = 'DOUBLE_KEY',
}

export enum SplashScreenType {
  LOADINGBAR = 'LOADINGBAR',
  SPINNER = 'SPINNER',
}

export enum StockTransferHisStatus {
  All = 'All',
  INTERNAL = 'INTERNAL',
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW',
}

export enum OrderStatus {
  All = 'ALL',
  NONE = 'NONE',
  CANCELLED = 'CANCELLED',
  // QUEUE = 'QUEUE',
  ACTIVE = 'ACTIVE',
  Inactive = 'INACTIVE',
  FULLY_EXECUTED = 'FULLYFILLED',
  PARTIALLY_FILLED = 'PARTIALLYFILL',
  Rejected = 'REJECTED',
  READYTOSEND = 'READYTOSEND',
  Sending = 'SENDING',
  Stop = 'STOP',
  PENDINGAPPROVAL = 'PENDINGAPPROVAL',
  QUEUED = 'QUEUED',
  EXP = 'EXPIRED',
  WAITINGCANCEL = 'WAITINGCANCEL',
  WAITINGMODIFY = 'WAITINGMODIFY',
}
export enum OrderHistoryStatus {
  All = 'ALL',
  CANCELLED = 'CANCELLED',
  FULLY_EXECUTED = 'FULLY_EXECUTED',
  Rejected = 'REJECTED',
  EXP = 'EXP',
}
export enum ActiveOrderStatus {
  ALL = 'ALL',
  QUEUE = 'ACK',
  INACTIVE = 'INACTIVE',
  PARTIALLY_FILLED = 'PARTIALLYFILL',
  PENDING_APPROVAL = 'PENDINGAPPROVAL',
  NEW = 'READYTOSEND',
  SENDING = 'SENDING',
  WAITING_CANCEL = 'WAITINGCANCEL',
  UNMATCH = 'UNMATCH',
}

export enum DrOrderStatus {
  All = 'ALL',
  PENDINGAPPROVAL = 'PENDING_APPROVAL',
  READY_TO_SEND = 'READY_TO_SEND',
  OUTSTANDING = 'OUTSTANDING',
  Sending = 'SENDING',
  NOTIFIED = 'NOTIFIED',
  Rejected = 'REJECTED',
  FILLED = 'FILLED',
  CANCELLED = 'CANCELLED',
  Inactive = 'INACTIVE',
  KILLED = 'KILLED',
  FILL_AND_KILL = 'FILL_AND_KILL',
  QUEUE = 'QUEUE',
  STOP_READY = 'STOP_READY',
  STOP_FAILED = 'STOP_FAILED',
  STOP_INACTIVE = 'STOP_INACTIVE',
}
export enum DrOrderHistoryStatus {
  All = 'ALL',
  FILLED = 'FILLED',
  Rejected = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export enum OrderStatusResponse {
  STOP_SENT = 'STOP_SENT',
  PENDING_REPORT_TO_BIX = 'PENDING_REPORT_TO_BIX',
  STOP_ORDER_INACTIVE = 'STOP_ORDER_INACTIVE',
  INACTIVE_ORDER = 'INACTIVE_ORDER',
  STOP_ORDER_READY = 'STOP_ORDER_READY',
  PENDINGAPPROVAL = 'PENDING_APPROVAL',
  READY_TO_SEND = 'READY_TO_SEND',
  SENDING = 'SENDING',
  QUEUE = 'QUEUE',
  MODIFY_SENT = 'MODIFY_SENT',
  CANCEL_SENT = 'CANCEL_SENT',
  WAIT_TO_CANCEL = 'WAIT_TO_CANCEL',
  REJECT = 'REJECT',
  CANCELLED = 'CANCELLED',
  FILLED_ALL = 'FILLED_ALL',
  MODIFY_PENDING_APPROVAL = 'MODIFY_PENDING_APPROVAL',
  PARTIALLY_FILLED = 'PARTIALLY_FILLED',
  UNDEFINED = 'UNDEFINED',
  EXPIRED = 'EXPIRED',
  PARTIALLY_EXPIRED = 'PARTIALLY_EXPIRED',
  CONDITIONAL = 'CONDITIONAL',
  PRICE_WARING = 'PRICE_WARING',
  COMPLETED = 'COMPLETED',
  NEW = 'NEW',
  INACTIVE = 'INACTIVE',
  PRICE_WARNING = 'PRICE_WARNING',
  KILLED = 'KILLED',
  FILLED_PARTLY = 'FILLED_PARTLY',
  FILLED_AND_KILLED = 'FILLED_AND_KILLED',
  COI = 'COI',
  OCO = 'OCO',
  OCI = 'OCI',
  BE_ALLOCATED = 'BE_ALLOCATED',
  TRIGGER_ORDER = 'TRIGGER_ORDER',
  WAITING_MODIFY = 'WAITING_MODIFY',
  WAITING_CANCEL = 'WAITING_CANCEL',
  FULLY_EXECUTED = 'FULLY_EXECUTED',
  WAITING = 'WAITING',
}

export enum RightSubsHistoryStatus {
  All = 'All',
  COMPLETED = 'Completed',
  WAITING = 'Waiting',
  REJECTED = 'Rejected',
}

export enum AccountType {
  EQUITY = 'X',
  MARGIN = 'M',
  DERIVATIVES = 'D',
}

export enum FunctionKey {
  DASHBOARD = 'DASHBOARD',
  INFO = 'INFO',
  ALARM = 'ALARM',
  CALENDAR = 'CALENDAR',
  QUICK_ORDER = 'QUICK_ORDER',
  ORDER = 'ORDER',
  CHART = 'CHART',
  NOTIFICATION = 'NOTIFICATION',
  HELP = 'HELP',
  SETTING = 'SETTING',
  FEEDBACK = 'FEEDBACK',
  ORDER_BOOK = 'ORDER_BOOK',
  CASH = 'CASH',
  PORTFOLIO = 'PORTFOLIO',
}

export enum TransferType {
  TO_SUB = 'TO_SUB',
  TO_BANK = 'TO_BANK',
  FROM_TO_VSD = 'FROM_TO_VSD',
  VSD_DEPOSIT = 'VSD_DEPOSIT',
  VSD_WITHDRAW = 'VSD_WITHDRAW',
  EQT_TO_DR = 'EQT_TO_DR',
  DR_TO_EQT = 'DR_TO_EQT',
}

export enum TransferTypeResponse {
  INTERNAL = 'INTERNAL',
  EXTERNAL = 'EXTERNAL',
}

export enum CashTransferStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  DELETED = 'DELETED',
}

export enum HyperlinkUserGuide {
  USER_GUIDE_EN = 'https://masvn.com/api/attachment/file/1620899496047-Mirae_asset_WTS_User_guide.pdf ',
  USER_GUIDE_VI = 'https://masvn.com/api/attachment/file/1620899475995-Mirae_asset_Huong_dan_su_dung_WTS.pdf',
}

export enum HyperlinkInForm {
  FORGOT_PASSWORD_EN = 'https://wts.masvn.com/home/account/resetpassword.do',
  FORGOT_PASSWORD_VI = 'https://wts.masvn.com/home/account/resetpassword.do',

  OPEN_ACCOUNT_FREE_EN = 'https://www.masvn.com/en/register',
  OPEN_ACCOUNT_FREE_VI = 'https://www.masvn.com/register',
}

export enum HyperlinksInBottomMenu {
  SUPPORT_EN = 'https://www.masvn.com/en/cate/support-center-6',
  SUPPORT_VI = 'https://www.masvn.com/cate/trung-tam-ho-tro-6',

  PRIVACY_POLICY_EN = 'https://www.masvn.com/en/cate/privacy-policy-1202',
  PRIVACY_POLICY_VI = 'https://www.masvn.com/cate/bao-mat-thong-tin-1202',

  TERMS_OF_USE_EN = 'https://www.masvn.com/en/cate/terms-of-use-1203',
  TERMS_OF_USE_VI = 'https://www.masvn.com/cate/dieu-khoan-su-dung-1203',
}

export enum CandleType {
  HIGHT_LOW_CANDLE = 'High - Low Candle',
  CELING_FLOOR_CANDLE = 'Celing - Floor Candle',
}

export enum SessionTimeout {
  EIGHT_HRS = '480',
  THREE_HRS = '180',
  SIX_MINS = '60',
  THREE_MINS = '30',
}

export enum LocationBisAskUI {
  BID_ASK = 'BID_ASK',
  ASK_BID = 'ASK_BID',
}
