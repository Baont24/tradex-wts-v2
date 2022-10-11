import { CandleType } from 'constants/enum';
import {
  GLOBAL_DOMAIN_USERINFO,
  GLOBAL_USERINFO,
  GLOBAL_USER_EXTRA_INFO,
} from 'redux/actions';
import {
  IAction,
  IDomainUserInfo,
  IReducer,
  IUserExtraInfo,
  IUserInfo,
} from 'interfaces/common';

export const defaultUserExtraInfo: IUserExtraInfo = {
  candleSettings: {
    candleType: CandleType.HIGH_LOW,
  },
  orderFormSettings: {
    promptStatus: true,
  },
  hiddenComponentSetting: {
    hiddenIndexList: false,
    hiddenBoard: true,
  },
};

export const UserInfo: IReducer<IUserInfo | null> = (state = null, action) => {
  switch (action.type) {
    case GLOBAL_USERINFO:
      return action.payload ? { ...action.payload } : null;
    default:
      return state;
  }
};

export const DomainUserInfo: IReducer<IDomainUserInfo | null> = (
  state = null,
  action
) => {
  switch (action.type) {
    case GLOBAL_DOMAIN_USERINFO:
      return action.payload ? { ...action.payload } : null;
    default:
      return state;
  }
};

export const UserExtraInfo: IReducer<IUserExtraInfo> = (
  state: IUserExtraInfo = defaultUserExtraInfo,
  action: IAction<IUserExtraInfo>
) => {
  switch (action.type) {
    case GLOBAL_USER_EXTRA_INFO:
      return { ...action.payload };
    default:
      return state;
  }
};
