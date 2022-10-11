import * as globalStyles from 'styles/style.scss';
import { CellClassParams, ValueFormatterParams } from 'ag-grid-community';
import { IColDef, IColGroupDef } from 'interfaces/common';
import { ILoanStatementResponse } from 'interfaces/api';
import { formatDateToDisplay } from 'utils/datetime';
import { formatNumber } from 'utils/common';
import i18next from 'i18next';

export const getColumnDefs = (): Array<
  IColGroupDef<ILoanStatementResponse> | IColDef<ILoanStatementResponse>
> => [
  {
    headerName: i18next.t('No.'),
    headerClass: globalStyles.Header,
    cellClass: `${globalStyles.Cell}`,
    cellClassRules: {
      ['text-center']: (params: CellClassParams) => {
        return params.data.no !== 'TOTAL';
      },
    },
    maxWidth: 90,
    valueFormatter: (params: ValueFormatterParams) =>
      params.data.no === undefined
        ? String(params?.node?.rowIndex ? params?.node?.rowIndex + 1 : 1)
        : params.data.no,
  },
  {
    headerName: i18next.t('Date'),
    field: 'date',
    headerClass: globalStyles.Header,
    cellClass: `${globalStyles.Cell} text-center`,
    valueFormatter: (params: ValueFormatterParams) =>
      formatDateToDisplay((params.data as ILoanStatementResponse)?.date) || '',
  },
  {
    headerName: i18next.t('Beginning Outstanding Loan'),
    field: 'beginningOutstandingLoan',
    headerClass: globalStyles.Header,
    cellClass: globalStyles.Cell,
    hide: true,
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(
        (params.data as ILoanStatementResponse)?.beginningOutstandingLoan,
        0,
        undefined,
        false,
        '—'
      ),
  },
  {
    headerName: i18next.t('New Debt (Increase)'),
    field: 'newDebtIncrease',
    headerClass: globalStyles.Header,
    cellClass: globalStyles.Cell,
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(
        (params.data as ILoanStatementResponse)?.newDebtIncrease,
        0,
        undefined,
        false,
        '—'
      ),
  },
  {
    headerName: i18next.t('Paid Amount (Decrease)'),
    field: 'paidAmountDecrease',
    headerClass: globalStyles.Header,
    cellClass: globalStyles.Cell,
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(
        (params.data as ILoanStatementResponse)?.paidAmountDecrease,
        0,
        undefined,
        false,
        '—'
      ),
  },
  {
    headerName: i18next.t('Total Debt'),
    field: 'totalDebt',
    headerClass: globalStyles.Header,
    cellClass: globalStyles.Cell,
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(
        (params.data as ILoanStatementResponse)?.totalDebt,
        0,
        undefined,
        false,
        '—'
      ),
  },
  {
    headerName: i18next.t('Margin Call'),
    field: 'marginCall',
    headerClass: globalStyles.Header,
    cellClass: globalStyles.Cell,
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(
        (params.data as ILoanStatementResponse)?.marginCall,
        0,
        undefined,
        false,
        '—'
      ),
  },
  {
    headerName: i18next.t('Force Sell'),
    field: 'forceSell',
    headerClass: globalStyles.Header,
    cellClass: globalStyles.Cell,
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(
        (params.data as ILoanStatementResponse)?.forceSell,
        0,
        undefined,
        false,
        '—'
      ),
  },
];
