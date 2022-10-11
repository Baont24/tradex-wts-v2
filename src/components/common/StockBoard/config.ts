import * as _ from 'lodash';
import * as classNames from 'classnames';
import * as styles from './styles.scss';
import { BoardKey, IColDef, IColGroupDef } from 'interfaces/common';
import {
  CellDoubleClickedEvent,
  ColDef,
  ColGroupDef,
  ITooltipParams,
  RowNode,
} from 'ag-grid-community';
import { INewSymbolData } from 'interfaces/market';
import { Lang, SpeedOrderClickType } from 'constants/enum';
import { ToggleGroupHeader, ToggleHeader } from 'components/common';
import {
  baseStockClosePriceGetter,
  baseStockPriceClassRules,
  basisClassRules,
  bidClassRules,
  changeFormatter,
  changePriceGetter,
  closePriceClassRules,
  closePriceGetter,
  closePriceSmallTextClassRules,
  dateFormatter,
  matchVolumeGetter,
  offerClassRules,
  percentageFormatter,
  priceFormatter,
  priceFormatterIgnoreZero,
  pvaPriceGetter,
  pvoPriceGetter,
  quantityFormatter,
  quantityOddlotFormatter,
  rateFormatter,
  ratePriceGetter,
  tradingValueFormatter,
  valueClassRules,
} from 'utils/board';
import { domainConfig } from 'config/domain';
import SymbolCell from './SymbolCell';
import config from 'config';
import i18next from 'i18next';
import store from 'redux/store';

const HEADER_MAX_WIDTH = 500;
const HEADER_MIN_WIDTH = 40;
const PRICE_CELL_MIN_WIDTH = 54;
const QUANTITY_CELL_MIN_WIDTH = 70;

export const DEFAULT_COL_DEF: ColDef = {
  minWidth: HEADER_MIN_WIDTH,
  headerClass: styles.Header,
  maxWidth: HEADER_MAX_WIDTH,
  cellClass: styles.Cell,
  menuTabs: [],
  sortable: true,
  lockPinned: true,
};

export const DEFAULT_COL_GROUP_DEF: ColGroupDef = {
  children: [],
  marryChildren: true,
};

const generateWidth = (
  key: BoardKey,
  hose: number,
  hnx: number,
  oddLot: number,
  cw: number,
  future: number,
  others: number
) =>
  key === 'HOSE'
    ? hose
    : key === 'HNX' || key === 'UPCOM'
    ? hnx
    : key === 'Oddlot'
    ? oddLot
    : key === 'CW'
    ? cw
    : key === 'FUTURES'
    ? future
    : others;

const symbolInfoTooltip = (params: ITooltipParams) =>
  i18next.language === Lang.VI
    ? (params.data as INewSymbolData)?.n1 || ''
    : (params.data as INewSymbolData)?.n2 || '';

