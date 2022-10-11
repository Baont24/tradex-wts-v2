import { GLOBAL_CONFIG } from 'redux/actions';
import { IAction } from 'interfaces/common';
import { IConfig } from 'interfaces/config';
import config from 'config';

export function Config(state = config, action: IAction<IConfig>) {
  switch (action.type) {
    case GLOBAL_CONFIG:
      return action.payload;
    default:
      return state;
  }
}
