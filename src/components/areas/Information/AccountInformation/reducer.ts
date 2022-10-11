import {
  CHANGE_PASSWORD,
  CHANGE_PASSWORD_FAILED,
  CHANGE_PASSWORD_SUCCESS,
  CHANGE_PIN,
  CHANGE_PIN_FAILED,
  CHANGE_PIN_SUCCESS,
} from 'redux/actions';
import { IAction } from 'interfaces/common';

export interface IChangePasswordStatus {
  readonly status?: { readonly isLoading: boolean };
  readonly response?: { readonly success: boolean };
}
export const ChangePasswordStatus = (
  state: IChangePasswordStatus = {},
  action: IAction<IChangePasswordStatus>
) => {
  switch (action.type) {
    case CHANGE_PASSWORD:
      return {
        status: { isLoading: true },
      };
    case CHANGE_PASSWORD_SUCCESS:
      return { status: { isLoading: false }, response: action.payload };
    case CHANGE_PASSWORD_FAILED:
      return { status: { isLoading: false }, response: action.payload };
    default:
      return state;
  }
};

export const ChangePINStatus = (
  state: IChangePasswordStatus = {},
  action: IAction<IChangePasswordStatus>
) => {
  switch (action.type) {
    case CHANGE_PIN:
      return {
        status: { isLoading: true },
      };
    case CHANGE_PIN_SUCCESS:
      return { status: { isLoading: false }, response: action.payload };
    case CHANGE_PIN_FAILED:
      return { status: { isLoading: false }, response: action.payload };
    default:
      return state;
  }
};
