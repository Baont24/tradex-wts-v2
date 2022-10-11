import {
  COMMON_GET_NOTIFICATION,
  GLOBAL_GET_NOTIFICATION_SUCCESS,
} from 'redux/actions';
import { IAction, INotifications } from 'interfaces/common';
import { IState } from 'redux/global-reducers';
import { put, select, takeLatest } from 'redux-saga/effects';
import { setKey } from 'utils/localStorage';

function* doGetNotifications() {
  try {
    const store: IState = yield select((state: IState) => ({
      userInfo: state.userInfo,
      userExtraInfo: state.userExtraInfo,
    }));

    if (store.userExtraInfo.notifications != null) {
      const expirationDate =
        new Date().getTime() - store.config.notificationExpirationTime;
      store.userExtraInfo.notifications.notifications.filter(
        (item) => new Date(item.time).getTime() > expirationDate
      );

      if (store.userInfo) {
        setKey(`user${store.userInfo.id}`, store.userExtraInfo);
      }
    }

    yield put<IAction<INotifications>>({
      type: GLOBAL_GET_NOTIFICATION_SUCCESS,
      payload: store.userExtraInfo.notifications || {
        notifications: [],
        unseenCount: 0,
      },
    });
  } catch (error) {
    console.error('Get notification', error);
  }
}

export default function* watchGetNotifications() {
  yield takeLatest(COMMON_GET_NOTIFICATION, doGetNotifications);
}
