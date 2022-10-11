import * as styles from './styles.scss';
import { ColDef, ColGroupDef, ValueFormatterParams } from 'ag-grid-community';
import {
  closePriceClassRules,
  customQuantityFormatter,
  priceFormatter,
  rateFormatter,
  valueClassRules,
} from 'utils/board';
import { formatTimeToDisplay } from 'utils/datetime';
import ToggleGroupHeader from '../GridCustomCell/ToggleGroupHeader';
import i18next from 'i18next';

export const formatTime = (param: ValueFormatterParams) => {
  const time = formatTimeToDisplay(param.value, undefined, 'HHmmss');
  if (time) {
    return time;
  }
  return param.value;
};

export const formatType = (param: ValueFormatterParams) => {
  let type: string;
  param.value === 'ASK' ? (type = 'S(sell)') : (type = 'B(buy)');
  if (!param.value) {
    return i18next.t('B/S');
  }
  return i18next.t(type);
};

export const typeClassRules = {
  Up: "value === 'BID'",
  Down: "value === 'ASK'",
  Floor: '!value',
};

export const getColumnDefs = (
  isHideType?: boolean
): Array<ColGroupDef | ColDef> => [
  {
    headerName: i18next.t('Time'),
    field: 'ti',
    headerClass: styles.Header,
    cellClass: styles.Cell,
    valueFormatter: formatTime,
    minWidth: 65,
    maxWidth: 65,
  },
  {
    headerName: i18next.t('Type'),
    field: 'mb',
    headerClass: styles.Header,
    cellClass: styles.Cell,
    valueFormatter: formatType,
    cellClassRules: typeClassRules,
    hide: isHideType,
    maxWidth: isHideType ? 75 : 61,
    minWidth: 36,
  },
  {
    headerName: i18next.t('Price'),
    field: 'c',
    headerClass: styles.Header,
    cellClass: styles.Cell,
    valueFormatter: priceFormatter,
    cellClassRules: valueClassRules,
  },
  {
    headerName: i18next.t('Trading'),
    headerGroupComponentFramework: ToggleGroupHeader,
    headerGroupComponentParams: {
      staticHeader: false,
    },
    headerClass: styles.ShowOnlyToggleGroupHeader,
    sortable: true,
    children: [
      {
        headerName: i18next.t('+/-'),
        field: 'ch',
        headerClass: styles.NoGroupHeader,
        cellClass: styles.Cell,
        columnGroupShow: 'closed',
        valueFormatter: priceFormatter,
        cellClassRules: closePriceClassRules,
        maxWidth: 61,
        minWidth: 61,
      },
      {
        headerName: i18next.t('%'),
        field: 'ra',
        minWidth: 61,
        maxWidth: 61,
        headerClass: styles.NoGroupHeader,
        cellClass: styles.Cell,
        columnGroupShow: 'open',
        valueFormatter: rateFormatter,
        cellClassRules: closePriceClassRules,
      },
    ],
  },
  {
    headerName: i18next.t('Vol'),
    field: 'mv',
    valueGetter: "data.t === 'INDEX' ? data.vo : data.mv",
    headerClass: styles.Header,
    cellClass: styles.Cell,
    valueFormatter: customQuantityFormatter(1),
  },
];
