import {
  GLOBAL_ADD_NOTIFICATION,
  GLOBAL_GET_NOTIFICATION_SUCCESS,
} from 'redux/actions';
import { INotification, INotifications, IReducer } from 'interfaces/common';

const initialState: INotifications = {
  notifications: [],
  unseenCount: 0,
};

export const Notifications: IReducer<INotifications, INotification> = (
  state = initialState,
  action
) => {
  switch (action.type) {
    case GLOBAL_ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [
          action.payload as INotification,
          ...state.notifications,
        ],
        unseenCount: state.unseenCount + 1,
      };
    case GLOBAL_GET_NOTIFICATION_SUCCESS:
      return { ...(action.payload as INotifications) };
    default:
      return state;
  }
};
