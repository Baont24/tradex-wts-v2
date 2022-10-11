import { IAction } from 'interfaces/common';
import { IEquitySubAccountResponse } from 'interfaces/api';
import {
  QUERY_SUB_ACCOUNT_FAILED,
  QUERY_SUB_ACCOUNT_SUCCESS,
} from 'redux/actions';

export const EquitySubAccount = (
  state: { readonly data?: IEquitySubAccountResponse[] } = {},
  action: IAction<IEquitySubAccountResponse[]>
) => {
  switch (action.type) {
    case QUERY_SUB_ACCOUNT_SUCCESS:
      return { data: action.payload };
    case QUERY_SUB_ACCOUNT_FAILED:
      return {};
    default:
      return state;
  }
};
