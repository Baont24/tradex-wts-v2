import { IAction } from 'interfaces/common';
import { LocationBisAskUI } from 'constants/enum';

export const GLOBAL_SETTINGS_FUNCTION = 'global/SETTINGS_FUNCTION';

export const changeLocationBidAsk = (
  payload: LocationBisAskUI
): IAction<LocationBisAskUI> => ({
  type: GLOBAL_SETTINGS_FUNCTION,
  payload,
});
