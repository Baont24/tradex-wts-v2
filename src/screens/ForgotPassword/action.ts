import { IAction } from 'interfaces/common';
import { IIdentityAction, IResetPasswordAction } from 'interfaces/actions';

export const VERIFY_IDENTITY = 'VERIFY_IDENTITY';
export const VERIFY_IDENTITY_OTP = 'VERIFY_IDENTITY_OTP';
export const VERIFY_IDENTITY_SUCCESS = 'VERIFY_IDENTITY_SUCCESS';
export const VERIFY_IDENTITY_FAILED = 'VERIFY_IDENTITY_FAILED';
export const RESET_PASSWORD = 'RESET_PASSWORD';
export const RESET_PASSWORD_SUCCESS = 'RESET_PASSWORD_SUCCESS';
export const RESET_PASSWORD_FAILED = 'RESET_PASSWORD_FAILED';

export const verifyIdentity = (
  payload: IIdentityAction
): IAction<IIdentityAction> => ({
  type: VERIFY_IDENTITY,
  payload,
  response: {
    success: VERIFY_IDENTITY_SUCCESS,
    failed: VERIFY_IDENTITY_FAILED,
  },
});

export const resetPassword = (
  payload: IResetPasswordAction
): IAction<IResetPasswordAction> => ({
  type: RESET_PASSWORD,
  payload,
  response: {
    success: RESET_PASSWORD_SUCCESS,
    failed: RESET_PASSWORD_FAILED,
  },
});
