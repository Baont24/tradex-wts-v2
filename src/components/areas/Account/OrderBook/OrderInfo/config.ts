import * as globalStyles from 'styles/style.scss';
import {
  ColDef,
  ITooltipParams,
  ValueFormatterParams,
} from 'ag-grid-community';
import { IColDef, IColGroupDef } from 'interfaces/common';
import { IOrderBookDetailResponse } from 'interfaces/api';
import { formatDateToDisplay } from 'utils/datetime';
import { formatNumber } from 'utils/common';
import i18next from 'i18next';

export const DEFAULT_COL_DEF: ColDef = {
  minWidth: 80,
  headerClass: globalStyles.Header,
  cellClass: globalStyles.Cell,
  suppressMovable: true,
};

const tooltipRenderer = (params: { readonly value: string }) => {
  return '<span title="' + params.value + '">' + params.value + '</span>';
};

export const getColumnDef = (): Array<
  IColDef<IOrderBookDetailResponse> | IColGroupDef<IOrderBookDetailResponse>
> => [
  {
    headerName: i18next.t('Time'),
    field: 'time',
    minWidth: 130,
    valueFormatter: (params: ValueFormatterParams) =>
      formatDateToDisplay(
        (params.data as IOrderBookDetailResponse)?.time,
        'HH:mm:ss dd/MM/yyyy',
        'yyyyMMddHHmmss',
        true
      ) || '',
  },
  {
    headerName: i18next.t('Order ID'),
    field: 'orderID',
    valueFormatter: (params: ValueFormatterParams) => {
      return params.data.orderID || params.data.orderId;
    },
  },
  {
    headerName: i18next.t('Action 1'),
    field: 'action',
    cellRenderer: tooltipRenderer,
  },
  {
    headerName: i18next.t('Price'),
    field: 'price',
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(params.value, 2),
  },
  {
    headerName: i18next.t('Quantity'),
    field: 'quantity',
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(params.value, 2),
  },
  {
    headerName: i18next.t('Status'),
    field: 'status',
  },
  {
    headerName: i18next.t('Remark'),
    field: 'remark',
    tooltipValueGetter: (params: ITooltipParams) => params.value,
  },
];
