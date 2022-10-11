import * as globalStyles from 'styles/style.scss';
import {
  CellClassParams,
  CellClickedEvent,
  ColDef,
  ColSpanParams,
  ITooltipParams,
  ValueFormatterParams,
  ValueGetterParams,
} from 'ag-grid-community';
import { IColDef, IColGroupDef } from 'interfaces/common';
import {
  IDrAccountOpenPositionItem,
  IEquityEnquiryPortfolioBeanItemResponse,
} from 'interfaces/api';
import { formatDateToDisplay } from 'utils/datetime';
import { formatNumber } from 'utils/common';
import PortfolioBtnCell from './PortfolioBtnCell';
import Styles from './styles.scss';
import i18next from 'i18next';

export const DEFAULT_COL_DEF: ColDef = {
  minWidth: 60,
  headerClass: globalStyles.Header,
  cellClass: globalStyles.Cell,
  suppressMovable: true,
};

const tooltipRenderer = (params: ITooltipParams) => {
  return params.value;
};

export const getColumnDefsEquity = (
  onClickSymbol: (data: CellClickedEvent) => void
): Array<
  | IColGroupDef<IEquityEnquiryPortfolioBeanItemResponse>
  | IColDef<IEquityEnquiryPortfolioBeanItemResponse>
> => [
  {
    headerName: '',
    cellRendererFramework: PortfolioBtnCell,
    minWidth: 80,
    maxWidth: 80,
    suppressSizeToFit: true,
    cellClassRules: {
      [Styles.hideBtn]: (params: CellClassParams) => {
        return (
          params.data.symbol === i18next.t('TOTAL 2') || !params.data.symbol
        );
      },
    },
  },
  {
    headerName: i18next.t('Symbol'),
    field: 'symbol',
    cellClass: [globalStyles.Cell],
    cellClassRules: {
      ['text-center']: (params: CellClassParams) => {
        return params.data.symbol !== i18next.t('TOTAL 2');
      },
    },

    sortable: true,
    sort: 'asc',
    onCellClicked: onClickSymbol,
  },
  {
    headerName: i18next.t('Total'),
    field: 'totalVol',
    valueGetter: (params: ValueGetterParams) =>
      (params.data as IEquityEnquiryPortfolioBeanItemResponse)?.totalVol,
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(
        (params.data as IEquityEnquiryPortfolioBeanItemResponse)?.totalVol,
        0,
        undefined,
        false,
        '—'
      ),
  },
  {
    headerName: i18next.t('MAS_Sellable'),
    field: 'sellable',
    valueGetter: (params: ValueGetterParams) =>
      (params.data as IEquityEnquiryPortfolioBeanItemResponse)?.sellable,
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(
        (params.data as IEquityEnquiryPortfolioBeanItemResponse)?.sellable,
        0,
        undefined,
        false,
        '—'
      ),
  },
  {
    headerName: i18next.t('Avg Price'),
    field: 'avgPrice',
    valueGetter: (params: ValueGetterParams) =>
      formatNumber(
        (params.data as IEquityEnquiryPortfolioBeanItemResponse)?.avgPrice,
        0,
        undefined,
        false,
        '—'
      ),
  },
  {
    headerName: i18next.t('Value 2'),
    field: 'value',
    minWidth: 135,
    valueGetter: (params: ValueGetterParams) =>
      (params.data as IEquityEnquiryPortfolioBeanItemResponse)?.value,
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(
        (params.data as IEquityEnquiryPortfolioBeanItemResponse)?.value,
        0,
        undefined,
        false,
        '—'
      ),
  },
  {
    headerName: i18next.t('Market Price'),
    field: 'marketPrice',
    valueGetter: (params: ValueGetterParams) =>
      (params.data as IEquityEnquiryPortfolioBeanItemResponse)?.marketPrice,
    headerClass: globalStyles.Header,
    cellClass: globalStyles.Cell,
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(
        (params.data as IEquityEnquiryPortfolioBeanItemResponse)?.marketPrice,
        2,
        undefined,
        false,
        '—'
      ),
  },
  {
    headerName: i18next.t('Market Value'),
    field: 'marketValue',
    minWidth: 130,
    valueGetter: (params: ValueGetterParams) =>
      (params.data as IEquityEnquiryPortfolioBeanItemResponse)?.marketValue,
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(
        (params.data as IEquityEnquiryPortfolioBeanItemResponse)?.marketValue,
        0,
        undefined,
        false,
        '—'
      ),
  },
  {
    headerName: i18next.t('Unrealized P/L (Value/%)'),
    minWidth: 155,
    maxWidth: 155,
    valueGetter: (params: ValueGetterParams) => {
      return `${formatNumber(
        (params.data as IEquityEnquiryPortfolioBeanItemResponse)
          ?.unrealizedPLValue
      )} (${formatNumber(
        (params.data as IEquityEnquiryPortfolioBeanItemResponse)
          ?.unrealizedPLPercent,
        2,
        undefined,
        false,
        '—'
      )}%)`;
    },
    tooltipValueGetter: tooltipRenderer,
    cellClassRules: {
      [globalStyles.Up]: (params: CellClassParams) => {
        return params.data.unrealizedPLPercent > 0;
      },
      [globalStyles.Down]: (params: CellClassParams) => {
        return params.data.unrealizedPLPercent < 0;
      },
      [globalStyles.Default]: (params: CellClassParams) => {
        return params.data.unrealizedPLPercent === 0;
      },
      [globalStyles.Default]: (params: CellClassParams) => {
        return params.data.unrealizedPLPercent == null;
      },
    },
  },
  {
    headerName: i18next.t('Hold to sell'),
    field: 'holdToSell',
    valueGetter: (params: ValueGetterParams) =>
      (params.data as IEquityEnquiryPortfolioBeanItemResponse)?.holdToSell,
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(
        (params.data as IEquityEnquiryPortfolioBeanItemResponse)?.holdToSell,
        0,
        undefined,
        false,
        '—'
      ),
  },
  {
    headerName: i18next.t('Pending Stock Payment'),
    headerClass: `${globalStyles.GroupHeader} ${globalStyles.Header}`,
    children: [
      {
        colId: 'b0',
        field: 'boughtT0',
        headerName: i18next.t('Bought T0'),
        headerClass: `${globalStyles.GroupHeader} ${globalStyles.Header} `,
        cellClass: `${globalStyles.Cell} `,
        valueFormatter: (params: ValueFormatterParams) =>
          formatNumber(
            (params.data as IEquityEnquiryPortfolioBeanItemResponse)?.boughtT0,
            0,
            undefined,
            false,
            '—'
          ),
      },
      {
        colId: 'b1',
        field: 'boughtT1',
        headerName: i18next.t('Bought T1'),
        headerClass: `${globalStyles.GroupHeader} ${globalStyles.Header} `,
        cellClass: `${globalStyles.Cell} `,
        valueFormatter: (params: ValueFormatterParams) =>
          formatNumber(
            (params.data as IEquityEnquiryPortfolioBeanItemResponse)?.boughtT1,
            0,
            undefined,
            false,
            '—'
          ),
      },
      {
        colId: 'b2',
        field: 'boughtT2',
        headerName: i18next.t('Bought T2'),
        headerClass: `${globalStyles.GroupHeader} ${globalStyles.Header} `,
        cellClass: `${globalStyles.Cell} `,
        valueFormatter: (params: ValueFormatterParams) =>
          formatNumber(
            (params.data as IEquityEnquiryPortfolioBeanItemResponse)?.boughtT2,
            0,
            undefined,
            false,
            '—'
          ),
      },
    ],
  },
  {
    headerName: i18next.t('Orthers'),
    headerClass: `${globalStyles.GroupHeader} ${globalStyles.Header}`,
    children: [
      {
        colId: 'a',
        field: 'awaitTrading',
        headerName: i18next.t('A.trading'),
        headerClass: `${globalStyles.GroupHeader} ${globalStyles.Header} `,
        cellClass: `${globalStyles.Cell} `,
        valueFormatter: (params: ValueFormatterParams) =>
          formatNumber(
            (params.data as IEquityEnquiryPortfolioBeanItemResponse)
              ?.awaitTrading,
            0,
            undefined,
            false,
            '—'
          ),
      },
      {
        colId: 'm',
        field: 'mortgage',
        headerName: i18next.t('Mortgage 2'),
        headerClass: `${globalStyles.GroupHeader} ${globalStyles.Header} `,
        cellClass: `${globalStyles.Cell} `,
        valueFormatter: (params: ValueFormatterParams) =>
          formatNumber(
            (params.data as IEquityEnquiryPortfolioBeanItemResponse)?.mortgage,
            0,
            undefined,
            false,
            '—'
          ),
      },
      {
        colId: 'h',
        field: 'hold',
        headerName: i18next.t('Hold 1'),
        headerClass: `${globalStyles.GroupHeader} ${globalStyles.Header} `,
        cellClass: `${globalStyles.Cell} `,
        valueFormatter: (params: ValueFormatterParams) => params.value ?? '—',
      },
      {
        colId: 'r',
        field: 'right',
        headerName: i18next.t('Right 2'),
        headerClass: `${globalStyles.GroupHeader} ${globalStyles.Header} `,
        cellClass: `${globalStyles.Cell} `,
        valueFormatter: (params: ValueFormatterParams) =>
          formatNumber(
            (params.data as IEquityEnquiryPortfolioBeanItemResponse)?.right,
            0,
            undefined,
            false,
            '—'
          ),
      },
    ],
  },

  {
    headerName: i18next.t('Day Change (Value/%)'),
    hide: true,
    valueGetter: (params: ValueGetterParams) => {
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
    headerClass: globalStyles.Header,
    cellClass: globalStyles.Cell,
    cellClassRules: {
      [globalStyles.Up]: (params: CellClassParams) => {
        return params.data.dayChangePercent > 0;
      },
      [globalStyles.Down]: (params: CellClassParams) => {
        return params.data.dayChangePercent < 0;
      },
      [globalStyles.Default]: (params: CellClassParams) => {
        return params.data.dayChangePercent === 0;
      },
      [globalStyles.Default]: (params: CellClassParams) => {
        return params.data.dayChangePercent == null;
      },
    },
  },

  {
    headerName: i18next.t('Lending Rate'),
    field: 'lendingRate',
    valueGetter: (params: ValueGetterParams) =>
      (params.data as IEquityEnquiryPortfolioBeanItemResponse)?.lendingRate,
    valueFormatter: (params: ValueFormatterParams) => {
      return params.data.symbol !== i18next.t('TOTAL 2')
        ? `${formatNumber(
            (params.data as IEquityEnquiryPortfolioBeanItemResponse)
              ?.lendingRate,
            0,
            undefined,
            false,
            '—'
          )}%`
        : '—';
    },
  },

  {
    headerName: i18next.t('Weight (%)'),
    field: 'weight',
    hide: true,
    valueGetter: (params: ValueGetterParams) =>
      (params.data as IEquityEnquiryPortfolioBeanItemResponse)?.weight === 'XXX'
        ? '—'
        : (params.data as IEquityEnquiryPortfolioBeanItemResponse)?.weight,
  },
];

export const getColumnDefsDerivatives = (): Array<
  IColGroupDef<IDrAccountOpenPositionItem> | IColDef<IDrAccountOpenPositionItem>
> => [
  {
    headerName: '',
    cellClass: `${globalStyles.Cell} text-center`,
    cellRendererFramework: PortfolioBtnCell,
    minWidth: 80,
    maxWidth: 80,
    suppressSizeToFit: true,
    cellClassRules: {
      [Styles.hideBtn]: (params: CellClassParams) => {
        return (
          params.data.seriesID === i18next.t('TOTAL 2') || !params.data.seriesID
        );
      },
    },
  },
  {
    headerName: i18next.t('Series ID'),
    field: 'seriesID',
    cellClass: `${globalStyles.Cell} text-center `,
    cellClassRules: {
      [Styles.alignRight]: (params: CellClassParams) => {
        return params.data.seriesID === i18next.t('TOTAL 2');
      },
    },
    colSpan: (params: ColSpanParams) => {
      if (params.data.seriesID === i18next.t('TOTAL 2')) {
        return 7;
      } else {
        return 1;
      }
    },
    sortable: true,
    sort: 'asc',
  },
  {
    headerName: i18next.t('Expired Date'),
    field: 'expiredDate',
    cellClass: `${globalStyles.Cell} text-center`,
    valueFormatter: (params: ValueFormatterParams) =>
      formatDateToDisplay(params.value) || '—',
  },
  {
    headerName: i18next.t('Long'),
    field: 'long',
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(params.value, 2, undefined, undefined, '--'),
  },
  {
    headerName: i18next.t('Short'),
    field: 'short',
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(params.value, 2, undefined, undefined, '--'),
  },
  {
    headerName: i18next.t('Average Bid'),
    field: 'averageBid',
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(params.value, 2, undefined, undefined, '--'),
  },
  {
    headerName: i18next.t('Average Ask'),
    field: 'averageAsk',
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
    headerName: i18next.t('Floating P/L'),
    field: 'floatingPL',
    tooltipValueGetter: tooltipRenderer,
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(params.value, 2, undefined, undefined, '--'),
    cellClassRules: {
      [globalStyles.Up]: (params: CellClassParams) => {
        return params.data.floatingPL > 0;
      },
      [globalStyles.Down]: (params: CellClassParams) => {
        return params.data.floatingPL < 0;
      },
      [globalStyles.Default]: (params: CellClassParams) => {
        return params.data.floatingPL === 0;
      },
      [globalStyles.Default]: (params: CellClassParams) => {
        return params.data.floatingPL == null;
      },
    },
  },
];

export const getColumnDefsEquityMini = (): Array<
  | IColGroupDef<IEquityEnquiryPortfolioBeanItemResponse>
  | IColDef<IEquityEnquiryPortfolioBeanItemResponse>
> => [
  {
    headerName: '',
    cellRendererFramework: PortfolioBtnCell,
    minWidth: 56,
    maxWidth: 56,
    suppressSizeToFit: true,
    cellClassRules: {
      [Styles.hideBtn]: (params: CellClassParams) => {
        return (
          params.data.symbol === i18next.t('TOTAL 2') || !params.data.symbol
        );
      },
    },
  },
  {
    headerName: i18next.t('Sym.'),
    field: 'symbol',
    cellClass: [globalStyles.Cell],
    cellClassRules: {
      ['text-center']: (params: CellClassParams) => {
        return params.data.symbol !== i18next.t('TOTAL 2');
      },
    },
    minWidth: 75,
    maxWidth: 75,
    tooltipValueGetter: tooltipRenderer,
    sortable: true,
    sort: 'asc',
  },
  {
    headerName: i18next.t('Total'),
    field: 'totalVol',
    minWidth: 48,
    maxWidth: 48,
    valueGetter: (params: ValueGetterParams) =>
      (params.data as IEquityEnquiryPortfolioBeanItemResponse)?.totalVol,
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(
        (params.data as IEquityEnquiryPortfolioBeanItemResponse)?.totalVol,
        0,
        undefined,
        false,
        '—'
      ),
  },
  {
    headerName: i18next.t('Avail.'),
    field: 'sellable',
    minWidth: 48,
    maxWidth: 48,
    valueGetter: (params: ValueGetterParams) =>
      (params.data as IEquityEnquiryPortfolioBeanItemResponse)?.sellable,
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(
        (params.data as IEquityEnquiryPortfolioBeanItemResponse)?.sellable,
        0,
        undefined,
        false,
        '—'
      ),
  },
  {
    headerName: i18next.t('Price'),
    field: 'avgPrice',
    minWidth: 55,
    maxWidth: 55,
    valueGetter: (params: ValueGetterParams) =>
      formatNumber(
        (params.data as IEquityEnquiryPortfolioBeanItemResponse)?.avgPrice,
        0,
        undefined,
        false,
        '—'
      ),
    tooltipValueGetter: tooltipRenderer,
  },
  {
    headerName: i18next.t('P/L'),
    minWidth: 134,
    maxWidth: 134,
    tooltipValueGetter: tooltipRenderer,
    valueGetter: (params: ValueGetterParams) => {
      return `${formatNumber(
        (params.data as IEquityEnquiryPortfolioBeanItemResponse)
          ?.unrealizedPLValue
      )} (${formatNumber(
        (params.data as IEquityEnquiryPortfolioBeanItemResponse)
          ?.unrealizedPLPercent,
        2,
        undefined,
        false,
        '—'
      )}%)`;
    },
    cellClassRules: {
      [globalStyles.Up]: (params: CellClassParams) => {
        return params.data.unrealizedPLPercent > 0;
      },
      [globalStyles.Down]: (params: CellClassParams) => {
        return params.data.unrealizedPLPercent < 0;
      },
      [globalStyles.Default]: (params: CellClassParams) => {
        return params.data.unrealizedPLPercent === 0;
      },
      [globalStyles.Default]: (params: CellClassParams) => {
        return params.data.unrealizedPLPercent == null;
      },
    },
  },
];

export const getColumnDefsDerivativesMini = (): Array<
  IColGroupDef<IDrAccountOpenPositionItem> | IColDef<IDrAccountOpenPositionItem>
> => [
  {
    headerName: '',
    cellClass: `${globalStyles.Cell} text-center`,
    cellRendererFramework: PortfolioBtnCell,
    minWidth: 56,
    maxWidth: 56,
    suppressSizeToFit: true,
    cellClassRules: {
      [Styles.hideBtn]: (params: CellClassParams) => {
        return (
          params.data.seriesID === i18next.t('TOTAL 2') || !params.data.seriesID
        );
      },
    },
  },
  {
    headerName: i18next.t('Sym.'),
    field: 'seriesID',
    cellClassRules: {
      [Styles.alignRight]: (params: CellClassParams) => {
        return params.data.seriesID === i18next.t('TOTAL 2');
      },
    },
    sortable: true,
    sort: 'asc',
    tooltipValueGetter: tooltipRenderer,
    minWidth: 75,
    maxWidth: 75,
  },
  {
    headerName: i18next.t('Long'),
    minWidth: 65,
    maxWidth: 65,
    field: 'long',
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(params.value, 2, undefined, undefined, '--'),
  },

  {
    headerName: i18next.t('Short'),
    field: 'short',
    minWidth: 65,
    maxWidth: 65,
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(params.value, 2, undefined, undefined, '--'),
  },
  {
    headerName: i18next.t('Market Price'),
    field: 'marketPrice',
    minWidth: 65,
    maxWidth: 65,
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(params.value, 2, undefined, undefined, '--'),
  },
  {
    headerName: i18next.t('P/L'),
    field: 'floatingPL',
    minWidth: 85,
    maxWidth: 85,
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(params.value, 0, undefined, undefined, '--'),
    cellClassRules: {
      [globalStyles.Up]: (params: CellClassParams) => {
        return params.data.floatingPL > 0;
      },
      [globalStyles.Down]: (params: CellClassParams) => {
        return params.data.floatingPL < 0;
      },
      [globalStyles.Default]: (params: CellClassParams) => {
        return params.data.floatingPL === 0;
      },
      [globalStyles.Default]: (params: CellClassParams) => {
        return params.data.floatingPL == null;
      },
    },
    tooltipValueGetter: tooltipRenderer,
  },
];