const generateBidAskCol = (
  index: number,
  type: 'Bid' | 'Ask',
  hide?: boolean,
  isOddLot?: boolean,
  onCellDoubleClicked?: (params: CellDoubleClickedEvent) => void,
  priceTooltip?: () => string
): {
  readonly price: IColDef<INewSymbolData>;
  readonly vol: IColDef<INewSymbolData>;
} =>
  type === 'Bid'
    ? {
        price: {
          colId: `bb-p${index + 1}`,
          headerName: i18next.t(`Prc ${index + 1}`),
          field: 'bb',
          valueGetter: `data.bb && data.bb[${index}] && (data.bb[${index}].v ? (data.bb[${index}].p ? data.bb[${index}].p : data.ss) : null)`,
          minWidth: 46,
          maxWidth: HEADER_MAX_WIDTH,
          headerClass: `${styles.GroupHeader} ${styles.Header}`,
          headerTooltip: i18next.t('Drag and drop to move column'),
          valueFormatter: priceFormatter,
          cellClassRules: valueClassRules,
          onCellDoubleClicked,
          tooltipValueGetter: priceTooltip,
          hide,
        },
        vol: {
          colId: `bb-v${index + 1}`,
          headerName: i18next.t(`Vol ${index + 1}`),
          field: 'bb',
          valueGetter: `data.bb && data.bb[${index}] && data.bb[${index}].v`,
          minWidth: 46,
          maxWidth: HEADER_MAX_WIDTH,
          headerClass: `${styles.GroupHeader} ${styles.Header}`,
          cellClassRules: bidClassRules(index),
          headerTooltip: i18next.t('Drag and drop to move column'),
          valueFormatter: isOddLot
            ? quantityOddlotFormatter
            : quantityFormatter,
          hide,
        },
      }
    : {
        price: {
          colId: `bo-p${index + 1}`,
          headerName: i18next.t(`Prc ${index + 1}`),
          field: 'bo',
          valueGetter: `data.bo && data.bo[${index}] && (data.bo[${index}].v ? (data.bo[${index}].p ? data.bo[${index}].p : data.ss) : null)`,
          minWidth: 46,
          maxWidth: HEADER_MAX_WIDTH,
          headerClass: `${styles.GroupHeader} ${styles.Header}`,
          headerTooltip: i18next.t('Drag and drop to move column'),
          valueFormatter: priceFormatter,
          cellClassRules: valueClassRules,
          onCellDoubleClicked,
          tooltipValueGetter: priceTooltip,
          hide,
        },
        vol: {
          colId: `bo-v${index + 1}`,
          headerName: i18next.t(`Vol ${index + 1}`),
          field: 'bo',
          valueGetter: `data.bo && data.bo[${index}] && data.bo[${index}].v`,
          minWidth: 46,
          maxWidth: HEADER_MAX_WIDTH,
          headerClass: `${styles.GroupHeader} ${styles.Header}`,
          headerTooltip: i18next.t('Drag and drop to move column'),
          valueFormatter: isOddLot
            ? quantityOddlotFormatter
            : quantityFormatter,
          cellClassRules: offerClassRules(index),
          hide,
        },
      };

