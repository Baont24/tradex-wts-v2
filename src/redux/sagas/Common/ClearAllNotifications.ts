import {
  COMMON_CLEAR_ALL_NOTIFICATIONS,
  GLOBAL_GET_NOTIFICATION_SUCCESS,
  GLOBAL_USER_EXTRA_INFO,
} from 'redux/actions';
import { IAction, INotifications, IUserExtraInfo } from 'interfaces/common';
import { IState } from 'redux/global-reducers';
import { put, select, takeLatest } from 'redux-saga/effects';
import { setKey } from 'utils/localStorage';

function* doClearAllNotifications() {
  try {
    const store: IState = yield select((state: IState) => ({
      userInfo: state.userInfo,
      userExtraInfo: state.userExtraInfo,
    }));

    if (store.userExtraInfo.notifications != null) {
      yield put<IAction<INotifications>>({
        type: GLOBAL_GET_NOTIFICATION_SUCCESS,
        payload: { notifications: [], unseenCount: 0 },
      });

      yield put<IAction<IUserExtraInfo>>({
        type: GLOBAL_USER_EXTRA_INFO,
        payload: {
          ...store.userExtraInfo,
          notifications: { notifications: [], unseenCount: 0 },
        },
      });

      if (store.userInfo != null) {
        setKey(`user${store.userInfo.id}`, store.userExtraInfo);
      }
    }
  } catch (error) {
    console.error('Clear all notification', error);
  }
}

export default function* watchClearAllNotifications() {
  yield takeLatest(COMMON_CLEAR_ALL_NOTIFICATIONS, doClearAllNotifications);
}
