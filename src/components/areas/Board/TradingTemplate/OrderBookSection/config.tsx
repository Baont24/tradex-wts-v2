import * as React from 'react';
import * as globalStyles from 'styles/style.scss';
import {
  CellClassParams,
  CellClickedEvent,
  ColDef,
  ColSpanParams,
  ValueFormatterParams,
} from 'ag-grid-community';
import { IColDef, IColGroupDef } from 'interfaces/common';
import { IOrderBookReducer } from 'interfaces/reducers';
import { IconRejectStatusTooltip } from 'components/common';
import { formatNumber } from 'utils/common';
import { formatTimeToDisplay } from 'utils/datetime';
import EditCell from 'components/areas/Account/OrderBook/EditCell';
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

export const getColumnDefs = (
  onClickEdit?: (data: IOrderBookReducer) => void,
  onClickDelete?: (data: IOrderBookReducer) => void,
  onViewCellClicked?: (event: CellClickedEvent) => void,
  accountType?: boolean
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
    colSpan: (params: ColSpanParams) => (params.data.totalCell ? 5 : 1),
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
    minWidth: 75,
    maxWidth: 75,
    cellClass: `${globalStyles.Cell} text-left`,
    pinned: true,
  },
  {
    headerName: i18next.t('Buy/Sell'),
    field: 'sellBuyType',
    cellClass: `${globalStyles.Cell} text-center`,
    cellClassRules: valueClassRules,
    valueFormatter: (params: ValueFormatterParams) =>
      i18next.t(`${params.value} 2`),
    pinned: true,
  },
  {
    headerName: i18next.t('Order Qty'),
    field: 'orderQuantity',
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(params.value, 2),
  },
  {
    headerName: i18next.t('Order Price'),
    field: 'orderPrice',
    valueFormatter: (params: ValueFormatterParams) =>
      typeof params.value === 'number'
        ? formatNumber(params.value, 2)
        : params.value,
  },
  {
    headerName: i18next.t('Matched Qty'),
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
    headerName: i18next.t('Unmatched Qty'),
    field: 'unmatchedQuantity',
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(params.value, 2),
  },
  {
    headerName: i18next.t('Type'),
    field: 'orderType',
  },
  {
    headerName: i18next.t('Status'),
    field: 'orderStatus',
    minWidth: 90,
    maxWidth: 90,
    cellClass: `${globalStyles.Cell} text-left`,
    cellRendererFramework: IconRejectStatusTooltip,
  },
  {
    headerName: i18next.t('Matched Value'),
    field: 'matchedValue',
    minWidth: 80,
    maxWidth: 80,
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(params.value, 2),
  },
  {
    headerName: i18next.t('Order No.'),
    field: 'orderNumber',
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
        accountType
      ) || '—',
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