export const getColumnDefs = (
  key: BoardKey,
  onRemoveRow?: (rowNode: RowNode) => void,
  onShowSymbolInfo?: (
    data: INewSymbolData,
    clickType: SpeedOrderClickType
  ) => void,
  onPinRow?: (node: RowNode) => void,
  onUnpinRow?: (node: RowNode) => void,
  onCellDoubleClicked?: (params: CellDoubleClickedEvent) => void
): Array<IColGroupDef<INewSymbolData> | IColDef<INewSymbolData>> => {
  const isOddlot = key === 'Oddlot';
  const priceTooltip = () =>
    store.getState().isAuthenticated
      ? i18next.t('Double click to place order')
      : '';

  return [
    {
      colId: 's',
      field: 's',
      headerName: i18next.t('Symbols'),
      // pinned: 'left',
      cellClass: `${styles.Cell} ${styles.Symbols}`,
      cellClassRules:
        key === 'HOSE' || key === 'CW' || key === 'ETF'
          ? closePriceSmallTextClassRules
          : closePriceClassRules,
      minWidth: generateWidth(key, 68, 50, 50, 68, 76, 76),
      cellRendererFramework: SymbolCell,
      // suppressMovable: true,
      // suppressSizeToFit: true,
      rowDrag: key === 'WATCHLIST',
      tooltipValueGetter: symbolInfoTooltip,
      cellRendererParams: {
        boardKey: key,
        onRemoveRow,
        onShowSymbolInfo,
        onPinRow,
        onUnpinRow,
      },
    },
    {
      colId: 'ce',
      field: 'ce',
      headerName: i18next.t('Ceil'),
      headerClass: `${styles.Header} ${styles.Highlight}`,
      cellClass: `${styles.Cell} ${styles.Ceil} ${styles.Highlight}`,
      // suppressSizeToFit: true,
      valueFormatter: priceFormatter,
      onCellDoubleClicked,
      tooltipValueGetter: priceTooltip,
      headerTooltip: i18next.t('Drag and drop to move column'),
      minWidth: generateWidth(key, 46, 46, 48, 45, 46, 46),
    },
    {
      colId: 'fl',
      field: 'fl',
      headerName: i18next.t('Floor'),
      headerClass: `${styles.Header} ${styles.Highlight}`,
      cellClass: `${styles.Cell} ${styles.Floor} ${styles.Highlight}`,
      minWidth: generateWidth(key, 46, 46, 48, 45, 46, 46),
      // suppressSizeToFit: true,
      valueFormatter: priceFormatter,
      onCellDoubleClicked,
      tooltipValueGetter: priceTooltip,
      headerTooltip: i18next.t('Drag and drop to move column'),
    },
    {
      colId: 're',
      field: 're',
      headerName: i18next.t('Ref'),
      headerClass: `${styles.Header} ${styles.Highlight}`,
      cellClass: `${styles.Cell} ${styles.Ref} ${styles.Highlight}`,
      minWidth: generateWidth(key, 46, 46, 48, 45, 46, 46),
      // suppressSizeToFit: true,
      valueFormatter: priceFormatter,
      onCellDoubleClicked,
      tooltipValueGetter: priceTooltip,
      headerTooltip: i18next.t('Drag and drop to move column'),
    },
    {
      headerName: i18next.t('Trading'),
      headerGroupComponentFramework: ToggleGroupHeader,
      headerGroupComponentParams: {
        staticHeader: false,
      },
      headerClass: styles.ShowOnlyToggleGroupHeader,
      sortable: true,
      children: [
        {
          headerName: i18next.t('Total Volume'),
          field: 'vo',
          colId: 'vo',
          headerClass: `${styles.NoGroupHeader}`,
          valueFormatter: quantityFormatter,
          columnGroupShow: 'closed',
          minWidth: generateWidth(key, 62, 62, 64, 54, 62, 62),
          headerTooltip: i18next.t('Drag and drop to move column'),
        },
        {
          headerName: `${i18next.t('Total Value')} (${i18next.t('mils')})`,
          field: 'va',
          colId: 'va',
          headerClass: `${styles.NoGroupHeader}`,
          valueFormatter: tradingValueFormatter,
          columnGroupShow: 'open',
          minWidth: generateWidth(key, 62, 62, 64, 54, 62, 62),
          headerTooltip: i18next.t('Drag and drop to move column'),
        },
      ],
    },
    {
      headerName: i18next.t('Bid'),
      headerClass: `${styles.GroupHeader} ${styles.Header}`,
      children: [
        generateBidAskCol(
          9,
          'Bid',
          true,
          isOddlot,
          onCellDoubleClicked,
          priceTooltip
        ).price,
        generateBidAskCol(
          9,
          'Bid',
          true,
          isOddlot,
          onCellDoubleClicked,
          priceTooltip
        ).vol,
        generateBidAskCol(
          8,
          'Bid',
          true,
          isOddlot,
          onCellDoubleClicked,
          priceTooltip
        ).price,
        generateBidAskCol(
          8,
          'Bid',
          true,
          isOddlot,
          onCellDoubleClicked,
          priceTooltip
        ).vol,
        generateBidAskCol(
          7,
          'Bid',
          true,
          isOddlot,
          onCellDoubleClicked,
          priceTooltip
        ).price,
        generateBidAskCol(
          7,
          'Bid',
          true,
          isOddlot,
          onCellDoubleClicked,
          priceTooltip
        ).vol,
        generateBidAskCol(
          6,
          'Bid',
          true,
          isOddlot,
          onCellDoubleClicked,
          priceTooltip
        ).price,
        generateBidAskCol(
          6,
          'Bid',
          true,
          isOddlot,
          onCellDoubleClicked,
          priceTooltip
        ).vol,
        generateBidAskCol(
          5,
          'Bid',
          true,
          isOddlot,
          onCellDoubleClicked,
          priceTooltip
        ).price,
        generateBidAskCol(
          5,
          'Bid',
          true,
          isOddlot,
          onCellDoubleClicked,
          priceTooltip
        ).vol,
        generateBidAskCol(
          4,
          'Bid',
          true,
          isOddlot,
          onCellDoubleClicked,
          priceTooltip
        ).price,
        generateBidAskCol(
          4,
          'Bid',
          true,
          isOddlot,
          onCellDoubleClicked,
          priceTooltip
        ).vol,
        generateBidAskCol(
          3,
          'Bid',
          true,
          isOddlot,
          onCellDoubleClicked,
          priceTooltip
        ).price,
        generateBidAskCol(
          3,
          'Bid',
          true,
          isOddlot,
          onCellDoubleClicked,
          priceTooltip
        ).vol,
        generateBidAskCol(
          2,
          'Bid',
          false,
          isOddlot,
          onCellDoubleClicked,
          priceTooltip
        ).price,
        generateBidAskCol(
          2,
          'Bid',
          false,
          isOddlot,
          onCellDoubleClicked,
          priceTooltip
        ).vol,
        generateBidAskCol(
          1,
          'Bid',
          false,
          isOddlot,
          onCellDoubleClicked,
          priceTooltip
        ).price,
        generateBidAskCol(
          1,
          'Bid',
          false,
          isOddlot,
          onCellDoubleClicked,
          priceTooltip
        ).vol,
        generateBidAskCol(
          0,
          'Bid',
          false,
          isOddlot,
          onCellDoubleClicked,
          priceTooltip
        ).price,
        generateBidAskCol(
          0,
          'Bid',
          false,
          isOddlot,
          onCellDoubleClicked,
          priceTooltip
        ).vol,
      ],
    },
    {
      headerName: i18next.t('Matched'),
      headerClass: `${styles.HasGroupHeader} ${styles.HideGroupIcon} ${styles.GroupHeader} ${styles.Header} ${styles.Highlight}`,
      marryChildren: true,
      children: [
        {
          colId: 'c',
          field: 'c',
          headerName: i18next.t('Price'),
          valueGetter: closePriceGetter,
          minWidth: generateWidth(key, 46, 46, 46, 45, 46, 46),
          headerClass: `${styles.GroupHeader} ${styles.Header} ${styles.Highlight}`,
          headerTooltip: i18next.t('Drag and drop to move column'),
          cellClass: `${styles.Highlight} ${styles.Cell}`,
          valueFormatter: priceFormatterIgnoreZero,
          cellClassRules: closePriceClassRules,
          onCellDoubleClicked,
          tooltipValueGetter: priceTooltip,
        },
        {
          colId: 'mv',
          field: 'mv',
          headerName: i18next.t('Vol'),
          valueGetter: matchVolumeGetter,
          headerClass: `${styles.GroupHeader} ${styles.Header} ${styles.Highlight}`,
          headerTooltip: i18next.t('Drag and drop to move column'),
          cellClass: `${styles.Highlight} ${styles.Cell}`,
          valueFormatter: quantityFormatter,
          cellClassRules: closePriceClassRules,
          minWidth: generateWidth(key, 54, 54, 56, 46, 43, 54),
        },
        {
          colId: 'ch',
          field: 'ch',
          headerName: '+/-',
          valueGetter: changePriceGetter,
          columnGroupShow: 'closed',
          headerComponentFramework: ToggleHeader,
          headerClass: `${styles.HasGroupHeader} ${styles.Highlight} ${styles.Cell}`,
          headerTooltip: i18next.t('Drag and drop to move column'),
          cellClass: `${styles.Highlight} ${styles.Cell}`,
          valueFormatter: changeFormatter,
          cellClassRules: closePriceClassRules,
          minWidth: generateWidth(key, 50, 50, 52, 54, 44, 50),
        },
        {
          colId: 'ra',
          field: 'ra',
          headerName: '%',
          valueGetter: ratePriceGetter,
          columnGroupShow: 'open',
          headerComponentFramework: ToggleHeader,
          headerClass: `${styles.HasGroupHeader} ${styles.HasGroupHeader} ${styles.Highlight} ${styles.Cell}`,
          headerTooltip: i18next.t('Drag and drop to move column'),
          cellClass: `${styles.Highlight} ${styles.Cell}`,
          valueFormatter: rateFormatter,
          cellClassRules: closePriceClassRules,
          minWidth: generateWidth(key, 50, 50, 52, 54, 44, 50),
        },
      ],
    },
    {
      headerName: i18next.t('Ask'),
      headerClass: `${styles.GroupHeader} ${styles.Header}`,
      children: [
        generateBidAskCol(
          0,
          'Ask',
          false,
          isOddlot,
          onCellDoubleClicked,
          priceTooltip
        ).price,
        generateBidAskCol(
          0,
          'Ask',
          false,
          isOddlot,
          onCellDoubleClicked,
          priceTooltip
        ).vol,
        generateBidAskCol(
          1,
          'Ask',
          false,
          isOddlot,
          onCellDoubleClicked,
          priceTooltip
        ).price,
        generateBidAskCol(
          1,
          'Ask',
          false,
          isOddlot,
          onCellDoubleClicked,
          priceTooltip
        ).vol,
        generateBidAskCol(
          2,
          'Ask',
          false,
          isOddlot,
          onCellDoubleClicked,
          priceTooltip
        ).price,
        generateBidAskCol(
          2,
          'Ask',
          false,
          isOddlot,
          onCellDoubleClicked,
          priceTooltip
        ).vol,
        generateBidAskCol(
          3,
          'Ask',
          true,
          isOddlot,
          onCellDoubleClicked,
          priceTooltip
        ).price,
        generateBidAskCol(
          3,
          'Ask',
          true,
          isOddlot,
          onCellDoubleClicked,
          priceTooltip
        ).vol,
        generateBidAskCol(
          4,
          'Ask',
          true,
          isOddlot,
          onCellDoubleClicked,
          priceTooltip
        ).price,
        generateBidAskCol(
          4,
          'Ask',
          true,
          isOddlot,
          onCellDoubleClicked,
          priceTooltip
        ).vol,
        generateBidAskCol(
          5,
          'Ask',
          true,
          isOddlot,
          onCellDoubleClicked,
          priceTooltip
        ).price,
        generateBidAskCol(
          5,
          'Ask',
          true,
          isOddlot,
          onCellDoubleClicked,
          priceTooltip
        ).vol,
        generateBidAskCol(
          6,
          'Ask',
          true,
          isOddlot,
          onCellDoubleClicked,
          priceTooltip
        ).price,
        generateBidAskCol(
          6,
          'Ask',
          true,
          isOddlot,
          onCellDoubleClicked,
          priceTooltip
        ).vol,
        generateBidAskCol(
          7,
          'Ask',
          true,
          isOddlot,
          onCellDoubleClicked,
          priceTooltip
        ).price,
        generateBidAskCol(
          7,
          'Ask',
          true,
          isOddlot,
          onCellDoubleClicked,
          priceTooltip
        ).vol,
        generateBidAskCol(
          8,
          'Ask',
          true,
          isOddlot,
          onCellDoubleClicked,
          priceTooltip
        ).price,
        generateBidAskCol(
          8,
          'Ask',
          true,
          isOddlot,
          onCellDoubleClicked,
          priceTooltip
        ).vol,
        generateBidAskCol(
          9,
          'Ask',
          true,
          isOddlot,
          onCellDoubleClicked,
          priceTooltip
        ).price,
        generateBidAskCol(
          9,
          'Ask',
          true,
          isOddlot,
          onCellDoubleClicked,
          priceTooltip
        ).vol,
      ],
    },
    {
      headerName: i18next.t('Prices'),
      headerClass: `${styles.GroupHeader} ${styles.Header} ${styles.Highlight}`,
      children: [
        {
          colId: 'h',
          field: 'h',
          headerName: i18next.t('High'),
          headerClass: `${styles.GroupHeader} ${styles.Header} ${styles.Highlight}`,
          headerTooltip: i18next.t('Drag and drop to move column'),
          // suppressSizeToFit: true,
          cellClass: `${styles.Cell} ${styles.Highlight}`,
          valueFormatter: priceFormatterIgnoreZero,
          cellClassRules: valueClassRules,
          onCellDoubleClicked,
          tooltipValueGetter: priceTooltip,
          minWidth: generateWidth(key, 46, 46, 46, 45, 46, 46),
        },
        {
          colId: 'a',
          field: 'a',
          headerName: i18next.t('Avg'),
          headerClass: `${styles.GroupHeader} ${styles.Header} ${styles.Highlight}`,
          headerTooltip: i18next.t('Drag and drop to move column'),
          // suppressSizeToFit: true,
          cellClass: `${styles.Cell} ${styles.Highlight}`,
          valueFormatter: priceFormatterIgnoreZero,
          cellClassRules: valueClassRules,
          onCellDoubleClicked,
          tooltipValueGetter: priceTooltip,
          minWidth: generateWidth(key, 46, 46, 46, 45, 46, 46),
        },
        {
          colId: 'l',
          field: 'l',
          headerName: i18next.t('Low'),
          headerClass: `${styles.GroupHeader} ${styles.Header} ${styles.Highlight}`,
          headerTooltip: i18next.t('Drag and drop to move column'),
          // suppressSizeToFit: true,
          cellClass: `${styles.Cell} ${styles.Highlight}`,
          valueFormatter: priceFormatterIgnoreZero,
          cellClassRules: valueClassRules,
          onCellDoubleClicked,
          tooltipValueGetter: priceTooltip,
          minWidth: generateWidth(key, 46, 46, 46, 45, 46, 46),
        },
      ],
    },
    {
      headerName: i18next.t('Total'),
      headerGroupComponentFramework: ToggleGroupHeader,
      headerGroupComponentParams: {
        staticHeader: false,
      },
      headerClass: styles.ShowOnlyToggleGroupHeader,
      sortable: true,
      children: [
        {
          headerName: i18next.t('Total PT Vol'),
          field: 'pvo',
          colId: 'pvo',
          headerClass: `${styles.NoGroupHeader}`,
          valueGetter: pvoPriceGetter,
          valueFormatter: quantityFormatter,
          columnGroupShow: 'closed',
          minWidth: QUANTITY_CELL_MIN_WIDTH + 25,
          maxWidth: QUANTITY_CELL_MIN_WIDTH + 25,
          headerTooltip: i18next.t('Drag and drop to move column'),
          hide: domainConfig[config.domain]?.hideTotalColumn as boolean,
        },
        {
          headerName: `${i18next.t('Total PT Value')} (${i18next.t('mils')})`,
          field: 'pva',
          colId: 'pva',
          headerClass: `${styles.NoGroupHeader}`,
          valueGetter: pvaPriceGetter,
          valueFormatter: tradingValueFormatter,
          columnGroupShow: 'open',
          minWidth: QUANTITY_CELL_MIN_WIDTH + 25,
          maxWidth: QUANTITY_CELL_MIN_WIDTH + 25,
          headerTooltip: i18next.t('Drag and drop to move column'),
          hide: domainConfig[config.domain]?.hideTotalColumn as boolean,
        },
      ],
    },
    {
      headerName: i18next.t('Foreign'),
      headerGroupComponentFramework: ToggleGroupHeader,
      headerGroupComponentParams: {
        iconHeader:
          key !== 'FUTURES' &&
          key !== 'HOSE' &&
          key !== 'Oddlot' &&
          key !== 'ETF',
      },
      headerClass: `${styles.HasToggleGroupHeader} ${
        styles.Header
      } ${classNames({
        [styles.Highlight]:
          (domainConfig[config.domain]?.hideTotalColumn as boolean) === false,
      })}`,
      children: [
        {
          colId: 'fr-bvol',
          field: 'fr',
          headerName: i18next.t('Bought'),
          headerTooltip: i18next.t('Drag and drop to move column'),
          valueGetter: 'data.fr && data.fr.bv',
          minWidth: generateWidth(key, 54, 54, 56, 45, 45, 54),
          columnGroupShow: 'closed',
          headerClass: classNames(styles.GroupHeader, styles.Header, {
            [styles.Highlight]:
              (domainConfig[config.domain]?.hideTotalColumn as boolean) ===
              false,
          }),
          cellClass: classNames(styles.Cell, {
            [styles.Highlight]:
              (domainConfig[config.domain]?.hideTotalColumn as boolean) ===
              false,
          }),
          valueFormatter: quantityFormatter,
          hide: key === 'CW',
        },
        {
          colId: 'fr-bval',
          field: 'fr',
          headerName: i18next.t('Bought'),
          headerTooltip: i18next.t('Drag and drop to move column'),
          valueGetter: 'data.fr && data.fr.bv',
          minWidth: generateWidth(key, 54, 54, 56, 45, 45, 54),
          headerClass: classNames(styles.GroupHeader, styles.Header, {
            [styles.Highlight]:
              (domainConfig[config.domain]?.hideTotalColumn as boolean) ===
              false,
          }),
          cellClass: classNames(styles.Cell, {
            [styles.Highlight]:
              (domainConfig[config.domain]?.hideTotalColumn as boolean) ===
              false,
          }),
          valueFormatter: quantityFormatter,
          hide: true,
        },
        {
          colId: 'fr-svol',
          field: 'fr',
          headerName: i18next.t('Sold'),
          headerTooltip: i18next.t('Drag and drop to move column'),
          valueGetter: 'data.fr && data.fr.sv',
          minWidth: generateWidth(key, 54, 54, 56, 45, 45, 54),
          columnGroupShow: 'closed',
          headerClass: classNames(styles.GroupHeader, styles.Header, {
            [styles.Highlight]:
              (domainConfig[config.domain]?.hideTotalColumn as boolean) ===
              false,
          }),
          cellClass: classNames(styles.Cell, {
            [styles.Highlight]:
              (domainConfig[config.domain]?.hideTotalColumn as boolean) ===
              false,
          }),
          valueFormatter: quantityFormatter,
          hide: key === 'CW',
        },
        {
          colId: 'fr-sval',
          field: 'fr',
          headerName: i18next.t('Sold'),
          headerTooltip: i18next.t('Drag and drop to move column'),
          valueGetter: 'data.fr && data.fr.sv',
          minWidth: generateWidth(key, 54, 54, 56, 45, 45, 54),
          headerClass: classNames(styles.GroupHeader, styles.Header, {
            [styles.Highlight]:
              (domainConfig[config.domain]?.hideTotalColumn as boolean) ===
              false,
          }),
          cellClass: classNames(styles.Cell, {
            [styles.Highlight]:
              (domainConfig[config.domain]?.hideTotalColumn as boolean) ===
              false,
          }),
          valueFormatter: quantityFormatter,
          hide: true,
        },
        {
          colId: 'fr-cr',
          field: 'fr',
          headerName: i18next.t('Room'),
          headerTooltip: i18next.t('Drag and drop to move column'),
          valueGetter: 'data.fr && data.fr.cr',
          headerClass: classNames(styles.GroupHeader, styles.Header, {
            [styles.Highlight]:
              (domainConfig[config.domain]?.hideTotalColumn as boolean) ===
              false,
          }),
          cellClass: classNames(styles.Cell, {
            [styles.Highlight]:
              (domainConfig[config.domain]?.hideTotalColumn as boolean) ===
              false,
          }),
          minWidth: generateWidth(key, 80, 54, 80, 46, 74, 80),
          columnGroupShow:
            key === 'HOSE' || key === 'ETF' || key === 'Oddlot'
              ? 'closed'
              : 'open',
          valueFormatter: quantityFormatter,
          hide: key === 'CW',
        },
      ],
    },
    {
      headerName: i18next.t(
        domainConfig[config.domain]?.headerNameRemain as string
      ),
      headerClass: `${styles.GroupHeader} ${styles.Header}`,
      children: [
        {
          colId: 'tb',
          field: 'tb',
          headerName: i18next.t('Buy'),
          headerTooltip: i18next.t('Drag and drop to move column'),
          minWidth: 54,
          headerClass: `${styles.GroupHeader} ${styles.Header} ${styles.Highlight}`,
          cellClass: `${styles.Cell} ${styles.Highlight}`,
          valueFormatter: quantityFormatter,
          hide:
            key === 'CW' ||
            key === 'FUTURES' ||
            key === 'HOSE' ||
            key === 'ETF' ||
            key === 'Oddlot',
        },
        {
          colId: 'to',
          field: 'to',
          headerName: i18next.t('Sell'),
          headerTooltip: i18next.t('Drag and drop to move column'),
          minWidth: 54,
          headerClass: `${styles.GroupHeader} ${styles.Header} ${styles.Highlight}`,
          cellClass: `${styles.Cell} ${styles.Highlight}`,
          valueFormatter: quantityFormatter,
          hide:
            key === 'CW' ||
            key === 'FUTURES' ||
            key === 'HOSE' ||
            key === 'ETF' ||
            key === 'Oddlot',
        },
      ],
    },
    {
      colId: 'cas',
      headerName: i18next.t('CA Status'),
      headerTooltip: i18next.t('Drag and drop to move column'),
      hide: true,
    },
    {
      colId: 'ts',
      headerName: i18next.t('Trading Status'),
      headerTooltip: i18next.t('Drag and drop to move column'),
      hide: true,
    },
    {
      colId: 'md',
      field: 'md',
      headerName: i18next.t('Expire Date'),
      headerTooltip: i18next.t('Drag and drop to move column'),
      valueFormatter: dateFormatter,
      hide: key !== 'FUTURES',
      maxWidth: 74,
      minWidth: 74,
    },
    {
      colId: 'basis',
      field: 'ba',
      headerName: i18next.t('Basis'),
      headerTooltip: i18next.t('Drag and drop to move column'),
      // hide: key !== 'Watchlist' && key !== 'CW' && key !== 'FUTURES',
      valueFormatter: priceFormatter,
      cellClassRules: basisClassRules,
      minWidth: 45,
      hide: key !== 'FUTURES',
    },
    {
      colId: 'exc',
      headerName: i18next.t('Exchg'),
      headerTooltip: i18next.t('Drag and drop to move column'),
      hide: true,
    },
    {
      colId: 'open',
      headerName: i18next.t('Open'),
      headerTooltip: i18next.t('Drag and drop to move column'),
      hide: true,
    },
    {
      colId: 'oi',
      field: 'oi',
      headerName: i18next.t('OI'),
      valueFormatter: quantityFormatter,
      headerTooltip: i18next.t('Drag and drop to move column'),
      minWidth: 52,
      hide: key !== 'FUTURES',
    },
    {
      colId: 'sett',
      headerName: i18next.t('Sett'),
      headerTooltip: i18next.t('Drag and drop to move column'),
      // hide: key !== 'Watchlist' && key !== 'CW',
      hide: true,
    },
    {
      colId: 'si',
      headerName: i18next.t('Shares Issued'),
      headerTooltip: i18next.t('Drag and drop to move column'),
      hide: true,
    },
    {
      colId: 'tp',
      headerName: i18next.t('TP'),
      headerTooltip: i18next.t('Drag and drop to move column'),
      hide: true,
    },
    {
      headerName: i18next.t('Underlying'),
      headerClass: `${styles.GroupHeader} ${styles.Header}`,
      children: [
        {
          field: 'b',
          colId: 'b',
          headerName: i18next.t('Stock'),
          headerClass: `${styles.GroupHeader} ${styles.Header}`,
          headerTooltip: i18next.t('Drag and drop to move column'),
          hide: key !== 'CW',
          cellClass: `${styles.Cell} ${styles.TextAlign}`,
          maxWidth: HEADER_MAX_WIDTH,
          minWidth: 45,
          cellClassRules: baseStockPriceClassRules,
        },
        {
          field: 'bp',
          colId: 'bp',
          valueGetter: baseStockClosePriceGetter,
          headerName: i18next.t('Price'),
          headerClass: `${styles.GroupHeader} ${styles.Header}`,
          headerTooltip: i18next.t('Drag and drop to move column'),
          hide: key !== 'CW',
          maxWidth: HEADER_MAX_WIDTH,
          minWidth: 46,
          valueFormatter: priceFormatterIgnoreZero,
          cellClassRules: baseStockPriceClassRules,
        },
      ],
    },
    {
      colId: 'exp',
      field: 'exp',
      headerName: i18next.t('Strike'),
      headerTooltip: i18next.t('Drag and drop to move column'),
      hide: key !== 'CW',
      minWidth: PRICE_CELL_MIN_WIDTH,
      valueFormatter: priceFormatter,
    },
    {
      colId: 'er',
      field: 'er',
      headerName: i18next.t('C/R'),
      headerTooltip: i18next.t('Drag and drop to move column'),
      cellClass: `${styles.Cell} ${styles.TextAlign}`,
      hide: key !== 'CW',
      minWidth: QUANTITY_CELL_MIN_WIDTH,
    },
    {
      colId: 'be',
      field: 'be',
      minWidth: 55,
      maxWidth: 55,
      headerName: i18next.t('Break'),
      headerTooltip: i18next.t('Drag and drop to move column'),
      valueFormatter: priceFormatterIgnoreZero,
      hide: key !== 'CW',
    },
    {
      colId: 'is',
      field: 'is',
      headerName: i18next.t('Issuer'),
      headerTooltip: i18next.t('Drag and drop to move column'),
      cellClass: `${styles.Cell} ${styles.TextAlign}`,
      minWidth: 44,
      hide: key !== 'CW',
    },
    {
      field: 'ltd',
      colId: 'ltd',
      headerName: i18next.t('Last TD'),
      headerTooltip: i18next.t('Drag and drop to move column'),
      hide: key !== 'CW',
      cellClass: `${styles.Cell} ${styles.TextAlign}`,
      valueFormatter: dateFormatter,
      maxWidth: 75,
      minWidth: 75,
    },
    {
      colId: 'pe',
      field: 'pe',
      headerName: i18next.t('% Premium'),
      headerTooltip: i18next.t('Drag and drop to move column'),
      valueFormatter: percentageFormatter,
      hide: !store.getState().isDebugging || key !== 'CW',
    },
    {
      colId: 'eg',
      headerName: i18next.t('Gea'),
      headerTooltip: i18next.t('Drag and drop to move column'),
      hide: true,
    },
    {
      colId: 'iv',
      headerName: i18next.t('I/V'),
      headerTooltip: i18next.t('Drag and drop to move column'),
      hide: true,
    },
    {
      colId: 'del',
      headerName: i18next.t('Delta'),
      headerTooltip: i18next.t('Drag and drop to move column'),
      hide: true,
    },
  ];
};
