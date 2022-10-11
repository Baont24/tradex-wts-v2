import * as _ from 'lodash';
import {
  AUTHENTICATION_LOGOUT,
  AUTHENTICATION_LOGOUT_SESSION_TIMEOUT,
  SOCKET_AUTHENTICATED,
} from 'redux/actions';
import { IAction, IReducer } from 'interfaces/common';
import { IQueryLogout } from 'interfaces/actions';

export const Logout: IReducer<IQueryLogout> = (
  state: IQueryLogout = {},
  action: IAction<IQueryLogout>
) => {
  switch (action.type) {
    case AUTHENTICATION_LOGOUT:
      return {
        force: action.payload?.force,
      };
    case AUTHENTICATION_LOGOUT_SESSION_TIMEOUT:
      return {
        isSessionTimeout: action.payload.isSessionTimeout,
      };
    case SOCKET_AUTHENTICATED:
      return {};
    default:
      return state;
  }
};
