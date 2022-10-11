import {
  COMMON_CLEAR_NOTIFICATION_UNSEEN_COUNT,
  GLOBAL_GET_NOTIFICATION_SUCCESS,
  GLOBAL_USER_EXTRA_INFO,
} from 'redux/actions';
import { IAction, INotifications, IUserExtraInfo } from 'interfaces/common';
import { IState } from 'redux/global-reducers';
import { put, select, takeLatest } from 'redux-saga/effects';
import { setKey } from 'utils/localStorage';

function* doClearNotificationUnseenCount() {
  try {
    const store: IState = yield select((state: IState) => ({
      userInfo: state.userInfo,
      userExtraInfo: state.userExtraInfo,
    }));

    if (store.userExtraInfo.notifications != null) {
      yield put<IAction<INotifications>>({
        type: GLOBAL_GET_NOTIFICATION_SUCCESS,
        payload: { ...store.userExtraInfo.notifications, unseenCount: 0 },
      });

      yield put<IAction<IUserExtraInfo>>({
        type: GLOBAL_USER_EXTRA_INFO,
        payload: {
          ...store.userExtraInfo,
          notifications: {
            ...store.userExtraInfo.notifications,
            unseenCount: 0,
          },
        },
      });

      if (store.userInfo) {
        setKey(`user${store.userInfo.id}`, store.userExtraInfo);
      }
    }
  } catch (error) {
    console.error('Clear notification unseen count', error);
  }
}

export default function* watchClearNotificationUnseenCount() {
  yield takeLatest(
    COMMON_CLEAR_NOTIFICATION_UNSEEN_COUNT,
    doClearNotificationUnseenCount
  );
}
