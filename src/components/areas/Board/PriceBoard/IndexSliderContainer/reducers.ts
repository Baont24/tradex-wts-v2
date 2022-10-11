import { IAction } from 'interfaces/common';
import { INewSymbolData } from 'interfaces/market';
import {
  MARKET_INDEX_SUBSCRIBE_DATA,
  MARKET_QUERY_INDEX_DATA_SUCCESS,
} from 'redux/actions';

export function IndexSliderData(
  state: INewSymbolData[] = [],
  action: IAction<INewSymbolData[]>
) {
  switch (action.type) {
    case MARKET_QUERY_INDEX_DATA_SUCCESS:
      return action.payload;
    default:
      return state;
  }
}

export function NewIndexData(
  state: INewSymbolData | null = null,
  action: IAction<INewSymbolData>
) {
  switch (action.type) {
    case MARKET_INDEX_SUBSCRIBE_DATA:
      return { ...action.payload };
    default:
      return state;
  }
}
