import * as globalStyles from 'styles/style.scss';
import { ColDef, ValueFormatterParams } from 'ag-grid-community';
import { IColDef, IColGroupDef } from 'interfaces/common';
import { IStopOrderHistoryResponse } from 'interfaces/api';
import { IconRejectStatusTooltip } from 'components/common';
import { formatDateToDisplay, formatTimeToDisplay } from 'utils/datetime';
import { formatNumber } from 'utils/common';
import EditCell from './EditCell';
import i18next from 'i18next';

export const DEFAULT_COL_DEF: ColDef = {
  minWidth: 70,
  headerClass: globalStyles.Header,
  cellClass: globalStyles.Cell,
  suppressMovable: true,
};

const valueClassRules = {
  Up: "value === 'BUY'",
  Down: "value === 'SELL'",
};

export const getColumnDefs = (
  onClickEdit?: (data: IStopOrderHistoryResponse) => void,
  onClickDelete?: (data: IStopOrderHistoryResponse) => void
): Array<
  IColGroupDef<IStopOrderHistoryResponse> | IColDef<IStopOrderHistoryResponse>
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
    pinned: true,
  },
  {
    headerName: i18next.t(''),
    colId: 'edit',
    minWidth: 60,
    maxWidth: 60,
    cellRendererFramework: EditCell,
    pinned: true,
    suppressSizeToFit: true,
    cellRendererParams: {
      onClickEdit,
      onClickDelete,
    },
  },
  {
    headerName: i18next.t('Symbol'),
    field: 'code',
    cellClass: [globalStyles.Cell, 'text-center'],
    pinned: true,
  },
  {
    headerName: i18next.t('Buy/Sell Order'),
    field: 'sellBuyType',
    cellClass: [globalStyles.Cell, 'text-center'],
    valueFormatter: (params: ValueFormatterParams) =>
      i18next.t(`${params.value} 2`),
    cellClassRules: valueClassRules,
    pinned: true,
  },
  {
    headerName: i18next.t('Type of Order'),
    field: 'orderType',
  },
  {
    headerName: i18next.t('Quantity'),
    field: 'orderQuantity',
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(params.value, 2),
  },
  {
    headerName: i18next.t('Stop Price'),
    field: 'stopPrice',
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(params.value, 2),
  },
  {
    headerName: i18next.t('Limit Price'),
    field: 'orderPrice',
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(params.value, 2),
  },
  {
    headerName: i18next.t('Order Status'),
    field: 'status',
    cellRendererFramework: IconRejectStatusTooltip,
    cellRendererParams: {
      screenStopOrderHistory: true,
    },
  },
  {
    headerName: i18next.t('Order Time'),
    field: 'createTime',
    minWidth: 130,
    cellClass: [globalStyles.Cell, 'text-center'],
    valueFormatter: (params: ValueFormatterParams) =>
      formatTimeToDisplay(
        params.value,
        'HH:mm:ss dd/MM/yyyy',
        'yyyyMMddHHmmss'
      ) || '',
  },
  {
    headerName: i18next.t('From Date'),
    field: 'fromDate',
    cellClass: [globalStyles.Cell, 'text-center'],
    valueFormatter: (params: ValueFormatterParams) =>
      formatDateToDisplay(params.value) || '',
  },
  {
    headerName: i18next.t('To Date'),
    field: 'toDate',
    cellClass: [globalStyles.Cell, 'text-center'],
    valueFormatter: (params: ValueFormatterParams) =>
      formatDateToDisplay(params.value) || '',
  },
];
