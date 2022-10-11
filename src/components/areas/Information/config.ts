import { ITabTableData } from 'interfaces/common';
import { InfoRoutes } from 'constants/routes';

export const orderBookTab = (
  key: InfoRoutes,
  component: React.ReactNode
): ITabTableData[] => [
  {
    key: InfoRoutes.ACCOUNT,
    title: 'Account Information',
    default: key === InfoRoutes.ACCOUNT,
    component: key === InfoRoutes.ACCOUNT ? component : undefined,
  },
  {
    key: InfoRoutes.ACCOUNT,
    title: 'Account Information',
    default: key === InfoRoutes.ACCOUNT,
    component: key === InfoRoutes.ACCOUNT ? component : undefined,
  },
];
