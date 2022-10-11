import { GLOBAL_ACCOUNT_LIST } from 'redux/actions';
import { IAccount, IAction } from 'interfaces/common';

export function AccountList(
  state: IAccount[] = [],
  action: IAction<IAccount[]>
) {
  switch (action.type) {
    case GLOBAL_ACCOUNT_LIST:
      return action.payload ? action.payload.slice(0) : [];
    default:
      return state;
  }
}
