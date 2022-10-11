import * as globalStyles from 'styles/style.scss';
import {
  CellClassParams,
  ColDef,
  ColSpanParams,
  ValueFormatterParams,
} from 'ag-grid-community';
import { IColDef, IColGroupDef } from 'interfaces/common';
import {
  // IDerivativesCashStatementList,
  IDrCashStatementItemResponse,
  IEquityCashStatementList,
} from 'interfaces/api';
import { domainConfig } from 'config/domain';
import { formatDateToDisplay } from 'utils/datetime';
import { formatNumber } from 'utils/common';
import config from 'config';
import i18next from 'i18next';

const maxWidth = 80;
export const DEFAULT_COL_DEF: ColDef = {
  minWidth: 80,
  headerClass: globalStyles.Header,
  cellClass: globalStyles.Cell,
  suppressMovable: true,
};

const tooltipRenderer = (params: { readonly value: string }) => {
  return '<span title="' + params.value + '">' + params.value + '</span>';
};

export const getColumnDefs = (): Array<
  IColGroupDef<IEquityCashStatementList> | IColDef<IEquityCashStatementList>
> => [
  {
    headerName: i18next.t('No'),
    field: 'no',
    maxWidth,
    cellClassRules: {
      ['text-center']: (params: CellClassParams) => !isNaN(+params.value),
    },
    colSpan: (params: ColSpanParams) =>
      params.data?.no === i18next.t('Ending Balance 1') ||
      params.data?.no === i18next.t('Beginning Balance 1')
        ? 4
        : 1,
  },
  {
    headerName: i18next.t('Date'),
    cellClass: [globalStyles.Cell, 'text-center'],
    field: 'date',
    sort: 'desc',
    sortable: true,
    valueFormatter: (params: ValueFormatterParams) =>
      formatDateToDisplay(params.value) || '',
  },
  {
    headerName: i18next.t('Transaction Type 1'),
    cellClass: [globalStyles.Cell, 'text-center'],
    field: 'transactionType',
    hide: true,
    valueFormatter: (params: ValueFormatterParams) => params.value ?? '—',
  },
  {
    headerName: i18next.t('Description'),
    field: 'description',
    cellClass: [globalStyles.Cell, 'text-left'],
    cellRenderer: tooltipRenderer,
  },
  {
    headerName: i18next.t('Credit Amount'),
    field: 'creditAmount',
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(params.value, 2, undefined, undefined, ''),
  },
  {
    headerName: i18next.t('Debit Amount'),
    field: 'debitAmount',
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(params.value, 2, undefined, undefined, ''),
  },
  {
    headerName: i18next.t('Balance'),
    field: 'balance',
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(params.value, 2, undefined, undefined, ''),
  },
];

export const getDirColumnDefs = (): Array<
  | IColGroupDef<IDrCashStatementItemResponse & { readonly no?: number }>
  | IColDef<IDrCashStatementItemResponse & { readonly no?: number }>
> => [
  {
    headerName: i18next.t('No'),
    field: 'no',
    maxWidth,
    cellClassRules: {
      ['text-center']: (params: CellClassParams) => !isNaN(+params.value),
    },
    colSpan: (params: ColSpanParams) =>
      params.data?.no === i18next.t('Ending Balance 1') ||
      params.data?.no === i18next.t('Beginning Balance 1')
        ? 4
        : 1,
  },
  {
    headerName: i18next.t('Date'),
    cellClass: [globalStyles.Cell, 'text-center'],
    field: 'valueDate',
    valueFormatter: (params: ValueFormatterParams) =>
      formatDateToDisplay(params.value) || '',
  },
  {
    headerName: i18next.t('Transaction Type 1'),
    cellClass: [globalStyles.Cell, 'text-center'],
    field: 'txnType',
    hide: true,
  },
  {
    headerName: i18next.t('Description'),
    field: 'remarks',
    cellRenderer: tooltipRenderer,
  },
  {
    headerName: i18next.t(
      `${domainConfig[config.domain]?.cashStamentHeaderName}`
    ),
    headerClass: `${globalStyles.GroupHeader} ${globalStyles.Header}`,
    children: [
      {
        headerName: i18next.t('Debit'),
        headerClass: `${globalStyles.GroupHeader} ${globalStyles.Header}`,
        field: 'clientCredit',
        valueFormatter: (params: ValueFormatterParams) =>
          formatNumber(params.value, 2, undefined, undefined, ''),
      },
      {
        headerName: i18next.t('Credit'),
        headerClass: `${globalStyles.GroupHeader} ${globalStyles.Header}`,
        field: 'clientDebit',
        valueFormatter: (params: ValueFormatterParams) =>
          formatNumber(params.value, 2, undefined, undefined, ''),
      },
      {
        headerName: i18next.t('Balance'),
        hide: true,
        headerClass: `${globalStyles.GroupHeader} ${globalStyles.Header}`,
        field: 'counterPartyAC',
        valueFormatter: (params: ValueFormatterParams) =>
          formatNumber(params.value, 2, undefined, undefined, ''),
      },
    ],
  },
  {
    headerName: i18next.t('Cash at VSD'),
    headerClass: `${globalStyles.GroupHeader} ${globalStyles.Header}`,
    children: [
      {
        headerName: i18next.t('Debit'),
        headerClass: `${globalStyles.GroupHeader} ${globalStyles.Header}`,
        field: 'brokerCredit',
        valueFormatter: (params: ValueFormatterParams) =>
          formatNumber(params.value, 2, undefined, undefined, ''),
      },
      {
        headerName: i18next.t('Credit'),
        headerClass: `${globalStyles.GroupHeader} ${globalStyles.Header}`,
        field: 'brokerDebit',
        valueFormatter: (params: ValueFormatterParams) =>
          formatNumber(params.value, 2, undefined, undefined, ''),
      },
      {
        headerName: i18next.t('Balance'),
        headerClass: `${globalStyles.GroupHeader} ${globalStyles.Header}`,
        field: 'counterPartyAC',
        hide: true,
        valueFormatter: (params: ValueFormatterParams) =>
          formatNumber(params.value, 2, undefined, undefined, ''),
      },
    ],
  },
  {
    headerName: i18next.t('Total Balance'),
    field: 'totalBalance',
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(params.value, 2, undefined, undefined, ''),
  },
];
