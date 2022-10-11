import { AUTHENTICATION_LOGOUT, GLOBAL_SELECT_ACCOUNT } from 'redux/actions';
import { IAccount, IReducer } from 'interfaces/common';

export const SelectedAccount: IReducer<IAccount | null> = (
  state = null,
  action
) => {
  switch (action.type) {
    case GLOBAL_SELECT_ACCOUNT:
      return action.payload ? { ...action.payload } : null;
    case AUTHENTICATION_LOGOUT:
      return null;
    default:
      return state;
  }
};
