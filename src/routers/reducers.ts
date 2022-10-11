import { IAction } from 'interfaces/common';
import { ROUTER_LOCATION_CHANGE, ROUTER_RESET } from 'redux/actions';

export function Router(
  state = window.location.pathname,
  action: IAction<string>
) {
  switch (action.type) {
    case ROUTER_LOCATION_CHANGE:
      return action.payload || state;
    default:
      return state;
  }
}

export function RouterReset(state = false, action: IAction<boolean>) {
  switch (action.type) {
    case ROUTER_RESET:
      return !state;
    default:
      return state;
  }
}
