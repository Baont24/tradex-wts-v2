import {
  ACCOUNT_AVAILABLE_POWER_EXERCISE_RIGHT,
  ACCOUNT_AVAILABLE_POWER_EXERCISE_RIGHT_FAILED,
  ACCOUNT_AVAILABLE_POWER_EXERCISE_RIGHT_SUCCESS,
  ACCOUNT_RIGHT_INFORMATION,
  ACCOUNT_RIGHT_INFORMATION_FAILED,
  ACCOUNT_RIGHT_INFORMATION_LOAD_MORE,
  ACCOUNT_RIGHT_INFORMATION_SUCCESS,
  ACCOUNT_RIGHT_INFOR_ON_POP_UP,
  ACCOUNT_RIGHT_INFOR_ON_POP_UP_FAILED,
  ACCOUNT_RIGHT_INFOR_ON_POP_UP_SUCCESS,
  ACCOUNT_RIGHT_INFOR_REGISTER_POST,
  ACCOUNT_RIGHT_INFOR_REGISTER_POST_FAILED,
  ACCOUNT_RIGHT_INFOR_REGISTER_POST_SUCCESS,
  ACCOUNT_RIGHT_SUBSCRIPTION_HISTORY,
  ACCOUNT_RIGHT_SUBSCRIPTION_HISTORY_FAILED,
  ACCOUNT_RIGHT_SUBSCRIPTION_HISTORY_LOAD_MORE,
  ACCOUNT_RIGHT_SUBSCRIPTION_HISTORY_SUCCESS,
} from 'redux/actions';
import {
  IEquityAssetInfoMarginCallByResponse,
  IEquityRightInforOnPopUpResponse,
  IEquityRightInformationResponse,
  IEquityRightSubsHistoryResponse,
} from 'interfaces/api';
import { IQueryReducer } from 'interfaces/common';

export const EquityRightInformation: IQueryReducer<
  IEquityRightInformationResponse[] | []
> = (state = { data: [], status: {} }, action) => {
  switch (action.type) {
    case ACCOUNT_RIGHT_INFORMATION:
      return {
        data: [],
        status: {
          isLoading: true,
        },
      };
    case ACCOUNT_RIGHT_INFORMATION_LOAD_MORE:
      return {
        data: state.data,
        status: {
          isLoading: true,
        },
      };
    case ACCOUNT_RIGHT_INFORMATION_SUCCESS:
      return {
        data: [
          ...state.data,
          ...(action.payload as IEquityRightInformationResponse[]),
        ],
        status: {
          isSucceeded: true,
          loadMore:
            (action.payload as IEquityRightInformationResponse[]).length > 0,
        },
      };
    case ACCOUNT_RIGHT_INFORMATION_FAILED:
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

export const EquityRightSubsHistory: IQueryReducer<
  IEquityRightSubsHistoryResponse[] | []
> = (state = { data: [], status: {} }, action) => {
  switch (action.type) {
    case ACCOUNT_RIGHT_SUBSCRIPTION_HISTORY:
      return {
        data: [],
        status: {
          isLoading: true,
        },
      };
    case ACCOUNT_RIGHT_SUBSCRIPTION_HISTORY_LOAD_MORE:
      return {
        data: state.data,
        status: {
          isLoading: true,
        },
      };
    case ACCOUNT_RIGHT_SUBSCRIPTION_HISTORY_SUCCESS:
      return {
        data: [...state.data, ...action.payload],
        status: {
          isSucceeded: true,
          loadMore:
            (action.payload as IEquityRightSubsHistoryResponse[]).length > 0,
        },
      };
    case ACCOUNT_RIGHT_SUBSCRIPTION_HISTORY_FAILED:
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

export const EquityRightInforOnPopUp: IQueryReducer<IEquityRightInforOnPopUpResponse | null> = (
  state = { data: null, status: {} },
  action
) => {
  switch (action.type) {
    case ACCOUNT_RIGHT_INFOR_ON_POP_UP:
      return {
        data: null,
        status: {
          isLoading: true,
        },
      };
    case ACCOUNT_RIGHT_INFOR_ON_POP_UP_SUCCESS:
      return {
        data: action.payload as IEquityRightInforOnPopUpResponse,
        status: {
          isSucceeded: true,
        },
      };
    case ACCOUNT_RIGHT_INFOR_ON_POP_UP_FAILED:
      return {
        data: null,
        status: {
          isFailed: true,
        },
      };
    default:
      return state;
  }
};

export const EquityAvailablePowerExercise: IQueryReducer<
  IEquityAssetInfoMarginCallByResponse | {}
> = (state = { data: {}, status: {} }, action) => {
  switch (action.type) {
    case ACCOUNT_AVAILABLE_POWER_EXERCISE_RIGHT:
      return {
        data: {},
        status: {
          isLoading: true,
        },
      };
    case ACCOUNT_AVAILABLE_POWER_EXERCISE_RIGHT_SUCCESS:
      return {
        data: action.payload,
        status: {
          isSucceeded: true,
        },
      };
    case ACCOUNT_AVAILABLE_POWER_EXERCISE_RIGHT_FAILED:
      return {
        data: {},
        status: {
          isFailed: true,
        },
      };
    default:
      return state;
  }
};

export const StatusRightInforResgisterPost: IQueryReducer<{}> = (
  state = { data: {}, status: {} },
  action
) => {
  switch (action.type) {
    case ACCOUNT_RIGHT_INFOR_REGISTER_POST:
      return {
        data: {},
        status: {
          isLoading: true,
        },
      };
    case ACCOUNT_RIGHT_INFOR_REGISTER_POST_SUCCESS:
      return {
        data: action.payload,
        status: {
          isSucceeded: true,
        },
      };
    case ACCOUNT_RIGHT_INFOR_REGISTER_POST_FAILED:
      return {
        data: {},
        status: {
          isFailed: true,
        },
      };
    default:
      return state;
  }
};
