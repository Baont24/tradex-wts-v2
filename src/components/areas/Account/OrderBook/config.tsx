import * as React from 'react';
import * as globalStyles from 'styles/style.scss';
import {
  CellClassParams,
  CellClickedEvent,
  ColDef,
  ColSpanParams,
  ITooltipParams,
  ValueFormatterParams,
} from 'ag-grid-community';
import { IColDef, IColGroupDef } from 'interfaces/common';
import { IOrderBookReducer } from 'interfaces/reducers';
import { IconRejectStatusTooltip } from 'components/common';
import { OrderStatusResponse, OrderType } from 'constants/enum';
import { formatNumber } from 'utils/common';
import { formatTimeToDisplay } from 'utils/datetime';
import EditCell from './EditCell';
import i18next from 'i18next';
import styles from './styles.scss';

export const DEFAULT_COL_DEF: ColDef = {
  minWidth: 70,
  headerClass: globalStyles.Header,
  cellClass: globalStyles.Cell,
  suppressMovable: true,
};

export const valueClassRules = {
  Up: "value === 'BUY'",
  Down: "value === 'SELL'",
};

const tooltipRenderer = (params: ITooltipParams) => {
  return params.value;
};

export interface IEquityOrderBookFormatterParams extends ValueFormatterParams {
  readonly data: IOrderBookReducer | undefined;
}

export const getColumnDefs = (
  onClickEdit?: (data: IOrderBookReducer) => void,
  onClickDelete?: (data: IOrderBookReducer) => void,
  onViewCellClicked?: (event: CellClickedEvent) => void,
  isAccountTypeEquity?: boolean
): Array<
  | IColGroupDef<IOrderBookReducer & { readonly totalCell?: string }>
  | IColDef<IOrderBookReducer & { readonly totalCell?: string }>
> => [
  {
    colId: 'checkbox',
    field: 'totalCell',
    headerCheckboxSelection: true,
    headerCheckboxSelectionFilteredOnly: true,
    checkboxSelection: true,
    headerName: '',
    minWidth: 30,
    maxWidth: 30,
    suppressSizeToFit: true,
    cellClass: [globalStyles.Cell, styles.AlignCheckBox],
    headerClass: styles.AlignCheckBox,
    pinned: true,
    colSpan: (params: ColSpanParams) => (params.data.totalCell ? 4 : 1),
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
    field: 'symbol',
    cellClass: `${globalStyles.Cell} text-left`,
    pinned: true,
    minWidth: 75,
    maxWidth: 75,
  },
  {
    headerName: i18next.t('Buy/Sell Order'),
    field: 'sellBuyType',
    cellClass: `${globalStyles.Cell} text-center`,
    cellClassRules: valueClassRules,
    valueFormatter: (params: ValueFormatterParams) =>
      i18next.t(`${params.value} 2`),
    pinned: true,
  },
  {
    headerName: i18next.t('Order Quantity'),
    field: 'orderQuantity',
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(params.value, 2),
  },
  {
    headerName: i18next.t('Order Price'),
    field: 'orderPrice',
    valueFormatter: (params: ValueFormatterParams) => {
      const orderType = params.data.orderType;
      return orderType !== OrderType.LO && orderType !== OrderType.ODDLOT
        ? orderType
        : formatNumber(params.value, 2);
    },
  },
  {
    headerName: i18next.t('Matched Quantity'),
    field: 'matchedQuantity',
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(params.value, 2),
  },
  {
    headerName: i18next.t('Matched Price'),
    field: 'matchedPrice',
    valueFormatter: (params: ValueFormatterParams) =>
      typeof params.value === 'number'
        ? formatNumber(params.value, 2)
        : params.value,
  },
  {
    headerName: i18next.t('Unmatched Quantity 1'),
    field: 'unmatchedQuantity',
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(params.value, 2),
  },
  {
    headerName: i18next.t('Order Type 2'),
    field: 'orderType',
  },
  {
    headerName: i18next.t('Order Status'),
    field: 'orderStatus',
    cellClass: `${globalStyles.Cell} text-left`,
    cellRendererFramework: IconRejectStatusTooltip,
  },
  {
    headerName: i18next.t('Matched Value'),
    field: 'matchedValue',
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(params.value, 2),
  },
  {
    headerName: i18next.t('Order No.'),
    field: isAccountTypeEquity ? 'orderGroupNo' : 'orderGroupID',
  },
  {
    headerName: i18next.t('Order Time'),
    field: 'orderTime',
    minWidth: 130,
    valueFormatter: (params: ValueFormatterParams) =>
      formatTimeToDisplay(
        (params.data as IOrderBookReducer)?.orderTime,
        'HH:mm:ss dd/MM/yyyy',
        'yyyyMMddHHmmss',
        isAccountTypeEquity
      ) || '—',
    sort: 'desc',
  },
  {
    headerName: i18next.t('Validity'),
    field: 'validity',
    valueFormatter: (params: ValueFormatterParams) =>
      params.value ? i18next.t(params.value) : '—',
  },
  {
    headerName: i18next.t(''),
    colId: 'view',
    minWidth: 40,
    maxWidth: 40,
    cellRendererFramework: () => <div>{i18next.t('View')}</div>,
    onCellClicked: onViewCellClicked,
    cellClass: [globalStyles.Cell, styles.ViewCell],
    cellClassRules: {
      [styles.HideViewCell]: (params: CellClassParams) => params.data.totalCell,
    },
  },
];

