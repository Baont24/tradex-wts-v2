import { AccountRoutes, LoanDetailTab } from 'constants/routes';
import { ITabTableData } from 'interfaces/common';
import { SystemType } from 'constants/enum';

export const portfolioTab = (
  key: AccountRoutes,
  component: React.ReactNode,
  systemType?: SystemType
): ITabTableData[] => {
  const portfolio = [
    {
      key: AccountRoutes.PORTFOLIO,
      title: 'Portfolio 2',
      default: key === AccountRoutes.PORTFOLIO,
      component: key === AccountRoutes.PORTFOLIO ? component : undefined,
    },
  ];

  return systemType === SystemType.DERIVATIVES
    ? [
        ...portfolio,
        {
          key: AccountRoutes.REALIZED_PORTFOLIO,
          title: 'Realized Portfolia',
          default: key === AccountRoutes.REALIZED_PORTFOLIO,
          component:
            key === AccountRoutes.REALIZED_PORTFOLIO ? component : undefined,
        },
        {
          key: AccountRoutes.POSITION_STATEMENT,
          title: 'Position Statement',
          default: key === AccountRoutes.POSITION_STATEMENT,
          component:
            key === AccountRoutes.POSITION_STATEMENT ? component : undefined,
        },
      ]
    : [
        ...portfolio,
        {
          key: AccountRoutes.SECURITIES_STATEMENT,
          title: 'Securities Statement',
          default: key === AccountRoutes.SECURITIES_STATEMENT,
          component:
            key === AccountRoutes.SECURITIES_STATEMENT ? component : undefined,
        },
        {
          key: AccountRoutes.STOCK_TRANSFER,
          title: 'Stock Transfer',
          default: key === AccountRoutes.STOCK_TRANSFER,
          component:
            key === AccountRoutes.STOCK_TRANSFER ? component : undefined,
        },
      ];
};

export const assetManagementTab = (
  key: AccountRoutes,
  component: React.ReactNode,
  systemType?: SystemType
): ITabTableData[] => {
  const assetManagement = [
    {
      key: AccountRoutes.ASSET_MANAGEMENT,
      title: 'Asset Infomation',
      default: key === AccountRoutes.ASSET_MANAGEMENT,
      component: key === AccountRoutes.ASSET_MANAGEMENT ? component : undefined,
    },
    {
      key: AccountRoutes.CASH_STATEMENT,
      title: 'Cash Statement',
      default: key === AccountRoutes.CASH_STATEMENT,
      component: key === AccountRoutes.CASH_STATEMENT ? component : undefined,
    },
  ];

  return systemType === SystemType.DERIVATIVES
    ? assetManagement
    : [
        assetManagement[0],
        {
          key: AccountRoutes.CASH_IN_ADVANCED,
          title: 'Cash In Advanced',
          default: key === AccountRoutes.CASH_IN_ADVANCED,
          component:
            key === AccountRoutes.CASH_IN_ADVANCED ? component : undefined,
        },
        assetManagement[1],
        {
          key: AccountRoutes.LOAN_DETAIL,
          title: 'Loan Detail',
          default: key === AccountRoutes.LOAN_DETAIL,
          component: key === AccountRoutes.LOAN_DETAIL ? component : undefined,
        },
      ];
};

export const orderBookTab = (
  key: AccountRoutes,
  component: React.ReactNode
): ITabTableData[] => [
  {
    key: AccountRoutes.ACTIVE_ORDER,
    title: 'Active Order',
    default: key === AccountRoutes.ACTIVE_ORDER,
    component: key === AccountRoutes.ACTIVE_ORDER ? component : undefined,
  },
  {
    key: AccountRoutes.ORDER_BOOK,
    title: 'Order Book',
    default: key === AccountRoutes.ORDER_BOOK,
    component: key === AccountRoutes.ORDER_BOOK ? component : undefined,
  },
  {
    key: AccountRoutes.ORDER_HISTORY,
    title: 'Order History',
    default: key === AccountRoutes.ORDER_HISTORY,
    component: key === AccountRoutes.ORDER_HISTORY ? component : undefined,
  },
  {
    key: AccountRoutes.STOP_ORDER_HISTORY,
    title: 'Stop Order History',
    default: key === AccountRoutes.STOP_ORDER_HISTORY,
    component: key === AccountRoutes.STOP_ORDER_HISTORY ? component : undefined,
  },
  {
    key: AccountRoutes.ORDER_CONFIRMATION,
    title: 'Order Confirmation',
    default: key === AccountRoutes.ORDER_CONFIRMATION,
    component: key === AccountRoutes.ORDER_CONFIRMATION ? component : undefined,
  },
];
export interface ILoanDetailTabParams {
  readonly key: LoanDetailTab;
  readonly component: React.ReactNode;
  readonly hide?: boolean;
}

export const loanDetailTab = (
  params: ILoanDetailTabParams[]
): ITabTableData[] => {
  return params.map((tab) => ({
    key: tab.key,
    component: tab.component,
    title: tab.key,
    default: tab.key === LoanDetailTab.LOAN_STATEMENT,
    hide: tab.hide,
  }));
};
// [
//   {
//     key: LoanDetailTab.LOAN_CONTRACT,
//     title: 'Loan Contact',
//     default: key === LoanDetailTab.LOAN_CONTRACT,
//     component: key === LoanDetailTab.LOAN_CONTRACT ? component : undefined,
//   },
//   {
//     key: LoanDetailTab.LOAN_STATEMENT,
//     title: 'Loan Statement',
//     default: key === LoanDetailTab.LOAN_STATEMENT,
//     component: key === LoanDetailTab.LOAN_STATEMENT ? component : undefined,
//   },
//   {
//     key: LoanDetailTab.INTEREST_EXPENSE_STATEMENT,
//     title: 'Interest Expense Statement',
//     default: key === LoanDetailTab.INTEREST_EXPENSE_STATEMENT,
//     component: key === LoanDetailTab.INTEREST_EXPENSE_STATEMENT ? component : undefined,
//   },
// ];
