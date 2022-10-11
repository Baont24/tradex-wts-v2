import { IAction } from 'interfaces/common';
import { ROUTER_LOCATION_CHANGE } from 'redux/actions';

export const changeRoute = (route: string): IAction<string> => ({
  type: ROUTER_LOCATION_CHANGE,
  payload: route,
});
