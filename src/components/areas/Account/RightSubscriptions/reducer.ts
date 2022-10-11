import {
  ACCOUNT_RIGHT_EXERCISE_SUBSCRIPTIONS,
  ACCOUNT_RIGHT_EXERCISE_SUBSCRIPTIONS_FAILED,
  ACCOUNT_RIGHT_EXERCISE_SUBSCRIPTIONS_LOAD_MORE,
  ACCOUNT_RIGHT_EXERCISE_SUBSCRIPTIONS_SUCCESS,
} from 'redux/actions';
import { IEquityRightSubscriptionsResponse } from 'interfaces/api';
import { IQueryReducer } from 'interfaces/common';

export const EquytyRightExerciseSubscriptions: IQueryReducer<
  IEquityRightSubscriptionsResponse[] | []
> = (state = { data: [], status: {} }, action) => {
  switch (action.type) {
    case ACCOUNT_RIGHT_EXERCISE_SUBSCRIPTIONS:
      return {
        data: [],
        status: {
          isLoading: true,
        },
      };
    case ACCOUNT_RIGHT_EXERCISE_SUBSCRIPTIONS_LOAD_MORE:
      return {
        data: state.data,
        status: {
          isLoading: true,
        },
      };
    case ACCOUNT_RIGHT_EXERCISE_SUBSCRIPTIONS_SUCCESS:
      return {
        data: [
          ...state.data,
          ...(action.payload as IEquityRightSubscriptionsResponse[]),
        ],
        status: {
          isSucceeded: true,
          loadMore:
            (action.payload as IEquityRightSubscriptionsResponse[]).length > 0,
        },
      };
    case ACCOUNT_RIGHT_EXERCISE_SUBSCRIPTIONS_FAILED:
      return {
        data: [],
        status: {
          isFailed: true,
        },
      };
    default:
      return state;
  }
};
