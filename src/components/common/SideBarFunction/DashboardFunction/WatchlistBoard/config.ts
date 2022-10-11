import * as globalStyles from 'styles/style.scss';
import * as styles from './styles.scss';
import { IColDef, IColGroupDef } from 'interfaces/common';
import { INewSymbolData } from 'interfaces/market';
import {
  IStockBoardValueFormatterParams,
  changePriceGetter,
  closePriceClassRules,
  closePriceGetter,
  priceFormatted,
  priceFormatterIgnoreZero,
  quantityFormatter,
} from 'utils/board';
import { ITooltipParams, RowNode } from 'ag-grid-community';
import { Lang, SymbolSession } from 'constants/enum';
import { formatNumber } from 'utils/common';
import SymbolCell from 'components/common/StockBoard/SymbolCell';
import i18next from 'i18next';

export const getColumnDefs = (
  onRemoveRow?: (rowNode: RowNode) => void
): Array<IColGroupDef<INewSymbolData> | IColDef<INewSymbolData>> => [
  {
    field: 's',
    headerName: i18next.t('Symbol'),
    minWidth: 60,
    maxWidth: 70,
    headerClass: globalStyles.Header,
    cellClass: `${globalStyles.Cell} ${styles.Symbol}`,
    cellClassRules: closePriceClassRules,
    cellRendererFramework: SymbolCell,
    suppressSizeToFit: true,
    tooltipValueGetter: symbolTooltips,
    rowDrag: true,
    cellRendererParams: {
      boardKey: 'WATCHLIST',
      onRemoveRow,
    },
  },
  {
    field: 'c',
    headerName: i18next.t('Price'),
    valueGetter: closePriceGetter,
    width: 55,
    headerClass: globalStyles.Header,
    cellClass: `${globalStyles.Cell}`,
    cellClassRules: closePriceClassRules,
    valueFormatter: priceFormatterIgnoreZero,
  },
  {
    field: 'ch',
    headerName: i18next.t('Change'),
    valueGetter: changePriceGetter,
    width: 95,
    headerClass: globalStyles.Header,
    cellClass: `${globalStyles.Cell}`,
    cellClassRules: closePriceClassRules,
    valueFormatter: changeFormatter,
  },
  {
    field: 'vo',
    headerName: i18next.t('T.Vol'),
    width: 70,
    headerClass: globalStyles.Header,
    cellClass: `${globalStyles.Cell}`,
    valueFormatter: quantityFormatter,
  },
];

const changeFormatter = (params: IStockBoardValueFormatterParams) => {
  if (
    params.data &&
    (params.data.ss === SymbolSession.ATO ||
    params.data.ss === SymbolSession.ATC
      ? params.data.ep
      : params.data.c)
  ) {
    return `${priceFormatted(params.value, params.data?.t)} (${
      formatNumber(params.data?.ra, 2, undefined, false, '0') + '%'
    })`;
  } else {
    return '';
  }
};

const symbolTooltips = (params: ITooltipParams) =>
  (i18next.language === Lang.VI
    ? (params.data as INewSymbolData).n1
    : (params.data as INewSymbolData).n2) || params.valueFormatted;
