import { IAction, IClientDetailParams } from 'interfaces/common';
import {
  QUERY_CLIENT_DETAIL,
  QUERY_CLIENT_DETAIL_FAILED,
  QUERY_CLIENT_DETAIL_SUCCESS,
} from 'redux/actions';

export const queryClientDetail = (
  payload: IClientDetailParams
): IAction<IClientDetailParams> => ({
  type: QUERY_CLIENT_DETAIL,
  response: {
    success: QUERY_CLIENT_DETAIL_SUCCESS,
    failed: QUERY_CLIENT_DETAIL_FAILED,
  },
  payload,
});
