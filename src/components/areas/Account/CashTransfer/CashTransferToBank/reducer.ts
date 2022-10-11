import { IAction } from 'interfaces/common';
import { IEquityBankInfoResponse } from 'interfaces/api';
import { QUERY_BANK_INFO_FAILED, QUERY_BANK_INFO_SUCCESS } from 'redux/actions';

export const EquityBankInfo = (
  state: { readonly data?: IEquityBankInfoResponse[] } = {},
  action: IAction<IEquityBankInfoResponse[]>
) => {
  switch (action.type) {
    case QUERY_BANK_INFO_SUCCESS:
      return { data: action.payload };
    case QUERY_BANK_INFO_FAILED:
      return {};
    default:
      return state;
  }
};
