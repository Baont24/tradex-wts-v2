import {
  AUTHENTICATION_LOGIN_DOMAIN,
  AUTHENTICATION_LOGIN_DOMAIN_FAILED,
  AUTHENTICATION_LOGIN_DOMAIN_SUCCESS,
  AUTHENTICATION_LOGOUT,
  AUTHENTICATION_VERIFY_OTP,
  AUTHENTICATION_VERIFY_OTP_FAILED,
  AUTHENTICATION_VERIFY_OTP_SUCCESS,
} from 'redux/actions';
import { IAction } from 'interfaces/common';
import { IQueryLogin, IQueryLogout, IVerifyOTP } from 'interfaces/actions';

export const loginDomain = (payload: IQueryLogin): IAction<IQueryLogin> => ({
  type: AUTHENTICATION_LOGIN_DOMAIN,
  payload,
  response: {
    success: AUTHENTICATION_LOGIN_DOMAIN_SUCCESS,
    failed: AUTHENTICATION_LOGIN_DOMAIN_FAILED,
  },
});

export const verifyOTP = (payload: IVerifyOTP): IAction<IVerifyOTP> => ({
  type: AUTHENTICATION_VERIFY_OTP,
  payload,
  response: {
    success: AUTHENTICATION_VERIFY_OTP_SUCCESS,
    failed: AUTHENTICATION_VERIFY_OTP_FAILED,
  },
});

export const logout = (payload: IQueryLogout): IAction<IQueryLogout> => ({
  type: AUTHENTICATION_LOGOUT,
  payload,
});
