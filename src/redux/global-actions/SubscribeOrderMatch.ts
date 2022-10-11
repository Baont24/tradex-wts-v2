import { IAction } from 'interfaces/common';
import { SUBSCRIBE_ORDER_MATCH, UNSUBSCRIBE_ORDER_MATCH } from 'redux/actions';

export const subscribeOrderMatch = (): IAction => ({
  type: SUBSCRIBE_ORDER_MATCH,
  payload: undefined,
});

export const unsubscribeOrderMatch = (): IAction => ({
  type: UNSUBSCRIBE_ORDER_MATCH,
  payload: undefined,
});
