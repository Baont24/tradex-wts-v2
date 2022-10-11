import * as globalStyles from 'styles/style.scss';
import { ColDef, ValueFormatterParams } from 'ag-grid-community';
import {
  DATE_FORMAT_DISPLAY,
  DATE_FORMAT_INPUT,
  TIME_FORMAT_DISPLAY,
} from 'constants/main';
import { IColDef, IColGroupDef } from 'interfaces/common';
import { ISecuritiesStatementList } from 'interfaces/api';
import { formatDateToDisplay } from 'utils/datetime';
import { formatNumber } from 'utils/common';
import i18next from 'i18next';
import styles from './styles.scss';

const tooltipRenderer = (params: { readonly value: string }) => {
  return '<span title="' + params.value + '">' + params.value + '</span>';
};

const MIN_WIDTH = 114;

export const DEFAULT_COL_DEF: ColDef = {
  minWidth: 60,
  headerClass: globalStyles.Header,
  cellClass: globalStyles.Cell,
  suppressMovable: true,
};

export const getColumnDefs = (): Array<
  IColGroupDef<ISecuritiesStatementList> | IColDef<ISecuritiesStatementList>
> => [
  {
    headerName: i18next.t('Order No.'),
    field: 'orderNo',
    cellClass: `${globalStyles.Cell} ${styles.alignLeft}`,
    valueFormatter: (params: ValueFormatterParams) => params.value ?? '—',
    hide: true,
  },
  {
    headerName: i18next.t('Transaction Date'),
    field: 'transactionDate',
    cellClass: `${globalStyles.Cell} ${styles.alignCenter}`,
    valueFormatter: (params: ValueFormatterParams) => {
      const date = formatDateToDisplay(
        (params.data as ISecuritiesStatementList)?.transactionDate,
        DATE_FORMAT_DISPLAY,
        DATE_FORMAT_INPUT + ' ' + TIME_FORMAT_DISPLAY
      );
      if (date !== null) {
        return date;
      } else {
        return '';
      }
    },
  },
  {
    headerName: i18next.t('Stock'),
    field: 'stock',
    cellClass: `${globalStyles.Cell} ${styles.alignCenter}`,
  },
  {
    headerName: i18next.t('Action'),
    field: 'action',
    cellClass: `${globalStyles.Cell} ${styles.alignCenter}`,
    cellClassRules: {
      [globalStyles.Up]: "value === 'Buy'",
      [globalStyles.Down]: "value === 'Sell'",
    },
    valueFormatter: (params: ValueFormatterParams) => i18next.t(params.value),
  },
  {
    headerName: i18next.t('Stock In'),
    headerClass: `${globalStyles.GroupHeader} ${globalStyles.Header}`,
    children: [
      {
        field: 'creditQty',
        colId: 'creditQty',
        minWidth: MIN_WIDTH,
        headerName: i18next.t('Quantity'),
        headerClass: `${globalStyles.GroupHeader} ${globalStyles.Header}`,
        valueFormatter: (params: ValueFormatterParams) =>
          formatNumber((params.data as ISecuritiesStatementList)?.creditQty),
      },
      {
        field: 'creditAvgPrice',
        colId: 'creditAvgPrice',
        minWidth: MIN_WIDTH,
        headerName: i18next.t('Average Price'),
        headerClass: `${globalStyles.GroupHeader} ${globalStyles.Header}`,
        valueFormatter: (params: ValueFormatterParams) =>
          formatNumber(
            (params.data as ISecuritiesStatementList)?.creditAvgPrice,
            1
          ),
      },
      {
        field: 'creditAmount',
        colId: 'creditAmount',
        minWidth: MIN_WIDTH,
        headerName: i18next.t('Trans Amt.'),
        headerClass: `${globalStyles.GroupHeader} ${globalStyles.Header}`,
        valueFormatter: (params: ValueFormatterParams) =>
          formatNumber((params.data as ISecuritiesStatementList)?.creditAmount),
      },
    ],
  },
  {
    headerName: i18next.t('Stock Out'),
    headerClass: `${globalStyles.GroupHeader} ${globalStyles.Header}`,
    children: [
      {
        field: 'debitQty',
        colId: 'debitQty',
        minWidth: MIN_WIDTH,
        headerName: i18next.t('Quantity'),
        headerClass: `${globalStyles.GroupHeader} ${globalStyles.Header}`,
        valueFormatter: (params: ValueFormatterParams) =>
          formatNumber(
            Math.abs(
              (params.data as ISecuritiesStatementList)?.debitQty as number
            )
          ),
      },
      {
        field: 'debitAvgPrice',
        colId: 'debitAvgPrice',
        minWidth: MIN_WIDTH,
        headerName: i18next.t('Average Price'),
        headerClass: `${globalStyles.GroupHeader} ${globalStyles.Header}`,
        valueFormatter: (params: ValueFormatterParams) =>
          formatNumber(
            (params.data as ISecuritiesStatementList)?.debitAvgPrice
          ),
      },
      {
        field: 'debitAmount',
        colId: 'debitAmount',
        minWidth: MIN_WIDTH,
        headerName: i18next.t('Trans Amt.'),
        headerClass: `${globalStyles.GroupHeader} ${globalStyles.Header}`,
        valueFormatter: (params: ValueFormatterParams) =>
          formatNumber((params.data as ISecuritiesStatementList)?.debitAmount),
      },
    ],
  },
  {
    headerName: i18next.t('Fee'),
    field: 'fee',
    hide: true,
    valueFormatter: (params: ValueFormatterParams) => params.value ?? '—',
  },
  {
    headerName: i18next.t('Tax'),
    field: 'tax',
    hide: true,
    valueFormatter: (params: ValueFormatterParams) => params.value ?? '—',
  },
  {
    headerName: i18next.t('Tax + Fee'),
    field: 'feeTax',
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(params.value),
  },
  {
    headerName: i18next.t('Description'),
    field: 'description',
    cellRenderer: tooltipRenderer,
  },
];
