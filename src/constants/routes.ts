export enum Routes {
  BOARD = 'board',
  ACCOUNT = 'account',
  INFORMATION = 'information',
  LOGIN = 'login',
  EKYC = 'ekyc',
  EKYC_EN = 'ekyc-en',
  EKYC_VN = 'ekyc-vi',
  ROOT = '',
  FORGOT_PASSWORD = 'forgot-password',
}

export enum BoardRoutes {
  TRADING_TEMPLATE = 'trading-template',
}

export enum BoardMarketRoutes {
  VN30 = 'vn30',
  HOSE = 'hsx',
  HNX30 = 'hnx30',
  HNX = 'hnx',
  UPCOM = 'upcom',
  FUTURES = 'futures',
  FUTURES_BOND = 'futures-bond',
  CW = 'cw',
  ETF = 'ETF',
  ETF_HSX = 'ETF_HSX',
  ETF_HNX = 'ETF_HNX',
  PUTTHROUGH_HSX = 'putthrough-hsx',
  PUTTHROUGH_HNX = 'putthrough-hnx',
  PUTTHROUGH_UPCOM = 'putthrough-upcom',
  ODDLOT_HNX = 'oddlot-hnx',
  ODDLOT_UPCOM = 'oddlot-upcom',
}

export enum AccountRoutes {
  SUMMARY = 'summary',
  PORTFOLIO = 'portfolio',
  REALIZED_PORTFOLIO = 'realized-portfolio',
  SECURITIES_STATEMENT = 'securities-statement',
  POSITION_STATEMENT = 'position-statement',
  STOCK_TRANSFER = 'stock-transfer',
  ASSET_MANAGEMENT = 'asset-management',
  CASH_IN_ADVANCED = 'cash-in-advanced',
  CASH_STATEMENT = 'cash-statement',
  LOAN_DETAIL = 'loan-detail',
  ACTIVE_ORDER = 'active-order',
  ORDER_BOOK = 'order-book',
  ORDER_HISTORY = 'order-history',
  STOP_ORDER_HISTORY = 'stop-order-history',
  ORDER_AUDIT_TRAIL = 'order-audit-trail',
  ORDER_CONFIRMATION = 'order-confirmation',
  WITHDRAW_MONEY = 'withdraw-money',
  CASH_TRANSFER_REQUEST = 'cash-transfer-request',
  DEPOSIT = 'deposit',
  RIGHT_INFORMATION = 'right-information',
  RIGHTS_SUBSCRIPTIONS = 'rights-subscriptions',
}

export enum LoanDetailTab {
  LOAN_CONTRACT = 'Loan Contract',
  LOAN_STATEMENT = 'Loan Statement',
  INTEREST_EXPENSE_STATEMENT = 'Interest Expense Statement',
  CONFIRM_DEBT = 'Confirm Debt',
}

export enum InfoRoutes {
  ACCOUNT = 'account',
  CHANGE_PASSWORD = 'change-password',
  PROFILE = 'profile',
  AUTHORIZED = 'authorized',
  REGISTRATION = 'registration',
  ALERT = 'alert',
  LOYALTY = 'loyalty',
}
