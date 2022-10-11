import { IAction } from 'interfaces/common';
import { IQuerySymbolData } from 'interfaces/actions';
import {
  MARKET_QUERY_INDEX_DATA,
  MARKET_QUERY_INDEX_DATA_FAILED,
  MARKET_QUERY_INDEX_DATA_SUCCESS,
  MARKET_QUERY_SYMBOL_DATA,
  MARKET_QUERY_SYMBOL_DATA_FAILED,
  MARKET_QUERY_SYMBOL_DATA_SUCCESS,
  MARKET_QUERY_SYMBOL_ODDLOT,
} from 'redux/actions';
import { SymbolType } from 'constants/enum';

export const querySymbolData = (
  payload: IQuerySymbolData
): IAction<IQuerySymbolData> => ({
  type: MARKET_QUERY_SYMBOL_DATA,
  payload,
  response: {
    success: MARKET_QUERY_SYMBOL_DATA_SUCCESS,
    failed: MARKET_QUERY_SYMBOL_DATA_FAILED,
  },
});

export const queryIndexData = (
  payload: IQuerySymbolData
): IAction<IQuerySymbolData> => ({
  type: MARKET_QUERY_INDEX_DATA,
  payload: {
    ...payload,
    symbolType: SymbolType.INDEX,
  },
  response: {
    success: MARKET_QUERY_INDEX_DATA_SUCCESS,
    failed: MARKET_QUERY_INDEX_DATA_FAILED,
  },
});

export const querySymbolOddlot = (
  payload: Pick<IQuerySymbolData, 'symbolList'>
): IAction<Pick<IQuerySymbolData, 'symbolList'>> => ({
  type: MARKET_QUERY_SYMBOL_ODDLOT,
  payload,
  response: {
    success: MARKET_QUERY_SYMBOL_DATA_SUCCESS,
    failed: MARKET_QUERY_SYMBOL_DATA_FAILED,
  },
});
