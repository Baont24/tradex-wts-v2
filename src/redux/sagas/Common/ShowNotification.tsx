import * as React from 'react';
import {
  COMMON_SHOW_NOTIFICATION,
  GLOBAL_ADD_NOTIFICATION,
  GLOBAL_USER_EXTRA_INFO,
} from 'redux/actions';
import { IAction, INotification, IUserExtraInfo } from 'interfaces/common';
import { Notification } from 'components/common';
import { ToastId, toast } from 'react-toastify';
import { put, takeLatest } from 'redux-saga/effects';
import i18n from 'i18next';
import store from 'redux/store';

const toastList = new Set();
const MAX_TOAST = 3;

function* doShowNotification(request: IAction<INotification>) {
  try {
    if (request.payload.showNotification !== false) {
      const id: ToastId = toast(
        <Notification
          title={request.payload.title}
          content={
            typeof request.payload.content === 'string'
              ? request.payload.content.includes('INVALID_OTP')
                ? i18n
                    .t('INVALID_OTP', request.payload.contentParams)
                    .replace('X', request.payload.content.slice(-1))
                : i18n.t(request.payload.content, request.payload.contentParams)
              : request.payload.content
          }
          toastType={request.payload.type}
        />,
        {
          type: request.payload.type,
          position: toast.POSITION.BOTTOM_RIGHT,
          pauseOnFocusLoss: false,
          onClose: () => {
            toastList.delete(id);
          },
          ...request.payload.option,
        }
      );
      if (toastList.size < MAX_TOAST) {
        toastList.add(id);
      } else {
        toast.dismiss(toastList.values().next().value);
        toastList.add(id);
      }
    }
    if (request.payload.ignore !== true) {
      const userExtraInfo = store.getState().userExtraInfo;

      yield put<IAction<INotification>>({
        type: GLOBAL_ADD_NOTIFICATION,
        payload: {
          type: request.payload.type,
          title: request.payload.title,
          content: request.payload.content,
          contentParams: request.payload.contentParams,
          time: request.payload.time,
        },
      });

      if (userExtraInfo.notifications != null) {
        yield put<IAction<IUserExtraInfo>>({
          type: GLOBAL_USER_EXTRA_INFO,
          payload: {
            ...userExtraInfo,
            notifications: {
              ...userExtraInfo.notifications,
              unseenCount: userExtraInfo.notifications.unseenCount + 1,
            },
          },
        });
      }
    }
  } catch (err) {
    console.error('Show Notification', err);
  }
}

export default function* watchShowNotification() {
  yield takeLatest(COMMON_SHOW_NOTIFICATION, doShowNotification);
}
