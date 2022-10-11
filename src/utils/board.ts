import {
  CellClassParams,
  ValueFormatterParams,
  ValueGetterParams,
} from 'ag-grid-community';
import { INewSymbolData } from 'interfaces/market';
import { SymbolSession, SymbolType } from 'constants/enum';
import { formatDateToDisplay } from './datetime';
import { formatNumber } from './common';

export interface IStockBoardCellClassParams extends CellClassParams {
  readonly data: INewSymbolData;
  readonly value: number | string | undefined;
}

export interface IStockBoardValueGetterParams extends ValueGetterParams {
  readonly data: INewSymbolData | undefined;
}

export interface IStockBoardValueFormatterParams extends ValueFormatterParams {
  readonly data: INewSymbolData | undefined;
}

export const priceFormatted = (
  value?: number,
  type?: SymbolType,
  offsetRate?: number
) =>
  formatNumber(
    value,
    type === SymbolType.INDEX && (value || 0) >= 1000 ? 1 : 2,
    offsetRate ??
      (type === SymbolType.FUTURES || type === SymbolType.INDEX ? 1 : 1000),
    type !== SymbolType.FUTURES && type !== SymbolType.INDEX,
    ''
  );

export const quantityFormatted = (
  value?: number,
  type?: SymbolType,
  offsetRate?: number
) =>
  formatNumber(
    value,
    0,
    offsetRate ??
      (type === SymbolType.FUTURES || type === SymbolType.INDEX ? 1 : 10),
    false,
    ''
  );

export const tradingValueFormatted = (value?: number) =>
  formatNumber(
    value,
    value != null && value < 1000000 ? 3 : 0,
    1000000,
    false,
    ''
  );

export const priceFormatter = (params: IStockBoardValueFormatterParams) => {
  if (typeof params.value === 'string') {
    return params.value;
  }
  return priceFormatted(params.value, params.data?.t);
};

export const priceFormatterIgnoreZero = (
  params: IStockBoardValueFormatterParams
) => {
  if (typeof params.value === 'string') {
    return params.value;
  } else if (params.value === 0) {
    return '';
  }
  return priceFormatted(params.value, params.data?.t);
};

export const changeFormatter = (params: IStockBoardValueFormatterParams) => {
  if (
    params.data &&
    (params.data.ss === SymbolSession.ATO ||
    params.data.ss === SymbolSession.ATC
      ? params.data.ep
      : params.data.c)
  ) {
    return priceFormatted(params.value, params.data?.t);
  } else {
    return '';
  }
};

export const quantityFormatter = (params: IStockBoardValueFormatterParams) => {
  if (params.value === 0) {
    return '';
  }
  return quantityFormatted(params.value, params.data?.t);
};

export const quantityOddlotFormatter = (
  params: IStockBoardValueFormatterParams
) => {
  if (params.value === 0) {
    return '';
  }
  return quantityFormatted(params.value, SymbolType.INDEX);
};

export const customQuantityFormatter = (offsetRate?: number) => (
  params: IStockBoardValueFormatterParams
) => {
  if (params.value === 0) {
    return '';
  }
  return quantityFormatted(params.value, params.data?.t, offsetRate);
};

export const tradingValueFormatter = (
  params: IStockBoardValueFormatterParams
) => {
  if (params.value === 0) {
    return '';
  }
  return tradingValueFormatted(params.value);
};

export const rateFormatter = (params: IStockBoardValueFormatterParams) => {
  if (
    params.data &&
    (params.data.ss === SymbolSession.ATO ||
    params.data.ss === SymbolSession.ATC
      ? params.data.ep
      : params.data.c)
  ) {
    return formatNumber(params.value, 2, undefined, false, '') + '%';
  } else {
    return '';
  }
};

export const percentageFormatter = (params: IStockBoardValueFormatterParams) =>
  formatNumber(params.value, 2, undefined, false, '');

export const dateFormatter = (params: IStockBoardValueFormatterParams) => {
  const formattedValue = formatDateToDisplay(params.value);
  return formattedValue || '';
};

