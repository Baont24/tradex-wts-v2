import * as globalStyles from 'styles/style.scss';
import {
  CellClassParams,
  ColDef,
  ColSpanParams,
  ValueFormatterParams,
} from 'ag-grid-community';
import { IColDef, IColGroupDef } from 'interfaces/common';
import { IDrAccountClosePositionItem } from 'interfaces/api';
import { formatDateToDisplay } from 'utils/datetime';
import { formatNumber } from 'utils/common';
import i18next from 'i18next';

export const DEFAULT_COL_DEF: ColDef = {
  minWidth: 60,
  headerClass: globalStyles.Header,
  cellClass: globalStyles.Cell,
  suppressMovable: true,
};

export const getColumnDefsEquity = (): Array<
  | IColGroupDef<IDrAccountClosePositionItem>
  | IColDef<IDrAccountClosePositionItem>
> => [
  {
    headerName: i18next.t('Series ID'),
    field: 'seriesID',
    cellClass: [globalStyles.Cell, 'text-center'],
    cellClassRules: {
      ['text-left']: (params: CellClassParams) => {
        return params.data.seriesID !== 'TOTAL';
      },
    },
    colSpan: (params: ColSpanParams) => {
      if (params.data.seriesID === 'TOTAL') {
        return 6;
      } else {
        return 1;
      }
    },
  },
  {
    headerName: i18next.t('Expired Date'),
    field: 'expiredDate',
    cellClass: `${globalStyles.Cell} text-center`,
    valueFormatter: (params: ValueFormatterParams) =>
      formatDateToDisplay(params.data.expiredDate) || '—',
  },
  {
    headerName: i18next.t('Long'),
    field: 'long',
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(params.data.long, 0, undefined, undefined, '—'),
  },
  {
    headerName: i18next.t('Short'),
    field: 'short',
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(params.data.short, 0, undefined, undefined, '—'),
  },
  {
    headerName: i18next.t('Average Bid'),
    field: 'averageBid',
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(params.data.averageBid, 1, undefined, undefined, '—'),
  },
  {
    headerName: i18next.t('Average Ask'),
    field: 'marketPrice',
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(params.data.marketPrice, 0, undefined, undefined, '—'),
  },
  {
    headerName: i18next.t('Trading P/L'),
    field: 'tradingPL',
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(params.data.tradingPL, 0, undefined, undefined, '—'),
    cellClassRules: {
      [globalStyles.Up]: (params: CellClassParams) => {
        return params.data.tradingPL > 0;
      },
      [globalStyles.Down]: (params: CellClassParams) => {
        return params.data.tradingPL < 0;
      },
      [globalStyles.Default]: (params: CellClassParams) => {
        return params.data.tradingPL === 0;
      },
      [globalStyles.Default]: (params: CellClassParams) => {
        return params.data.tradingPL == null;
      },
    },
  },
];
