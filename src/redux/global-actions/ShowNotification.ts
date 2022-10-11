import { COMMON_SHOW_NOTIFICATION } from 'redux/actions';
import { IAction, INotification } from 'interfaces/common';

export const showNotification = (
  payload: INotification
): IAction<INotification> => ({
  type: COMMON_SHOW_NOTIFICATION,
  payload,
});