const closePrice = (ss?: SymbolSession, ep?: number, c?: number) =>
  Number(ss === SymbolSession.ATO || ss === SymbolSession.ATC ? ep : c);

export const closePriceClassRules = {
  Ceil: (params: IStockBoardCellClassParams) =>
    params.data &&
    closePrice(params.data.ss, params.data.ep, params.data.c) ===
      params.data?.ce,
  Floor: (params: IStockBoardCellClassParams) =>
    params.data &&
    closePrice(params.data.ss, params.data.ep, params.data.c) ===
      params.data?.fl,
  Ref: (params: IStockBoardCellClassParams) =>
    params.data &&
    closePrice(params.data.ss, params.data.ep, params.data.c) ===
      params.data?.re,
  Up: (params: IStockBoardCellClassParams) =>
    params.data &&
    closePrice(params.data.ss, params.data.ep, params.data.c) !==
      params.data.ce &&
    closePrice(params.data.ss, params.data.ep, params.data.c) !==
      params.data.fl &&
    closePrice(params.data.ss, params.data.ep, params.data.c) >
      Number(params.data.re),
  Down: (params: IStockBoardCellClassParams) =>
    params.data &&
    closePrice(params.data.ss, params.data.ep, params.data.c) !==
      params.data.ce &&
    closePrice(params.data.ss, params.data.ep, params.data.c) !==
      params.data.fl &&
    closePrice(params.data.ss, params.data.ep, params.data.c) <
      Number(params.data.re),
  Default: (params: IStockBoardCellClassParams) =>
    !(params.data && closePrice(params.data.ss, params.data.ep, params.data.c)),
};

export const closePriceSmallTextClassRules = {
  ...closePriceClassRules,
  SmallText: (params: IStockBoardCellClassParams) =>
    typeof params.value === 'string' && params.value?.length > 5,
};

const indexChange = (params: IStockBoardCellClassParams) =>
  params.data?.ch || 0;

export const indexRules = {
  Up: (params: IStockBoardCellClassParams) => indexChange(params) > 0,
  Down: (params: IStockBoardCellClassParams) => indexChange(params) < 0,
  Ref: (params: IStockBoardCellClassParams) => indexChange(params) === 0,
};

export const baseStockPriceClassRules = {
  Ceil: (params: IStockBoardCellClassParams) =>
    params.data?.bp
      ? closePrice(params.data.bp.ss, params.data.bp.ep, params.data.bp.c) ===
        params.data.bp?.ce
      : false,
  Floor: (params: IStockBoardCellClassParams) =>
    params.data?.bp
      ? closePrice(params.data.bp.ss, params.data.bp.ep, params.data.bp.c) ===
        params.data.bp?.fl
      : false,
  Ref: (params: IStockBoardCellClassParams) =>
    params.data?.bp
      ? closePrice(params.data.bp.ss, params.data.bp.ep, params.data.bp.c) ===
        params.data.bp?.re
      : false,
  Up: (params: IStockBoardCellClassParams) =>
    params.data?.bp
      ? closePrice(params.data.bp.ss, params.data.bp.ep, params.data.bp.c) !==
          params.data.bp.ce &&
        closePrice(params.data.bp.ss, params.data.bp.ep, params.data.bp.c) !==
          params.data.bp.fl &&
        closePrice(params.data.bp.ss, params.data.bp.ep, params.data.bp.c) >
          Number(params.data.bp.re)
      : false,
  Down: (params: IStockBoardCellClassParams) =>
    params.data?.bp
      ? closePrice(params.data.bp.ss, params.data.bp.ep, params.data.bp.c) !==
          params.data.bp.ce &&
        closePrice(params.data.bp.ss, params.data.bp.ep, params.data.bp.c) !==
          params.data.bp.fl &&
        closePrice(params.data.bp.ss, params.data.bp.ep, params.data.bp.c) <
          Number(params.data.bp.re)
      : false,
  Default: (params: IStockBoardCellClassParams) =>
    !(
      params.data?.bp &&
      closePrice(params.data.bp.ss, params.data.bp.ep, params.data.bp.c)
    ),
};

