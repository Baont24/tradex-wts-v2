import {
  GLOBAL_BANK_INFO_FAILED,
  GLOBAL_BANK_INFO_SUCCESS,
} from 'redux/actions';
import { IAction } from 'interfaces/common';
import { IBankInfo } from 'interfaces/api';

export function BankInfo(
  state: IBankInfo[] = [],
  action: IAction<IBankInfo[]>
) {
  switch (action.type) {
    case GLOBAL_BANK_INFO_SUCCESS:
      return action.payload;
    case GLOBAL_BANK_INFO_FAILED:
      return action.payload;
    default:
      return state;
  }
}
