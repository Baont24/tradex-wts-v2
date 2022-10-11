import * as globalStyles from 'styles/style.scss';
import {
  CellClassParams,
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
import PortfolioBtnCell from 'components/areas/Account/Portfolio/PortfolioBtnCell';
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

export const getColumnDefsEquity = (): Array<
  | IColGroupDef<IEquityEnquiryPortfolioBeanItemResponse>
  | IColDef<IEquityEnquiryPortfolioBeanItemResponse>
> => [
  {
    headerName: '',
    cellRendererFramework: PortfolioBtnCell,
    minWidth: 52,
    maxWidth: 52,
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
    colSpan: (params: ColSpanParams) => {
      if (params.data.symbol === i18next.t('TOTAL 2')) {
        return 3;
      } else {
        return 1;
      }
    },
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
    headerName: i18next.t('Unrealized P/L (Value/%)'),
    minWidth: 155,
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
