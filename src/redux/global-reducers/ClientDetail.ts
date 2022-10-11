import {
  AUTHENTICATION_LOGOUT,
  QUERY_CLIENT_DETAIL_FAILED,
  QUERY_CLIENT_DETAIL_SUCCESS,
} from 'redux/actions';
import { IAction, IClientDetail } from 'interfaces/common';

export const ClientDetail = (
  state: IClientDetail = {},
  action: IAction<IClientDetail>
) => {
  switch (action.type) {
    case QUERY_CLIENT_DETAIL_SUCCESS:
      return action.payload;
    case QUERY_CLIENT_DETAIL_FAILED:
    case AUTHENTICATION_LOGOUT:
      return {};

    default:
      return state;
  }
};
