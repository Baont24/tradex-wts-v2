import {
  BOARD_INIT_PRICE_BOARD_SUCCESS,
  BOARD_UPDATE_PRICE_BOARD,
} from './actions';
import { IAction, IReducer } from 'interfaces/common';
import { IPriceBoardReducer } from 'interfaces/reducers';
import {
  MARKET_QUERY_INDEX_STOCK_LIST_FAILED,
  MARKET_QUERY_INDEX_STOCK_LIST_SUCCESS,
} from 'redux/actions';
import config from 'config';

const stockBoardDefaultState: IPriceBoardReducer = {
  symbol: [],
  symbolMap: {},
  selectedBoard: config.boardTabs[1],
};

export const PriceBoard: IReducer<
  IPriceBoardReducer,
  Partial<IPriceBoardReducer>
> = (state = stockBoardDefaultState, action) => {
  switch (action.type) {
    case BOARD_INIT_PRICE_BOARD_SUCCESS:
      return action.payload as IPriceBoardReducer;
    case BOARD_UPDATE_PRICE_BOARD:
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
};

export function IndexStockList(
  state: string[] = [],
  action: IAction<string[]>
) {
  switch (action.type) {
    case MARKET_QUERY_INDEX_STOCK_LIST_SUCCESS:
      return action.payload;
    case MARKET_QUERY_INDEX_STOCK_LIST_FAILED:
      return [];
    default:
      return state;
  }
}
