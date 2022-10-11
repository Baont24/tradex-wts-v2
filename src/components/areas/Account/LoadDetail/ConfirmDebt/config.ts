import * as globalStyles from 'styles/style.scss';
import { CellClassParams, ValueFormatterParams } from 'ag-grid-community';
import { IColDef, IColGroupDef } from 'interfaces/common';
import {
  IDebtMarginResponse,
  IEquityConfirmDebtResponse,
} from 'interfaces/api';
import { formatNumber } from 'utils/common';
import { formatTimeToDisplay } from 'utils/datetime';
import i18next from 'i18next';

export const debtMarginInfor = (): Array<
  IColGroupDef<IDebtMarginResponse> | IColDef<IDebtMarginResponse>
> => [
  {
    headerName: i18next.t('No.'),
    headerClass: globalStyles.Header,
    cellClass: `${globalStyles.Cell} text-center`,
    maxWidth: 50,
    valueFormatter: (params: ValueFormatterParams) =>
      String(params?.node?.rowIndex ? params?.node?.rowIndex + 1 : 1),
  },
  {
    headerName: i18next.t('Content'),
    field: 'content',
    headerClass: globalStyles.Header,
    cellClass: `${globalStyles.Cell} text-left`,
    valueFormatter: (params: ValueFormatterParams) => i18next.t(params.value),
  },
  {
    headerName: i18next.t('Amount 4'),
    field: 'transactionAmount',
    maxWidth: 200,
    headerClass: globalStyles.Header,
    cellClass: globalStyles.Cell,
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(
        (params.data as IDebtMarginResponse)?.transactionAmount,
        0,
        undefined,
        false,
        '—'
      ),
  },
];

export const debtConfirmationHistory = (): Array<
  IColGroupDef<IEquityConfirmDebtResponse> | IColDef<IEquityConfirmDebtResponse>
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
    maxWidth: 50,
    valueFormatter: (params: ValueFormatterParams) =>
      params.data.no === undefined
        ? String(params?.node?.rowIndex ? params?.node?.rowIndex + 1 : 1)
        : params.data.no,
  },
  {
    headerName: i18next.t('Original Outstanding'),
    field: 'originalOutstanding',
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(
        (params.data as IEquityConfirmDebtResponse)?.originalOutstanding,
        2,
        undefined,
        false,
        '—'
      ),
    headerClass: globalStyles.Header,
    cellClass: globalStyles.Cell,
  },
  {
    headerName: i18next.t('Outstanding Interest 2'),
    field: 'outstandingInterest',
    headerClass: globalStyles.Header,
    cellClass: globalStyles.Cell,
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(
        (params.data as IEquityConfirmDebtResponse)?.outstandingInterest,
        2,
        undefined,
        false,
        '—'
      ),
  },
  {
    headerName: i18next.t('Status'),
    field: 'status',
    headerClass: globalStyles.Header,
    cellClass: `${globalStyles.Cell} text-center`,
    maxWidth: 170,
    valueFormatter: (params: ValueFormatterParams) =>
      params.value ? 'Y' : 'N',
  },
  {
    headerName: i18next.t('Date Confirm'),
    field: 'dateConfirm',
    valueFormatter: (params: ValueFormatterParams) =>
      formatTimeToDisplay(params.value, 'dd/MM/yyyy', 'yyyyMMddHHmmss', true) ||
      '',
    headerClass: globalStyles.Header,
    cellClass: `${globalStyles.Cell} text-center`,
    maxWidth: 300,
  },
];