export const getMiniColumnDefs = (
  onClickEdit?: (data: IOrderBookReducer) => void,
  onClickDelete?: (data: IOrderBookReducer) => void,
  onViewCellClicked?: (event: CellClickedEvent) => void
): Array<IColGroupDef<IOrderBookReducer> | IColDef<IOrderBookReducer>> => [
  {
    headerName: i18next.t(''),
    colId: 'edit',
    minWidth: 55,
    maxWidth: 55,
    cellRendererFramework: EditCell,
    cellRendererParams: {
      onClickEdit,
      onClickDelete,
    },
  },
  {
    headerName: i18next.t('Sym.'),
    field: 'symbol',
    cellClass: `${globalStyles.Cell} text-center`,
    minWidth: 75,
    maxWidth: 75,
    tooltipValueGetter: tooltipRenderer,
  },
  {
    headerName: i18next.t('B/S'),
    field: 'sellBuyType',
    cellClass: `${globalStyles.Cell} text-center`,
    minWidth: 31,
    maxWidth: 31,
    cellClassRules: valueClassRules,
    valueFormatter: (params: ValueFormatterParams) =>
      params.value === 'BUY' ? 'B' : 'S',
  },
  {
    headerName: i18next.t('M.Qtt/Qtt'),
    field: 'orderQuantity',
    valueFormatter: (params: IEquityOrderBookFormatterParams) => {
      return `${formatNumber(params.data?.matchedQuantity)}/${formatNumber(
        params.value,
        2
      )}`;
    },
    minWidth: 89,
    maxWidth: 89,
    valueGetter: 'data.orderQty ? data.orderQty : data.orderQuantity',
    // cellRenderer: tooltipRenderer,
  },
  {
    headerName: i18next.t('Ordered Price'),
    field: 'orderPrice',
    tooltipValueGetter: tooltipRenderer,
    valueFormatter: (params: ValueFormatterParams) => {
      const orderType = params.data.orderType;
      return orderType !== OrderType.LO && orderType !== OrderType.ODDLOT
        ? orderType
        : formatNumber(params.value, 2);
    },
    minWidth: 55,
    maxWidth: 55,
  },
  {
    headerName: i18next.t('Stt 1'),
    field: 'orderStatus',
    cellClass: `${globalStyles.Cell} text-center`,
    minWidth: 105,
    maxWidth: 105,
    valueFormatter: (params: ValueFormatterParams) =>
      params.value === OrderStatusResponse.SENDING
        ? i18next.t('Sending')
        : i18next.t(params.value),
    tooltipValueGetter: tooltipRenderer,
  },
];
