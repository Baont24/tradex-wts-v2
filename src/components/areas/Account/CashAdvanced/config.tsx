import * as globalStyles from 'styles/style.scss';
import { ColDef, ValueFormatterParams } from 'ag-grid-community';
import {
  DATE_FORMAT_DISPLAY,
  DATE_TIME_FORMAT_INPUT,
  TIME_FORMAT_DISPLAY,
} from 'constants/main';
import { IColDef, IColGroupDef } from 'interfaces/common';
import {
  IEquityCashAdvancedHistoryResponse,
  IEquityCashAdvancedResponse,
} from 'interfaces/api';
import { IconRejectStatusTooltip } from 'components/common';
import { formatDateToDisplay } from 'utils/datetime';
import { formatNumber, multiplyBy1000 } from 'utils/common';
import i18next from 'i18next';

export const DEFAULT_COL_DEF: ColDef = {
  minWidth: 80,
  headerClass: globalStyles.Header,
  cellClass: globalStyles.Cell,
  suppressMovable: true,
};

export const cashAdvancedColumnDefs = (
  isIICA?: boolean
): Array<
  | IColGroupDef<IEquityCashAdvancedResponse>
  | IColDef<IEquityCashAdvancedResponse>
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
    hide: !isIICA,
  },
  {
    headerName: i18next.t('ID'),
    field: 'id',
    cellClass: [globalStyles.Cell, 'text-center'],
  },
  {
    headerName: i18next.t('Sold Date'),
    field: 'soldDate',
    cellClass: [globalStyles.Cell, 'text-center'],
  },
  {
    headerName: i18next.t('Payment Date'),
    field: 'paymentDate',
    cellClass: [globalStyles.Cell, 'text-center'],
  },
  {
    headerName: i18next.t('Stock'),
    field: 'stock',
    cellClass: [globalStyles.Cell, 'text-center'],
  },
  {
    headerName: i18next.t('Volume'),
    field: 'volume',
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(params.value, 2),
  },
  {
    headerName: i18next.t('Value'),
    field: 'value',
    valueFormatter: (params: ValueFormatterParams) =>
      isIICA
        ? formatNumber(multiplyBy1000(params.value), 2)
        : formatNumber(params.value, 2),
  },
  {
    headerName: i18next.t('Fee+Tax'),
    field: 'feeTax',
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(params.value, 2, undefined, undefined, '--'),
  },
  {
    headerName: i18next.t('Net Sold Amount'),
    field: 'netSoldAmount',
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(params.value, 2),
  },
];

export const cashAdvancedHistoryColumnDefs = (
  isIICA?: boolean
): Array<
  | IColGroupDef<IEquityCashAdvancedHistoryResponse>
  | IColDef<IEquityCashAdvancedHistoryResponse>
> => [
  {
    headerName: i18next.t('No'),
    minWidth: 40,
    maxWidth: 40,
    cellClass: [globalStyles.Cell, 'text-center'],
    valueFormatter: (params: ValueFormatterParams) =>
      String(params?.node?.rowIndex ? params?.node?.rowIndex + 1 : 1),
  },
  {
    headerName: i18next.t('Request Time'),
    field: 'requestTime',
    cellClass: [globalStyles.Cell, 'text-center'],
    valueFormatter: (params: ValueFormatterParams) => {
      return (
        formatDateToDisplay(
          params.value,
          `${TIME_FORMAT_DISPLAY}  ${DATE_FORMAT_DISPLAY}`,
          DATE_TIME_FORMAT_INPUT,
          true
        ) || params.value
      );
    },
  },
  {
    headerName: i18next.t('Require advanced amount'),
    field: 'requireAdvanceAmount',
    cellClass: [globalStyles.Cell, 'text-center'],
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(params.value),
  },
  {
    headerName: i18next.t('Advance Fee'),
    field: 'advanceFee',
    cellClass: [globalStyles.Cell, 'text-center'],
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(params.value),
  },
  {
    headerName: i18next.t('Tax'),
    cellClass: [globalStyles.Cell, 'text-center'],
    field: 'tax',
  },
  {
    headerName: i18next.t('Sold amount in advance'),
    field: 'soldAmountInAdvance',
    cellClass: [globalStyles.Cell, 'text-center'],
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(params.value),
  },
  {
    headerName: i18next.t('Transaction detail'),
    cellClass: [globalStyles.Cell, 'text-center'],
    field: 'status',
  },
  {
    headerName: i18next.t('Status'),
    cellClass: [globalStyles.Cell, 'text-center'],
    field: 'status',
    cellEditorFramework: IconRejectStatusTooltip,
    hide: true,
  },
  {
    headerName: i18next.t('Channel'),
    cellClass: [globalStyles.Cell, 'text-center'],
    field: 'channel',
    hide: true,
  },
];
