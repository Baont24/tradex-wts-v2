import { GLOBAL_I18N, GLOBAL_LANG } from 'redux/actions';
import { IAction } from 'interfaces/common';
import { Lang } from 'constants/enum';

export function I18n(state = false, action: IAction<null>) {
  switch (action.type) {
    case GLOBAL_I18N:
      return true;
    default:
      return state;
  }
}

export function Language(state: Lang = Lang.VI, action: IAction<Lang>) {
  switch (action.type) {
    case GLOBAL_LANG:
      return action.payload || state;
    default:
      return state;
  }
}