export const valueClassRules = {
  Ceil: 'value === data.ce',
  Floor: 'value === data.fl',
  Ref: 'value === data.re',
  Up: 'value !== data.ce && value !== data.fl && value > data.re',
  Down: 'value !== data.ce && value !== data.fl && value < data.re',
};

export const bidClassRules = (index: number) => ({
  Ceil: `data.bb && data.bb[${index}] && data.bb[${index}].p === data.ce`,
  Floor: `data.bb && data.bb[${index}] && data.bb[${index}].p === data.fl`,
  Ref: `data.bb && data.bb[${index}] && data.bb[${index}].p === data.re`,
  Up: `data.bb && data.bb[${index}] && data.bb[${index}].p !== data.ce && data.bb[${index}].p !== data.fl && data.bb[${index}].p > data.re`,
  Down: `data.bb && data.bb[${index}] && data.bb[${index}].p !== data.ce && data.bb[${index}].p !== data.fl && data.bb[${index}].p < data.re`,
  Default: `data.bb && data.bb[${index}] && data.bb[${index}].p === 0 && data.ss`,
});

export const offerClassRules = (index: number) => ({
  Ceil: `data.bo && data.bo[${index}] && data.bo[${index}].p === data.ce`,
  Floor: `data.bo && data.bo[${index}] && data.bo[${index}].p === data.fl`,
  Ref: `data.bo && data.bo[${index}] && data.bo[${index}].p === data.re`,
  Up: `data.bo && data.bo[${index}] && data.bo[${index}].p !== data.ce && data.bo[${index}].p !== data.fl && data.bo[${index}].p > data.re`,
  Down: `data.bo && data.bo[${index}] && data.bo[${index}].p !== data.ce && data.bo[${index}].p !== data.fl && data.bo[${index}].p < data.re`,
  Default: `data.bo && data.bo[${index}] && data.bo[${index}].p === 0 && data.ss`,
});

export const basisClassRules = {
  Up: (params: IStockBoardCellClassParams) => (params.value || 0) > 0,
  Down: (params: IStockBoardCellClassParams) => (params.value || 0) < 0,
  Ref: (params: IStockBoardCellClassParams) => params.value === 0,
};

export const closePriceGetter = (params: IStockBoardValueGetterParams) =>
  params.data &&
  (params.data.ss === SymbolSession.ATO || params.data.ss === SymbolSession.ATC
    ? params.data.ep
    : params.data.c);

export const baseStockClosePriceGetter = (
  params: IStockBoardValueGetterParams
) =>
  params.data &&
  params.data.bp &&
  (params.data.bp.ss === SymbolSession.ATO ||
  params.data.bp.ss === SymbolSession.ATC
    ? params.data.bp.ep
    : params.data.bp.c);

export const matchVolumeGetter = (params: IStockBoardValueGetterParams) =>
  params.data &&
  (params.data.ss === SymbolSession.ATO || params.data.ss === SymbolSession.ATC
    ? params.data.exv
    : params.data.mv);

export const changePriceGetter = (params: IStockBoardValueGetterParams) =>
  params.data &&
  (params.data.ss === SymbolSession.ATO || params.data.ss === SymbolSession.ATC
    ? params.data.ep
      ? params.data.exc
      : undefined
    : params.data.ch);

export const ratePriceGetter = (params: IStockBoardValueGetterParams) =>
  params.data &&
  (params.data.ss === SymbolSession.ATO || params.data.ss === SymbolSession.ATC
    ? params.data.ep
      ? params.data.exr
      : undefined
    : params.data.ra);

export const pvaPriceGetter = (params: IStockBoardValueGetterParams) =>
  params.data && (params.data.pva ? params.data.pva / 1000000 : 0);

export const pvoPriceGetter = (params: IStockBoardValueGetterParams) =>
  params.data && (params.data.pvo ? params.data.pvo / 10 : 0);
