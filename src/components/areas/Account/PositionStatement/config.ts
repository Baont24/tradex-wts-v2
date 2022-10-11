import * as globalStyles from 'styles/style.scss';
import { ColDef, ValueFormatterParams } from 'ag-grid-community';
import { IColDef, IColGroupDef } from 'interfaces/common';
import { IPositionStatementResponse } from 'interfaces/api';
import { formatDateToDisplay } from 'utils/datetime';
import { formatNumber } from 'utils/common';
import i18next from 'i18next';

export const DEFAULT_COL_DEF: ColDef = {
  minWidth: 80,
  headerClass: globalStyles.Header,
  cellClass: globalStyles.Cell,
  suppressMovable: true,
};

export const getColumnDefs = (): Array<
  IColDef<IPositionStatementResponse> | IColGroupDef<IPositionStatementResponse>
> => [
  {
    headerName: i18next.t('Series ID'),
    field: 'seriesID',
    cellClass: [globalStyles.Cell, 'text-center'],
  },
  {
    headerName: i18next.t('Date'),
    field: 'date',
    cellClass: [globalStyles.Cell, 'text-center'],
    valueFormatter: (params: ValueFormatterParams) =>
      formatDateToDisplay(params.value) || '--',
  },
  {
    headerName: i18next.t('Long'),
    headerClass: `${globalStyles.GroupHeader} ${globalStyles.Header}`,
    children: [
      {
        headerName: i18next.t('Quantity'),
        hide: true,
        headerClass: `${globalStyles.GroupHeader} ${globalStyles.Header} `,
        field: 'longQtty',
        valueFormatter: (params: ValueFormatterParams) =>
          formatNumber(params.value, 2, undefined, undefined, '--'),
      },
      {
        headerName: i18next.t('Average Bid'),
        hide: true,
        headerClass: `${globalStyles.GroupHeader} ${globalStyles.Header} `,
        field: 'longAveragePrice',
        valueFormatter: (params: ValueFormatterParams) =>
          formatNumber(params.value, 2, undefined, undefined, '--'),
      },
    ],
  },
  {
    headerName: i18next.t('Short'),
    headerClass: `${globalStyles.GroupHeader} ${globalStyles.Header}`,
    children: [
      {
        headerName: i18next.t('Quantity'),
        hide: true,
        headerClass: `${globalStyles.GroupHeader} ${globalStyles.Header} `,
        field: 'shortQtty',
        valueFormatter: (params: ValueFormatterParams) =>
          formatNumber(params.value, 2, undefined, undefined, '--'),
      },
      {
        headerName: i18next.t('Average Ask'),
        hide: true,
        headerClass: `${globalStyles.GroupHeader} ${globalStyles.Header} `,
        field: 'shortAverageAsk',
        valueFormatter: (params: ValueFormatterParams) =>
          formatNumber(params.value, 2, undefined, undefined, '--'),
      },
    ],
  },
  {
    headerName: i18next.t('Netoff'),
    headerClass: `${globalStyles.GroupHeader} ${globalStyles.Header}`,
    children: [
      {
        headerName: i18next.t('Long'),
        headerClass: `${globalStyles.GroupHeader} ${globalStyles.Header} `,
        field: 'netoffLong',
        valueFormatter: (params: ValueFormatterParams) =>
          formatNumber(params.value, 2, undefined, undefined, '--'),
      },
      {
        headerName: i18next.t('Short'),
        headerClass: `${globalStyles.GroupHeader} ${globalStyles.Header} `,
        field: 'netoffShort',
        valueFormatter: (params: ValueFormatterParams) =>
          formatNumber(params.value, 2, undefined, undefined, '--'),
      },
    ],
  },
  {
    headerName: i18next.t('Expired 1'),
    headerClass: `${globalStyles.GroupHeader} ${globalStyles.Header}`,
    children: [
      {
        headerName: i18next.t('Long'),
        headerClass: `${globalStyles.GroupHeader} ${globalStyles.Header} `,
        field: 'expiredLong',
        valueFormatter: (params: ValueFormatterParams) =>
          formatNumber(params.value, 2, undefined, undefined, '--'),
      },
      {
        headerName: i18next.t('Short'),
        headerClass: `${globalStyles.GroupHeader} ${globalStyles.Header} `,
        field: 'expiredShort',
        valueFormatter: (params: ValueFormatterParams) =>
          formatNumber(params.value, 2, undefined, undefined, '--'),
      },
    ],
  },
  {
    headerName: i18next.t('Balance'),
    headerClass: `${globalStyles.GroupHeader} ${globalStyles.Header}`,
    children: [
      {
        headerName: i18next.t('Long'),
        headerClass: `${globalStyles.GroupHeader} ${globalStyles.Header} `,
        field: 'balanceLong',
        valueFormatter: (params: ValueFormatterParams) =>
          formatNumber(params.value, 2, undefined, undefined, '--'),
      },
      {
        headerName: i18next.t('Short'),
        headerClass: `${globalStyles.GroupHeader} ${globalStyles.Header} `,
        field: 'balanceShort',
        valueFormatter: (params: ValueFormatterParams) =>
          formatNumber(params.value, 2, undefined, undefined, '--'),
      },
      {
        headerName: i18next.t('Closing Price'),
        headerClass: `${globalStyles.GroupHeader} ${globalStyles.Header} `,
        field: 'balanceClosingPrice',
        valueFormatter: (params: ValueFormatterParams) =>
          formatNumber(params.value, 2, undefined, undefined, '--'),
      },
    ],
  },
  {
    headerName: i18next.t('Total P/L'),
    field: 'totalPL',
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(params.value, 2, undefined, undefined, '--'),
    cellClassRules: {
      [globalStyles.Up]: 'value > 0',
      [globalStyles.Down]: 'value < 0',
    },
  },
];
