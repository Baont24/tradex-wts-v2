import * as globalStyles from 'styles/style.scss';
import { ColDef, ValueFormatterParams } from 'ag-grid-community';
// import { formatDateToDisplay } from 'utils/datetime';
import { IColDef, IColGroupDef } from 'interfaces/common';
import { ILoanExpenseStatementResponse } from 'interfaces/api';
import { formatNumber } from 'utils/common';
import i18next from 'i18next';

export const DEFAULT_COL_DEF: ColDef = {
  minWidth: 80,
  headerClass: globalStyles.Header,
  cellClass: globalStyles.Cell,
  suppressMovable: true,
};

export const getColumnDefs = (): Array<
  | IColGroupDef<ILoanExpenseStatementResponse & { readonly no?: number }>
  | IColDef<ILoanExpenseStatementResponse & { readonly no?: number }>
> => [
  {
    colId: 'no',
    field: 'no',
    headerName: i18next.t('No.'),
    minWidth: 50,
    maxWidth: 50,
    suppressSizeToFit: true,
    valueFormatter: (params: ValueFormatterParams) =>
      params.value
        ? i18next.t(params.value)
        : String(params?.node?.rowIndex ? params?.node?.rowIndex + 1 : 1),
    cellClass: [globalStyles.Cell, 'text-center'],
  },
  {
    headerName: i18next.t('Date'),
    field: 'tranDate',
    cellClass: [globalStyles.Cell, 'text-center'],
    // valueFormatter: (params: ValueFormatterParams) => formatDateToDisplay(params.value) || '',
  },
  {
    headerName: i18next.t('Outstanding Loan'),
    field: 'loanD',
    valueFormatter: (params: ValueFormatterParams) =>
      params.data.no !== 'TOTAL'
        ? formatNumber(+params.value, 2, undefined, undefined, '—')
        : '',
  },
  {
    headerName: i18next.t('Interest Rate'),
    field: 'interestRate',
    hide: true,
    valueFormatter: (params: ValueFormatterParams) =>
      params.data.no !== 'TOTAL'
        ? formatNumber(+params.value, 2, undefined, undefined, '—')
        : '',
  },
  {
    headerName: i18next.t('Debit Interest'),
    field: 'debitInterest',
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(+params.value, 2, undefined, undefined, '-'),
  },
];
