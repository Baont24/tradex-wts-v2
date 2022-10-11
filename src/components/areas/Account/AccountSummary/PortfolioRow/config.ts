import * as globalStyles from 'styles/style.scss';
import * as styles from './styles.scss';
import { ColDef, ColSpanParams, ValueFormatterParams } from 'ag-grid-community';
import { IColDef, IColGroupDef } from 'interfaces/common';
import {
  IDrAccountOpenPositionItem,
  IEquityEnquiryPortfolioBeanItemResponse,
} from 'interfaces/api';
import { formatDateToDisplay } from 'utils/datetime';
import { formatNumber } from 'utils/common';
import i18next from 'i18next';

export const DEFAULT_COL_DEF: ColDef = {
  minWidth: 110,
  headerClass: globalStyles.Header,
  cellClass: globalStyles.Cell,
  suppressMovable: true,
};

export const getColumnDefs = (): Array<
  | IColGroupDef<IEquityEnquiryPortfolioBeanItemResponse>
  | IColDef<IEquityEnquiryPortfolioBeanItemResponse>
> => [
  {
    headerName: i18next.t('Symbols'),
    field: 'symbol',
    cellClass: `${globalStyles.Cell} ${styles.SymbolCell}`,
    width: 80,
    colSpan: (params: ColSpanParams) =>
      (params.data as IEquityEnquiryPortfolioBeanItemResponse)?.symbol ===
      i18next.t('TOTAL 2')
        ? 5
        : 1,
  },
  {
    headerName: i18next.t('Total'),
    field: 'totalVol',
    valueFormatter: (params: ValueFormatterParams) =>
      valueFormatted(params.value),
  },
  {
    headerName: i18next.t('Sellable'),
    field: 'sellable',
    valueFormatter: (params: ValueFormatterParams) =>
      valueFormatted(params.value),
  },
  {
    headerName: i18next.t('Hold to sell'),
    field: 'holdToSell',
    valueFormatter: (params: ValueFormatterParams) =>
      valueFormatted(params.value),
  },
  {
    headerName: i18next.t('Others'),
    field: 'others',
    valueFormatter: (params: ValueFormatterParams) =>
      valueFormatted(params.value),
  },
  {
    headerName: i18next.t('Value'),
    field: 'value',
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(params.value, 2, undefined, undefined, '--'),
  },
  {
    headerName: i18next.t('Market Price'),
    field: 'marketPrice',
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(params.value, 2, undefined, undefined, '--'),
  },
  {
    headerName: i18next.t('Day Change (Val/%)'),
    field: 'dayChangeValue',
    cellClassRules: {
      [globalStyles.Up]: 'value > 0',
      [globalStyles.Ref]: 'value === 0',
      [globalStyles.Down]: 'value < 0',
      [globalStyles.Default]: 'value == null',
    },
    hide: true,
    valueFormatter: (params: ValueFormatterParams) => {
      return params.data.symbol !== i18next.t('TOTAL 2')
        ? `${
            (params.data as IEquityEnquiryPortfolioBeanItemResponse)
              ?.dayChangeValue === 'XXX'
              ? '—'
              : (params.data as IEquityEnquiryPortfolioBeanItemResponse)
                  ?.dayChangeValue
          } (${
            (params.data as IEquityEnquiryPortfolioBeanItemResponse)
              ?.dayChangePercent === 'XXX'
              ? '—'
              : (params.data as IEquityEnquiryPortfolioBeanItemResponse)
                  ?.dayChangePercent
          }%)`
        : '—';
    },
  },
  {
    headerName: i18next.t('Market Value'),
    field: 'marketValue',
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(params.value, 2, undefined, undefined, '--'),
  },
  {
    headerName: i18next.t('Lending Rate'),
    field: 'lendingRate',
    valueFormatter: (params: ValueFormatterParams) => {
      return params.data.symbol === 'TOTAL'
        ? '—'
        : `${valueFormatted(params.value)}%`;
    },
  },
  {
    headerName: i18next.t('Unrealized P/L (Val/%)'),
    field: 'unrealizedPLValue',
    cellClassRules: {
      [globalStyles.Up]: 'value > 0',
      [globalStyles.Down]: 'value < 0',
      [globalStyles.Default]: '!value',
    },
    valueFormatter: (params: ValueFormatterParams) =>
      `${formatNumber(
        (params.data as IEquityEnquiryPortfolioBeanItemResponse)
          ?.unrealizedPLValue
      )} (${valueFormatted(
        (params.data as IEquityEnquiryPortfolioBeanItemResponse)
          ?.unrealizedPLPercent
      )}%)`,
  },
];

export const getDrColumnDefs = (): Array<
  IColGroupDef<IDrAccountOpenPositionItem> | IColDef<IDrAccountOpenPositionItem>
> => [
  {
    headerName: i18next.t('Series ID'),
    field: 'seriesID',
    colSpan: (params: ColSpanParams) =>
      (params.data as IEquityEnquiryPortfolioBeanItemResponse)?.symbol ===
      'TOTAL'
        ? 6
        : 1,
  },
  {
    headerName: i18next.t('Expired Date'),
    field: 'expiredDate',
    valueFormatter: (params: ValueFormatterParams) =>
      formatDateToDisplay(params.value) || '—',
    hide: true,
  },
  {
    headerName: i18next.t('Long'),
    field: 'long',
    valueFormatter: (params: ValueFormatterParams) =>
      valueFormatted(params.value),
  },
  {
    headerName: i18next.t('Short'),
    field: 'short',
    valueFormatter: (params: ValueFormatterParams) =>
      valueFormatted(params.value),
  },
  {
    headerName: i18next.t('Average Bid'),
    field: 'averageBid',
    valueFormatter: (params: ValueFormatterParams) =>
      valueFormatted(params.value),
  },
  {
    headerName: i18next.t('Average Ask'),
    field: 'averageAsk',
    valueFormatter: (params: ValueFormatterParams) =>
      valueFormatted(params.value),
  },
  {
    headerName: i18next.t('Floating P/L'),
    field: 'floatingPL',
    valueFormatter: (params: ValueFormatterParams) =>
      valueFormatted(params.value),
    cellClassRules: {
      [globalStyles.Up]: 'value > 0',
      [globalStyles.Down]: 'value < 0',
    },
  },
];

const valueFormatted = (value?: number) =>
  formatNumber(value, 2, undefined, undefined, '--');
