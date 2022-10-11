import {
  IMarketPutthroughAdvertiseResponse,
  IMarketPutthroughDealResponse,
  IMarketPutthroughDealTotalResponse,
} from 'interfaces/api';
import { IMarketPutthroughDealReducer } from 'interfaces/reducers';
import { IQueryReducer } from 'interfaces/common';
import {
  MARKET_GET_PUTTHROUGH_ADVERTISE_ASK,
  MARKET_GET_PUTTHROUGH_ADVERTISE_ASK_FAILED,
  MARKET_GET_PUTTHROUGH_ADVERTISE_ASK_SUCCESS,
  MARKET_GET_PUTTHROUGH_ADVERTISE_BID,
  MARKET_GET_PUTTHROUGH_ADVERTISE_BID_FAILED,
  MARKET_GET_PUTTHROUGH_ADVERTISE_BID_SUCCESS,
  MARKET_GET_PUTTHROUGH_DEAL,
  MARKET_GET_PUTTHROUGH_DEAL_FAILED,
  MARKET_GET_PUTTHROUGH_DEAL_SUCCESS,
  MARKET_LOAD_MORE_PUTTHROUGH_ADVERTISE_ASK,
  MARKET_LOAD_MORE_PUTTHROUGH_ADVERTISE_BID,
  MARKET_LOAD_MORE_PUTTHROUGH_DEAL,
  MARKET_PUTTHROUGH_ADVERTISE_ASK_SUBSCRIBE_DATA,
  MARKET_PUTTHROUGH_ADVERTISE_BID_SUBSCRIBE_DATA,
  MARKET_PUTTHROUGH_DEAL_SUBSCRIBE_DATA,
  MARKET_UPDATE_PUTTHROUGH_DEAL_TOTAL,
} from './actions';

const initialStateDeal: IMarketPutthroughDealReducer = {
  list: [],
  total: { tva: 0, tvo: 0 },
};

export const PutthroughAdvertiseBid: IQueryReducer<
  IMarketPutthroughAdvertiseResponse[],
  IMarketPutthroughAdvertiseResponse | string
> = (state = { data: [], status: {} }, action) => {
  switch (action.type) {
    case MARKET_GET_PUTTHROUGH_ADVERTISE_BID:
      return {
        data: [],
        status: {
          isLoading: true,
        },
      };
    case MARKET_LOAD_MORE_PUTTHROUGH_ADVERTISE_BID:
      return {
        ...state,
        status: {
          isLoading: true,
        },
      };
    case MARKET_GET_PUTTHROUGH_ADVERTISE_BID_SUCCESS:
      return {
        data: [
          ...state.data,
          ...(action.payload as IMarketPutthroughAdvertiseResponse[]),
        ],
        status: {
          isSucceeded: true,
          loadMore:
            (action.payload as IMarketPutthroughAdvertiseResponse[]).length > 0,
        },
      };
    case MARKET_GET_PUTTHROUGH_ADVERTISE_BID_FAILED:
      return {
        data: [],
        status: {
          isFailed: true,
          errorMessage: action.payload as string,
        },
      };
    case MARKET_PUTTHROUGH_ADVERTISE_BID_SUBSCRIBE_DATA:
      return {
        ...state,
        data: [
          action.payload as IMarketPutthroughAdvertiseResponse,
          ...state.data,
        ],
      };
    default:
      return state;
  }
};

export const PutthroughAdvertiseAsk: IQueryReducer<
  IMarketPutthroughAdvertiseResponse[],
  IMarketPutthroughAdvertiseResponse | string
> = (state = { data: [], status: {} }, action) => {
  switch (action.type) {
    case MARKET_GET_PUTTHROUGH_ADVERTISE_ASK:
      return {
        data: [],
        status: {
          isLoading: true,
        },
      };
    case MARKET_LOAD_MORE_PUTTHROUGH_ADVERTISE_ASK:
      return {
        ...state,
        status: {
          isLoading: true,
        },
      };
    case MARKET_GET_PUTTHROUGH_ADVERTISE_ASK_SUCCESS:
      return {
        data: [
          ...state.data,
          ...(action.payload as IMarketPutthroughAdvertiseResponse[]),
        ],
        status: {
          isSucceeded: true,
          loadMore:
            (action.payload as IMarketPutthroughAdvertiseResponse[]).length > 0,
        },
      };
    case MARKET_GET_PUTTHROUGH_ADVERTISE_ASK_FAILED:
      return {
        data: [],
        status: {
          isFailed: true,
          errorMessage: action.payload as string,
        },
      };
    case MARKET_PUTTHROUGH_ADVERTISE_ASK_SUBSCRIBE_DATA:
      return {
        ...state,
        data: [
          action.payload as IMarketPutthroughAdvertiseResponse,
          ...state.data,
        ],
      };
    default:
      return state;
  }
};

export const PutthroughDeal: IQueryReducer<
  IMarketPutthroughDealReducer,
  | IMarketPutthroughDealResponse[]
  | IMarketPutthroughDealResponse
  | IMarketPutthroughDealTotalResponse
  | string
> = (state = { data: initialStateDeal, status: {} }, action) => {
  switch (action.type) {
    case MARKET_GET_PUTTHROUGH_DEAL:
      return {
        data: initialStateDeal,
        status: {
          isLoading: true,
        },
      };
    case MARKET_LOAD_MORE_PUTTHROUGH_DEAL:
      return {
        ...state,
        status: {
          isLoading: true,
        },
      };
    case MARKET_GET_PUTTHROUGH_DEAL_SUCCESS:
      return {
        data: {
          ...state.data,
          list: [
            ...state.data.list,
            ...(action.payload as IMarketPutthroughDealResponse[]),
          ],
        },
        status: {
          isSucceeded: true,
          loadMore:
            (action.payload as IMarketPutthroughDealResponse[]).length > 0,
        },
      };
    case MARKET_GET_PUTTHROUGH_DEAL_FAILED:
      return {
        data: initialStateDeal,
        status: {
          isFailed: true,
          errorMessage: action.payload as string,
        },
      };
    case MARKET_PUTTHROUGH_DEAL_SUBSCRIBE_DATA:
      return {
        ...state,
        data: {
          list: [
            action.payload as IMarketPutthroughDealResponse,
            ...state.data.list,
          ],
          total: {
            tva:
              state.data.total.tva +
              (action.payload as IMarketPutthroughDealResponse).mva,
            tvo:
              state.data.total.tvo +
              (action.payload as IMarketPutthroughDealResponse).mvo,
          },
        },
      };
    case MARKET_UPDATE_PUTTHROUGH_DEAL_TOTAL:
      return {
        ...state,
        data: {
          ...state.data,
          total: action.payload as IMarketPutthroughDealTotalResponse,
        },
      };
    default:
      return state;
  }
};
