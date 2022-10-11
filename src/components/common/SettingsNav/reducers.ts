import { GLOBAL_SETTINGS_FUNCTION } from './actions';
import { IAction } from 'interfaces/common';
import { LocationBisAskUI } from 'constants/enum';

export const SettingsNav = (
  state = LocationBisAskUI.ASK_BID,
  action: IAction<LocationBisAskUI>
): LocationBisAskUI => {
  switch (action.type) {
    case GLOBAL_SETTINGS_FUNCTION:
      return action.payload;
    default:
      return state;
  }
};
