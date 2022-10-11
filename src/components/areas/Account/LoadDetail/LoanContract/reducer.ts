import {
  EQUITY_LOAN_CONTRACT,
  EQUITY_LOAN_CONTRACT_FAILED,
  EQUITY_LOAN_CONTRACT_SUCCESS,
} from 'redux/actions';
import { IAction } from 'interfaces/common';
import { ILoanContractResponse } from 'interfaces/api';

export interface IEquityLoanContract {
  readonly data: ILoanContractResponse[];
  readonly status?: {
    readonly isLoading?: boolean;
    readonly isFailed?: boolean;
  };
}
export const EquityLoanContractReducer = (
  state: IEquityLoanContract = { data: [] },
  action: IAction<ILoanContractResponse[]>
) => {
  switch (action.type) {
    case EQUITY_LOAN_CONTRACT:
      return {
        data: [],
        status: {
          isLoading: true,
        },
      };
    case EQUITY_LOAN_CONTRACT_SUCCESS:
      return { data: action.payload, status: { isLoading: false } };
    case EQUITY_LOAN_CONTRACT_FAILED:
      return { data: [], status: { isFailed: false } };
    default:
      return state;
  }
};
