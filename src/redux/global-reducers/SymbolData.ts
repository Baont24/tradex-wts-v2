import {
  IAction,
  IQueryReducer,
  IReducer,
  IReducerState,
} from 'interfaces/common';
import {
  IIndexBoardData,
  INewSymbolData,
  ISymbolList,
} from 'interfaces/market';
import {
  MARKET_INDEX_SUBSCRIBE_DATA,
  MARKET_QUERY_INDEX_DATA,
  MARKET_QUERY_INDEX_DATA_FAILED,
  MARKET_QUERY_INDEX_DATA_SUCCESS,
  MARKET_QUERY_SYMBOL_DATA,
  MARKET_QUERY_SYMBOL_DATA_FAILED,
  MARKET_QUERY_SYMBOL_DATA_SUCCESS,
  MARKET_QUERY_SYMBOL_ODDLOT,
  MARKET_QUERY_SYMBOL_ODDLOT_FAILED,
  MARKET_QUERY_SYMBOL_ODDLOT_SUCCESS,
  MARKET_SYMBOL_INIT,
  MARKET_SYMBOL_ODDLOT_SUBSCRIBE_DATA,
  MARKET_SYMBOL_SUBSCRIBE_DATA,
} from 'redux/actions';
import { combineSymbolData, getMap } from 'utils/common';

const initialState: IReducerState<INewSymbolData[]> = { data: [], status: {} };

const initialIndexBoardState: IReducerState<IIndexBoardData> = {
  data: {
    type: 'main-index-slider',
    array: [],
  },
  status: {},
};

export function NewSymbolData(
  state: INewSymbolData | null = null,
  action: IAction<INewSymbolData>
) {
  switch (action.type) {
    case MARKET_SYMBOL_SUBSCRIBE_DATA:
      return { ...action.payload };
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

export function NewSymbolOddlotData(
  state: INewSymbolData | null = null,
  action: IAction<INewSymbolData>
) {
  switch (action.type) {
    case MARKET_SYMBOL_ODDLOT_SUBSCRIBE_DATA:
      return { ...action.payload };
    default:
      return state;
  }
}

export const BoardData: IQueryReducer<INewSymbolData[]> = (
  state = initialState,
  action
) => {
  switch (action.type) {
    case MARKET_QUERY_SYMBOL_DATA:
      return {
        data: [],
        status: {
          isLoading: true,
        },
      };
    case MARKET_QUERY_SYMBOL_DATA_SUCCESS:
      return {
        data: action.payload,
        status: {
          isSucceeded: true,
        },
      };
    case MARKET_QUERY_SYMBOL_DATA_FAILED:
      return {
        data: [],
        status: {
          isFailed: true,
        },
      };
    default:
      return state;
  }
};

export const IndexBoardData: IQueryReducer<IIndexBoardData> = (
  state = initialIndexBoardState,
  action
) => {
  switch (action.type) {
    case MARKET_QUERY_INDEX_DATA:
      return {
        data: {
          type: action.payload.type,
          array: [],
        },
        status: {
          isLoading: true,
        },
      };
    case MARKET_QUERY_INDEX_DATA_SUCCESS:
      return {
        data: action.payload,
        status: {
          isSucceeded: true,
        },
      };
    case MARKET_QUERY_INDEX_DATA_FAILED:
      return {
        data: {
          type: action.payload.type,
          array: [],
        },
        status: {
          isFailed: true,
        },
      };
    default:
      return state;
  }
};

export const IndexBoardRealtimeData: IReducer<
  ISymbolList,
  INewSymbolData | IIndexBoardData
> = (
  state = {
    array: [],
    map: {},
  },
  action
) => {
  switch (action.type) {
    case MARKET_QUERY_INDEX_DATA:
      return {
        array: [],
        map: {},
      };
    case MARKET_QUERY_INDEX_DATA_SUCCESS:
      return {
        array: (action.payload as IIndexBoardData).array,
        map: getMap((action.payload as IIndexBoardData).array),
      };
    case MARKET_QUERY_INDEX_DATA_FAILED:
      return {
        array: [],
        map: {},
      };
    case MARKET_SYMBOL_SUBSCRIBE_DATA:
    case MARKET_INDEX_SUBSCRIBE_DATA:
      const symbol = action.payload as INewSymbolData;
      if (state.map?.[symbol.s] != null) {
        return {
          array: state.array.map((val) =>
            val.s === symbol.s ? combineSymbolData(symbol, val) : val
          ),
          map: {
            ...state.map,
            [symbol.s]: { ...state.map[symbol.s], ...symbol },
          },
        };
      }
      return state;
    case MARKET_SYMBOL_INIT:
      if (state.array.length > 0) {
        const symbolList = action.payload as ISymbolList;
        const array = state.array.map((val) => ({
          ...val,
          ...symbolList.map?.[val.s],
        }));
        return {
          array,
          map: getMap(array),
        };
      }
      return state;
    default:
      return state;
  }
};

export const SymbolOddlotBoardData: IQueryReducer<INewSymbolData[]> = (
  state = initialState,
  action
) => {
  switch (action.type) {
    case MARKET_QUERY_SYMBOL_ODDLOT:
      return {
        data: [],
        status: {
          isLoading: true,
        },
      };
    case MARKET_QUERY_SYMBOL_ODDLOT_SUCCESS:
      return {
        data: action.payload,
        status: {
          isSucceeded: true,
        },
      };
    case MARKET_QUERY_SYMBOL_ODDLOT_FAILED:
      return {
        data: [],
        status: {
          isFailed: true,
        },
      };
    default:
      return state;
  }
};
