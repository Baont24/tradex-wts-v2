import * as styles from './styles.scss';
import { ColDef, ColGroupDef } from 'ag-grid-community';
import {
  customQuantityFormatter,
  priceFormatterIgnoreZero,
  valueClassRules,
} from 'utils/board';
import i18next from 'i18next';

const minWidth = 60;
let maxWidth = 62;
export const getColumnDefs = (
  isInfoSideMenu?: boolean
): Array<ColGroupDef | ColDef> => {
  if (isInfoSideMenu) {
    maxWidth = 100;
  }
  return [
    {
      headerName: i18next.t('Bid'),
      headerClass: `${styles.Cell} ${styles.Header}`,
      children: [
        {
          field: 'v1',
          valueGetter: '',
          headerName: i18next.t('Qty'),
          minWidth,
          maxWidth,
          headerClass: `${styles.Cell} ${styles.Header}`,
          cellClass: styles.Cell,
          valueFormatter: customQuantityFormatter(1),
        },
        {
          field: 'p1',
          headerName: i18next.t('Price'),
          minWidth,
          maxWidth,
          headerClass: `${styles.Cell} ${styles.Header}`,
          cellClass: styles.Cell,
          cellClassRules: valueClassRules,
          valueFormatter: priceFormatterIgnoreZero,
        },
      ],
    },
    {
      headerName: i18next.t('Ask'),
      headerClass: `${styles.Cell} ${styles.Header}`,
      children: [
        {
          field: 'p2',
          headerName: i18next.t('Price'),
          minWidth,
          maxWidth,
          headerClass: `${styles.Cell} ${styles.Header}`,
          cellClass: styles.Cell,
          cellClassRules: valueClassRules,
          valueFormatter: priceFormatterIgnoreZero,
        },
        {
          field: 'v2',
          headerName: i18next.t('Qty'),
          minWidth,
          maxWidth,
          headerClass: `${styles.Cell} ${styles.Header}`,
          cellClass: styles.Cell,
          valueFormatter: customQuantityFormatter(1),
        },
      ],
    },
  ];
};
