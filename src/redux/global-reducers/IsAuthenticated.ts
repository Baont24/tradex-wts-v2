import { AUTHENTICATION_STATE_CHANGE } from 'redux/actions';
import { IAction, IReducer } from 'interfaces/common';

export const IsAuthenticated: IReducer<boolean> = (
  state: boolean = false,
  action: IAction<boolean>
) => {
  switch (action.type) {
    case AUTHENTICATION_STATE_CHANGE:
      return action.payload;
    default:
      return state;
  }
};
