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
import { IAction } from 'interfaces/common';
import {
  IEquityRightInforOnPopUpParams,
  IEquityRightInformationParams,
  IEquityRightSubsHistoryParams,
  IRightInforRegisterPostParams,
} from 'interfaces/api';

export const queryRightInformation = (
  payload: IEquityRightInformationParams
): IAction<IEquityRightInformationParams> => ({
  type:
    payload.offset != null && payload.offset > 0
      ? ACCOUNT_RIGHT_INFORMATION_LOAD_MORE
      : ACCOUNT_RIGHT_INFORMATION,
  response: {
    success: ACCOUNT_RIGHT_INFORMATION_SUCCESS,
    failed: ACCOUNT_RIGHT_INFORMATION_FAILED,
  },
  payload,
});

export const queryRightSubsHistory = (
  payload: IEquityRightSubsHistoryParams
): IAction<IEquityRightSubsHistoryParams> => ({
  type:
    payload.offset != null && payload.offset > 0
      ? ACCOUNT_RIGHT_SUBSCRIPTION_HISTORY_LOAD_MORE
      : ACCOUNT_RIGHT_SUBSCRIPTION_HISTORY,
  response: {
    success: ACCOUNT_RIGHT_SUBSCRIPTION_HISTORY_SUCCESS,
    failed: ACCOUNT_RIGHT_SUBSCRIPTION_HISTORY_FAILED,
  },
  payload,
});

export const queryInforOnPopUp = (
  payload: IEquityRightInforOnPopUpParams
): IAction<IEquityRightInforOnPopUpParams> => ({
  type: ACCOUNT_RIGHT_INFOR_ON_POP_UP,
  response: {
    success: ACCOUNT_RIGHT_INFOR_ON_POP_UP_SUCCESS,
    failed: ACCOUNT_RIGHT_INFOR_ON_POP_UP_FAILED,
  },
  payload,
});

export const postRightInforRegister = (
  payload: IRightInforRegisterPostParams
): IAction<IRightInforRegisterPostParams> => ({
  type: ACCOUNT_RIGHT_INFOR_REGISTER_POST,
  response: {
    success: ACCOUNT_RIGHT_INFOR_REGISTER_POST_SUCCESS,
    failed: ACCOUNT_RIGHT_INFOR_REGISTER_POST_FAILED,
  },
  payload,
});

export const queryAvailablePowerExerciseRight = (
  payload: IEquityRightInformationParams
): IAction<IEquityRightInformationParams> => ({
  type: ACCOUNT_AVAILABLE_POWER_EXERCISE_RIGHT,
  response: {
    success: ACCOUNT_AVAILABLE_POWER_EXERCISE_RIGHT_SUCCESS,
    failed: ACCOUNT_AVAILABLE_POWER_EXERCISE_RIGHT_FAILED,
  },
  payload,
});
