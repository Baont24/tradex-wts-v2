import * as globalStyles from 'styles/style.scss';
import { ColDef, ValueFormatterParams } from 'ag-grid-community';
import { IColDef, IColGroupDef } from 'interfaces/common';
import { IOrderConfirmationResponse } from 'interfaces/api';
import { SellBuyType } from 'constants/enum';
import { TIME_FORMAT_DISPLAY, TIME_FORMAT_INPUT } from 'constants/main';
import { formatDateToDisplay, formatTimeToDisplay } from 'utils/datetime';
import { formatNumber } from 'utils/common';
import i18next from 'i18next';
import styles from './styles.scss';

export const DEFAULT_COL_DEF: ColDef = {
  minWidth: 70,
  headerClass: globalStyles.Header,
  cellClass: globalStyles.Cell,
  suppressMovable: true,
};

export const valueClassRules = {
  Up: "value === 'BUY'",
  Down: "value === 'SELL'",
};

export const getColumnDefs = (
  isAccountTypeDerivatives?: boolean
): Array<
  IColGroupDef<IOrderConfirmationResponse> | IColDef<IOrderConfirmationResponse>
> => [
  {
    colId: 'checkbox',
    headerCheckboxSelection: true,
    headerCheckboxSelectionFilteredOnly: true,
    checkboxSelection: true,
    headerName: '',
    minWidth: 30,
    maxWidth: 30,
    suppressSizeToFit: true,
    cellClass: [globalStyles.Cell, styles.AlignCheckBox],
  },
  {
    headerName: i18next.t('Date'),
    field: 'date',
    cellClass: [globalStyles.Cell, 'text-center'],
    valueFormatter: (params: ValueFormatterParams) =>
      formatDateToDisplay(params.value) || '',
    sort: 'desc',
  },
  {
    headerName: i18next.t('Time'),
    cellClass: [globalStyles.Cell, 'text-center'],
    field: 'time',
    valueFormatter: (params: ValueFormatterParams) =>
      formatTimeToDisplay(
        params.value,
        TIME_FORMAT_DISPLAY,
        TIME_FORMAT_INPUT,
        true
      ) || '',
  },
  {
    headerName: i18next.t('Account No'),
    cellClass: [globalStyles.Cell, 'text-center'],
    field: 'accountNo',
  },
  {
    headerName: i18next.t('Order Type'),
    cellClass: [globalStyles.Cell, 'text-center'],
    field: 'orderType',
    valueFormatter: (params: ValueFormatterParams) =>
      params.value === SellBuyType.BUY || params.value === SellBuyType.SELL
        ? i18next.t(`${params.value} 2`)
        : params.value,
    cellClassRules: valueClassRules,
  },
  {
    headerName: i18next.t('Stock Symbol'),
    cellClass: [globalStyles.Cell, 'text-center'],
    field: 'stockSymbol',
  },
  {
    headerName: i18next.t('Volume'),
    field: 'volume',
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(params.value, 2),
  },
  {
    headerName: i18next.t('Price'),
    field: 'price',
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(params.value, 2),
  },
  {
    headerName: i18next.t('Status'),
    cellClass: [globalStyles.Cell, 'text-center'],
    field: 'status',
    valueFormatter: (params: ValueFormatterParams) => i18next.t(params.value),
  },
  {
    headerName: i18next.t('Channel'),
    field: 'channel',
    valueFormatter: (params: ValueFormatterParams) => params.value ?? '—',
    hide: true,
  },
  {
    headerName: i18next.t('Order No.'),
    cellClass: [globalStyles.Cell, 'text-center'],
    field: 'orderNo',
  },
];
