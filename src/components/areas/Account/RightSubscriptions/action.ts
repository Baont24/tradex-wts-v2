import {
  ACCOUNT_RIGHT_EXERCISE_SUBSCRIPTIONS,
  ACCOUNT_RIGHT_EXERCISE_SUBSCRIPTIONS_FAILED,
  ACCOUNT_RIGHT_EXERCISE_SUBSCRIPTIONS_LOAD_MORE,
  ACCOUNT_RIGHT_EXERCISE_SUBSCRIPTIONS_SUCCESS,
} from 'redux/actions';
import { IAction } from 'interfaces/common';
import { IEquityRightSubscriptionsParams } from 'interfaces/api';

export const queryRightExerciseSubscriptions = (
  payload: IEquityRightSubscriptionsParams
): IAction<IEquityRightSubscriptionsParams> => ({
  type:
    payload.offset != null && payload.offset > 0
      ? ACCOUNT_RIGHT_EXERCISE_SUBSCRIPTIONS_LOAD_MORE
      : ACCOUNT_RIGHT_EXERCISE_SUBSCRIPTIONS,
  response: {
    success: ACCOUNT_RIGHT_EXERCISE_SUBSCRIPTIONS_SUCCESS,
    failed: ACCOUNT_RIGHT_EXERCISE_SUBSCRIPTIONS_FAILED,
  },
  payload,
});
