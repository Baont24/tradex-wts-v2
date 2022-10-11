import * as globalStyles from 'styles/style.scss';
import { ColDef, ColSpanParams, ValueFormatterParams } from 'ag-grid-community';
import { IColDef, IColGroupDef } from 'interfaces/common';
import { IDrOrderHistoryResponse, IOrderHistoryResponse } from 'interfaces/api';
import { IconRejectStatusTooltip } from 'components/common';
import { formatNumber } from 'utils/common';
import { formatTimeToDisplay } from 'utils/datetime';
import i18next from 'i18next';

const MIN_WIDTH = 100;

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

export const getColumnDefs = (): Array<
  IColGroupDef<IOrderHistoryResponse> | IColDef<IOrderHistoryResponse>
> => [
  {
    headerName: i18next.t('Symbol'),
    field: 'symbol',
    cellClass: `${globalStyles.Cell} text-left`,
    colSpan: (params: ColSpanParams) =>
      params.data.symbol === i18next.t('TOTAL 2') ? 2 : 1,
    pinned: true,
  },
  {
    headerName: i18next.t('Buy/Sell'),
    field: 'sellBuyType',
    cellClass: `${globalStyles.Cell} text-center`,
    valueFormatter: (params: ValueFormatterParams) =>
      i18next.t(`${params.value} 2`),
    cellClassRules: valueClassRules,
    pinned: true,
  },
  {
    headerName: i18next.t('Order Quantity'),
    field: 'orderQty',
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber((params.data as IOrderHistoryResponse)?.orderQty),
  },
  {
    headerName: i18next.t('Order Price'),
    field: 'orderPrice',
    valueFormatter: (params: ValueFormatterParams) =>
      params.data.accountNo === i18next.t('TOTAL 2')
        ? '—'
        : formatNumber((params.data as IOrderHistoryResponse)?.orderPrice),
  },
  {
    headerName: i18next.t('Matched Quantity'),
    field: 'matchedQty',
    minWidth: MIN_WIDTH,
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber((params.data as IOrderHistoryResponse)?.matchedQty),
  },
  {
    headerName: i18next.t('Matched Price'),
    field: 'matchedPrice',
    minWidth: MIN_WIDTH - 15,
    valueFormatter: (params: ValueFormatterParams) =>
      params.data.accountNo === i18next.t('TOTAL 2')
        ? '—'
        : formatNumber((params.data as IOrderHistoryResponse)?.matchedPrice),
  },
  {
    headerName: i18next.t('Unmatched Quantity 1'),
    field: 'unmatchedQty',
    minWidth: MIN_WIDTH,
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber((params.data as IOrderHistoryResponse)?.unmatchedQty),
  },
  {
    headerName: i18next.t('Order Type'),
    field: 'orderType',
    cellClass: `${globalStyles.Cell} text-left`,
  },
  {
    headerName: i18next.t('Order Status'),
    field: 'orderStatus',
    cellClass: `${globalStyles.Cell} text-left`,
    cellRendererFramework: IconRejectStatusTooltip,
  },
  {
    headerName: i18next.t('Matched Valude'),
    field: 'matchedValue',
    minWidth: MIN_WIDTH - 30,
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber((params.data as IOrderHistoryResponse)?.matchedValue),
  },
  // {
  //   headerName: i18next.t('Transaction Fee'),
  //   field: 'transactionFee',
  //   minWidth: MIN_WIDTH - 15,
  //   valueFormatter: (params: ValueFormatterParams) =>
  //     formatNumber(Number((params.data as IOrderHistoryResponse)?.transactionFee), 0, undefined, false, '—'),
  // },
  // {
  //   headerName: i18next.t('Tax'),
  //   field: 'tax',
  //   valueFormatter: (params: ValueFormatterParams) =>
  //     formatNumber(Number((params.data as IOrderHistoryResponse)?.tax), 0, undefined, false, '—'),
  // },
  {
    headerName: i18next.t('Order No.'),
    field: 'orderNo',
    cellClass: `${globalStyles.Cell} text-center`,
  },
  {
    headerName: i18next.t('Order Time'),
    field: 'orderTime',
    minWidth: 130,
    cellClass: `${globalStyles.Cell} text-center`,
    valueFormatter: (params: ValueFormatterParams) =>
      formatTimeToDisplay(
        (params.data as IOrderHistoryResponse)?.orderTime,
        'HH:mm:ss dd/MM/yyyy',
        'yyyyMMddHHmmss',
        true
      ) || '',
  },
  {
    headerName: i18next.t('Validity'),
    field: 'validity',
    cellClass: `${globalStyles.Cell} text-center`,
    valueFormatter: (params: ValueFormatterParams) => i18next.t(params.value),
  },
];

