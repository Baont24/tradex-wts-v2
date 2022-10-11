import { GLOBAL_SELECT_ACCOUNT } from 'redux/actions';
import { IAccount, IAction } from 'interfaces/common';

export const changeAccount = (payload: IAccount): IAction<IAccount> => ({
  type: GLOBAL_SELECT_ACCOUNT,
  payload,
});
