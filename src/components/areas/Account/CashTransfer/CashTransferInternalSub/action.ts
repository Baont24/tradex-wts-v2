import { IAction } from 'interfaces/common';
import { IParamsSubAccount } from 'interfaces/api';
import {
  QUERY_SUB_ACCOUNT,
  QUERY_SUB_ACCOUNT_FAILED,
  QUERY_SUB_ACCOUNT_SUCCESS,
} from 'redux/actions';

export const querySubAccount = (
  payload: IParamsSubAccount
): IAction<IParamsSubAccount> => ({
  type: QUERY_SUB_ACCOUNT,
  response: {
    success: QUERY_SUB_ACCOUNT_SUCCESS,
    failed: QUERY_SUB_ACCOUNT_FAILED,
  },
  payload,
});
