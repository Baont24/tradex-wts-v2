import { IAction } from 'interfaces/common';
import { IParamsQueryIndexMinutes } from 'interfaces/api';
import {
  MARKET_GET_INDEX_MINUTES,
  MARKET_GET_INDEX_MINUTES_FAILED,
  MARKET_GET_INDEX_MINUTES_SUCCESS,
} from 'redux/actions';

export const queryIndexMinutes = (
  payload: IParamsQueryIndexMinutes
): IAction<IParamsQueryIndexMinutes> => {
  return {
    type: MARKET_GET_INDEX_MINUTES,
    payload,
    response: {
      success: MARKET_GET_INDEX_MINUTES_SUCCESS,
      failed: MARKET_GET_INDEX_MINUTES_FAILED,
    },
  };
};
