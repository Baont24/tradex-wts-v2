import { INavbar, INavbarTitle } from 'interfaces/config';
import {
  Routes,
  AccountRoutes,
  InfoRoutes,
  BoardRoutes,
} from 'constants/routes';
import { SystemType } from 'constants/enum';

export const NAVBAR_BOARD: INavbar = {
  key: 'board',
  title: INavbarTitle.Board,
  route: Routes.BOARD,
  isAuthenticated: false,
  tab: [],
};

export const NAVBAR_BOARD_AUTHENTICATED: INavbar = {
  key: 'board-auth',
  title: INavbarTitle.Board,
  route: Routes.BOARD,
  isAuthenticated: true,
  tab: [
    {
      title: 'Board',
      route: '',
    },
    {
      title: 'Trading Template',
      route: BoardRoutes.TRADING_TEMPLATE,
    },
  ],
};

export const NAVBAR_ACCOUNT: INavbar = {
  key: 'account',
  title: INavbarTitle.Account,
  route: Routes.ACCOUNT,
  isAuthenticated: true,
  pinned: true,
  systemType: SystemType.EQUITY,
  tab: [
    {
      title: 'Account Summary',
      route: AccountRoutes.SUMMARY,
      subTab: [{ title: 'Account Summary', route: AccountRoutes.SUMMARY }],
    },
    {
      title: 'Portfolio 2',
      route: AccountRoutes.PORTFOLIO,
      subTab: [
        { title: 'Portfolio 2', route: AccountRoutes.PORTFOLIO },
        {
          title: 'Securities Statement',
          route: AccountRoutes.SECURITIES_STATEMENT,
        },
        { title: 'Stock Transfer', route: AccountRoutes.STOCK_TRANSFER },
      ],
    },
    {
      title: 'Asset Management',
      route: AccountRoutes.ASSET_MANAGEMENT,
      subTab: [
        { title: 'Asset Infomation', route: AccountRoutes.ASSET_MANAGEMENT },
        { title: 'Cash In Advanced', route: AccountRoutes.CASH_IN_ADVANCED },
        { title: 'Cash Statement', route: AccountRoutes.CASH_STATEMENT },
        { title: 'Loan Detail', route: AccountRoutes.LOAN_DETAIL },
      ],
    },
    {
      title: 'Order Book',
      route: AccountRoutes.ORDER_BOOK,
      subTab: [
        { title: 'Active Order', route: AccountRoutes.ACTIVE_ORDER },
        { title: 'Order Book', route: AccountRoutes.ORDER_BOOK },
        { title: 'Order History', route: AccountRoutes.ORDER_HISTORY },
        {
          title: 'Stop Order History',
          route: AccountRoutes.STOP_ORDER_HISTORY,
        },
        {
          title: 'Order Confirmation',
          route: AccountRoutes.ORDER_CONFIRMATION,
        },
      ],
    },
    {
      title: 'Withdraw Money 2',
      route: AccountRoutes.CASH_TRANSFER_REQUEST,
      subTab: [
        {
          title: 'Withdraw Money 2',
          route: AccountRoutes.CASH_TRANSFER_REQUEST,
        },
      ],
    },
    {
      title: 'Right Exercise',
      route: AccountRoutes.RIGHT_INFORMATION,
      subTab: [
        { title: 'Right Infomation', route: AccountRoutes.RIGHT_INFORMATION },
        {
          title: 'Right Subscriptions',
          route: AccountRoutes.RIGHTS_SUBSCRIPTIONS,
        },
      ],
    },
  ],
};

export const NAVBAR_ACCOUNT_DERIVATIVES: INavbar = {
  key: 'account-derivatives',
  title: INavbarTitle.Account,
  route: Routes.ACCOUNT,
  isAuthenticated: true,
  pinned: true,
  systemType: SystemType.DERIVATIVES,
  tab: [
    {
      title: 'Account Summary',
      route: `summary`,
      subTab: [{ title: 'Account Summary', route: AccountRoutes.SUMMARY }],
    },
    {
      title: 'Portfolio 2',
      route: AccountRoutes.PORTFOLIO,
      subTab: [
        { title: 'Portfolio 2', route: AccountRoutes.PORTFOLIO },
        {
          title: 'Realized Portfolio',
          route: AccountRoutes.REALIZED_PORTFOLIO,
        },
        {
          title: 'Position Statement',
          route: AccountRoutes.POSITION_STATEMENT,
        },
      ],
    },
    {
      title: 'Asset Management',
      route: AccountRoutes.ASSET_MANAGEMENT,
      subTab: [
        { title: 'Asset Infomation', route: AccountRoutes.ASSET_MANAGEMENT },
        { title: 'Cash Statement', route: AccountRoutes.CASH_STATEMENT },
      ],
    },
    {
      title: 'Order Book',
      route: AccountRoutes.ORDER_BOOK,
      subTab: [
        { title: 'Active Order', route: AccountRoutes.ACTIVE_ORDER },
        { title: 'Order Book', route: AccountRoutes.ORDER_BOOK },
        { title: 'Order History', route: AccountRoutes.ORDER_HISTORY },
        {
          title: 'Stop Order History',
          route: AccountRoutes.STOP_ORDER_HISTORY,
        },
        {
          title: 'Order Confirmation',
          route: AccountRoutes.ORDER_CONFIRMATION,
        },
      ],
    },
    {
      title: 'Deposit and Withdraw',
      route: AccountRoutes.CASH_TRANSFER_REQUEST,
      subTab: [
        {
          title: 'Cash Transfer Request',
          route: AccountRoutes.CASH_TRANSFER_REQUEST,
        },
      ],
    },
  ],
};

export const NAVBAR_INFORMATION: INavbar = {
  key: 'information',
  title: INavbarTitle.Information,
  route: Routes.INFORMATION,
  isAuthenticated: true,
  pinned: true,
  tab: [
    {
      title: 'Account Info',
      route: InfoRoutes.PROFILE,
      subTab: [
        { title: 'Customer Profile', route: InfoRoutes.PROFILE },
        { title: 'Change Password', route: InfoRoutes.CHANGE_PASSWORD },
      ],
    },
    {
      title: 'Authorized Person Info',
      route: InfoRoutes.AUTHORIZED,
    },
    // {
    //   title: 'Online Registration',
    //   route: InfoRoutes.REGISTRATION,
    // },
    // {
    //   title: 'Alert Setting',
    //   route: InfoRoutes.ALERT,
    // },
    // {
    //   title: 'Loyalty',
    //   route: InfoRoutes.LOYALTY,
    // },
  ],
};

const navConfig: INavbar[] = [
  NAVBAR_BOARD,
  NAVBAR_BOARD_AUTHENTICATED,
  NAVBAR_ACCOUNT,
  NAVBAR_ACCOUNT_DERIVATIVES,
  NAVBAR_INFORMATION,
];

export default navConfig;
