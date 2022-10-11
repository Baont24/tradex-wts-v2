import { IQueryReducer } from 'interfaces/common';
import { IVerifyIdentityResponse } from 'interfaces/api';
import {
  RESET_PASSWORD_FAILED,
  RESET_PASSWORD_SUCCESS,
  VERIFY_IDENTITY,
  VERIFY_IDENTITY_FAILED,
  VERIFY_IDENTITY_OTP,
  VERIFY_IDENTITY_SUCCESS,
} from './action';

export enum ResetPassword {
  RESET_PASSWORD_SUCCESS = 'RESET_PASSWORD_SUCCESS',
  ACCOUNT_IS_BLOCKED = 'ACCOUNT_IS_BLOCKED',
  VERIFY_IDENTITY_FAILED = 'VERIFY_IDENTITY_FAILED',
}

export const resetPassword: IQueryReducer<IVerifyIdentityResponse | null> = (
  state = { data: {}, status: {} },
  action
) => {
  switch (action.type) {
    case VERIFY_IDENTITY:
      return {
        data: {},
        status: {
          isLoading: true,
        },
      };

    case VERIFY_IDENTITY_SUCCESS:
      return {
        data: action.payload,
        status: {
          isSucceeded: true,
        },
      };
    case VERIFY_IDENTITY_OTP:
      return {
        data: {
          ...state.data,
          ...action.payload,
          isCountDown: (action.payload?.seconds as number) <= 0 ? false : true,
        },
        status: {
          isSucceeded: true,
        },
      };
    case RESET_PASSWORD_SUCCESS:
      return {
        data: action.payload,
        status: {
          isSucceeded: true,
          errorMessage: ResetPassword.RESET_PASSWORD_SUCCESS,
        },
      };
    case VERIFY_IDENTITY_FAILED:
      return {
        data: null,
        status: {
          isFailed: true,
          errorMessage:
            action.payload === ResetPassword.ACCOUNT_IS_BLOCKED
              ? ResetPassword.ACCOUNT_IS_BLOCKED
              : ResetPassword.VERIFY_IDENTITY_FAILED,
        },
      };
    case RESET_PASSWORD_FAILED:
      return {
        data: { ...state.data },
        status: {
          isFailed: true,
          errorMessage:
            action.payload === ResetPassword.ACCOUNT_IS_BLOCKED
              ? ResetPassword.ACCOUNT_IS_BLOCKED
              : ResetPassword.VERIFY_IDENTITY_FAILED,
        },
      };

    default:
      return state;
  }
};