export const getDrOrderHistoryColumnDefs = (): Array<
  IColGroupDef<IDrOrderHistoryResponse> | IColDef<IDrOrderHistoryResponse>
> => [
  {
    headerName: i18next.t('Symbol'),
    field: 'symbol',
    cellClass: `${globalStyles.Cell} text-left`,
    colSpan: (params: ColSpanParams) =>
      params.data.symbol === i18next.t('TOTAL 2') ? 2 : 1,
    pinned: true,
  },
  {
    headerName: i18next.t('Buy/Sell'),
    field: 'sellBuyType',
    cellClass: `${globalStyles.Cell} text-center`,
    cellClassRules: valueClassRules,
    pinned: true,
  },
  {
    headerName: i18next.t('Order Quantity'),
    field: 'orderQuantity',
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber((params.data as IDrOrderHistoryResponse)?.orderQuantity),
  },
  {
    headerName: i18next.t('Order Price'),
    field: 'orderPrice',
    valueFormatter: (params: ValueFormatterParams) =>
      params.data.accountNumber === i18next.t('TOTAL 2')
        ? '—'
        : formatNumber((params.data as IDrOrderHistoryResponse)?.orderPrice),
  },
  {
    headerName: i18next.t('Matched Quantity'),
    field: 'matchedQuantity',
    minWidth: MIN_WIDTH,
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber((params.data as IDrOrderHistoryResponse)?.matchedQuantity),
  },
  {
    headerName: i18next.t('Matched Price'),
    field: 'matchedPrice',
    minWidth: MIN_WIDTH - 15,
    valueFormatter: (params: ValueFormatterParams) =>
      params.data.accountNumber === i18next.t('TOTAL 2')
        ? '—'
        : formatNumber((params.data as IDrOrderHistoryResponse)?.matchedPrice),
  },
  {
    headerName: i18next.t('Unmatched Quantity 1'),
    field: 'unmatchedQuantity',
    minWidth: MIN_WIDTH,
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber((params.data as IDrOrderHistoryResponse)?.unmatchedQuantity),
  },
  {
    headerName: i18next.t('Order Type'),
    field: 'orderType',
    cellClass: `${globalStyles.Cell} text-left`,
  },
  {
    headerName: i18next.t('Order Status'),
    field: 'orderStatus',
    cellClass: `${globalStyles.Cell} text-left`,
    cellRendererFramework: IconRejectStatusTooltip,
  },
  {
    headerName: i18next.t('Matched Valude'),
    field: 'matchedValue',
    minWidth: MIN_WIDTH - 30,
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber((params.data as IDrOrderHistoryResponse)?.matchedValue),
  },
  {
    headerName: i18next.t('Transaction Fee'),
    field: 'transactionFee',
    hide: true,
    minWidth: MIN_WIDTH - 15,
  },
  {
    headerName: i18next.t('Tax'),
    field: 'tax',
    hide: true,
    minWidth: 70,
  },
  {
    headerName: i18next.t('Order No.'),
    field: 'orderNumber',
    cellClass: `${globalStyles.Cell} text-center`,
  },
  {
    headerName: i18next.t('Order Time'),
    field: 'orderTime',
    minWidth: 130,
    cellClass: `${globalStyles.Cell} text-center`,
    valueFormatter: (params: ValueFormatterParams) =>
      formatTimeToDisplay(
        (params.data as IOrderHistoryResponse)?.orderTime,
        'HH:mm:ss dd/MM/yyyy',
        'yyyyMMddHHmmss',
        true
      ) || '',
  },
  {
    headerName: i18next.t('Validity'),
    field: 'validity',
    cellClass: `${globalStyles.Cell} text-center`,
  },
];
