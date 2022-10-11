import {
  GLOBAL_BANK_INFO,
  GLOBAL_BANK_INFO_FAILED,
  GLOBAL_BANK_INFO_SUCCESS,
  QUERY_BANK_INFO,
  QUERY_BANK_INFO_FAILED,
  QUERY_BANK_INFO_SUCCESS,
} from 'redux/actions';
import { IAction } from 'interfaces/common';
import { IParamsQueryBankInfo } from 'interfaces/api';

export const queryBankInfo = (
  payload: IParamsQueryBankInfo
): IAction<IParamsQueryBankInfo> => ({
  type: QUERY_BANK_INFO,
  response: {
    success: QUERY_BANK_INFO_SUCCESS,
    failed: QUERY_BANK_INFO_FAILED,
  },
  payload,
});

export const queryBankListInfo = (): IAction<undefined> => ({
  type: GLOBAL_BANK_INFO,
  response: {
    success: GLOBAL_BANK_INFO_SUCCESS,
    failed: GLOBAL_BANK_INFO_FAILED,
  },
  payload: undefined,
});
