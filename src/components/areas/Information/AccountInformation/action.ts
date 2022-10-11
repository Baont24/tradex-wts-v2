import {
  CHANGE_PASSWORD,
  CHANGE_PASSWORD_FAILED,
  CHANGE_PASSWORD_SUCCESS,
  CHANGE_PIN,
  CHANGE_PIN_FAILED,
  CHANGE_PIN_SUCCESS,
} from 'redux/actions';
import { IAction } from 'interfaces/common';
import { IParamsChangePassword } from 'interfaces/api';

export const changePassword = (
  data: IParamsChangePassword
): IAction<IParamsChangePassword> => ({
  type: CHANGE_PASSWORD,
  response: {
    success: CHANGE_PASSWORD_SUCCESS,
    failed: CHANGE_PASSWORD_FAILED,
  },
  payload: data,
});

export const changePIN = (
  data: IParamsChangePassword
): IAction<IParamsChangePassword> => ({
  type: CHANGE_PIN,
  response: {
    success: CHANGE_PIN_SUCCESS,
    failed: CHANGE_PIN_FAILED,
  },
  payload: data,
});
