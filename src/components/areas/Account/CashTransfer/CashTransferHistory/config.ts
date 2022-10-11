import * as globalStyles from 'styles/style.scss';
import { ICashTransferHistoryResponse } from 'interfaces/api';
import { IColDef, IColGroupDef } from 'interfaces/common';
import {
  ITooltipParams,
  ValueFormatterParams,
  ValueGetterParams,
} from 'ag-grid-community';
import { IconRejectStatusTooltip } from 'components/common';
import { TransferType } from 'constants/enum';
import { formatDateToDisplay } from 'utils/datetime';
import { formatNumber } from 'utils/common';
import i18next from 'i18next';

const formatTime = (data?: string) => {
  const time = formatDateToDisplay(data);
  if (!data) {
    return '';
  }
  if (time) {
    return time;
  }
  return data;
};

const tooltipRenderer = (params: ITooltipParams) => {
  return params.value;
};

export const getColumnDefs = (
  transferType?: string
): Array<
  | IColGroupDef<ICashTransferHistoryResponse>
  | IColDef<ICashTransferHistoryResponse>
> => [
  {
    headerName: i18next.t('No.'),
    colId: 'no',
    headerClass: globalStyles.Header,
    cellClass: globalStyles.Cell,
    maxWidth: 90,
    valueFormatter: (params: ValueFormatterParams) =>
      String(params?.node?.rowIndex ? params?.node?.rowIndex + 1 : 1),
  },
  {
    headerName: i18next.t('Date'),
    field: 'date',
    headerClass: globalStyles.Header,
    cellClass: `${globalStyles.Cell} text-center`,
    valueFormatter: (params: ValueFormatterParams) =>
      params.value != null ? formatTime(params.value) : '',
  },
  {
    headerName: i18next.t('Transfer Account'),
    field: 'transferAccount',
    hide:
      transferType === TransferType.TO_SUB ||
      transferType === TransferType.TO_BANK,
    headerClass: globalStyles.Header,
    cellClass: globalStyles.Cell,
    valueFormatter: (params: ValueFormatterParams) => params.value ?? '—',
  },
  {
    headerName: i18next.t('Transfer Type'),
    field: 'transferType',
    headerClass: globalStyles.Header,
    cellClass: `${globalStyles.Cell} text-center`,
    valueFormatter: (params: ValueFormatterParams) => i18next.t(params.value),
  },
  {
    headerName: i18next.t('Beneficiary'),
    field: 'beneficiary',
    headerClass: globalStyles.Header,
    cellClass: `${globalStyles.Cell} text-left `,
    hide: transferType === TransferType.TO_SUB,
    valueFormatter: (params: ValueFormatterParams) =>
      params.value === ''
        ? '—'
        : params.value === undefined
        ? '—'
        : params.value,
  },
  {
    headerName: i18next.t('Beneficiary Account No'),
    field: 'beneficiaryAccNo',
    hide:
      transferType === TransferType.TO_SUB ||
      transferType === TransferType.FROM_TO_VSD,
    headerClass: globalStyles.Header,
    cellClass: globalStyles.Cell,
    valueGetter: (params: ValueGetterParams) =>
      (params.data as ICashTransferHistoryResponse).beneficiaryAccNo ||
      (params.data as ICashTransferHistoryResponse).beneficiaryAccountNo,
    valueFormatter: (params: ValueFormatterParams) =>
      params.value === ''
        ? '—'
        : params.value === undefined
        ? '—'
        : params.value,
  },
  {
    headerName: i18next.t('Beneficiary Bank'),
    field: 'beneficiaryBank',
    maxWidth: 150,
    headerClass: globalStyles.Header,
    cellClass: `${globalStyles.Cell} text-left `,
    tooltipValueGetter: tooltipRenderer,
    hide:
      transferType === TransferType.TO_SUB ||
      transferType === TransferType.FROM_TO_VSD,
    valueFormatter: (params: ValueFormatterParams) =>
      params.value ? i18next.t(params.value) : '—',
  },
  {
    headerName: i18next.t('Transfer Amount'),
    field: 'transferAmount',
    headerClass: globalStyles.Header,
    cellClass: globalStyles.Cell,
    valueFormatter: (params: ValueFormatterParams) =>
      params.value != null ? formatNumber(params.value) : '',
  },
  {
    headerName: i18next.t('Transfer fee'),
    field: 'transferFee',
    headerClass: globalStyles.Header,
    hide:
      transferType === TransferType.TO_SUB ||
      transferType === TransferType.TO_BANK,
    cellClass: `${globalStyles.Cell} text-right `,
    valueFormatter: (params: ValueFormatterParams) =>
      params.value ? i18next.t(params.value) : '—',
  },
  {
    headerName: i18next.t('Status'),
    field: 'status',
    headerClass: globalStyles.Header,
    cellClass: `${globalStyles.Cell} text-center`,
    valueFormatter: (params: ValueFormatterParams) => i18next.t(params.value),
    cellEditorFramework: IconRejectStatusTooltip,
  },
];
