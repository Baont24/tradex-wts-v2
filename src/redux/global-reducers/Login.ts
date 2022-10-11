import {
  AUTHENTICATION_LOGIN_DOMAIN,
  AUTHENTICATION_LOGIN_DOMAIN_FAILED,
  AUTHENTICATION_LOGIN_DOMAIN_SUCCESS,
  AUTHENTICATION_VERIFY_OTP_FAILED,
  AUTHENTICATION_VERIFY_OTP_SUCCESS,
} from 'redux/actions';
import { ILoginDomainInfo } from 'interfaces/reducers';
import { IQueryReducer, IReducerState } from 'interfaces/common';

const initialState: IReducerState<ILoginDomainInfo> = {
  data: {
    showOTP: false,
  },
  status: {},
};

export const LoginDomainInfo: IQueryReducer<ILoginDomainInfo> = (
  state = initialState,
  action
) => {
  switch (action.type) {
    case AUTHENTICATION_LOGIN_DOMAIN:
      return {
        data: {
          showOTP: false,
        },
        status: {
          isLoading: true,
        },
      };
    case AUTHENTICATION_LOGIN_DOMAIN_SUCCESS:
      return {
        data: {
          showOTP: true,
          otpIndex: action.payload.otpIndex,
          registerMobileOtp: action.payload.registerMobileOtp,
        },
        status: {
          isSucceeded: true,
        },
      };
    case AUTHENTICATION_LOGIN_DOMAIN_FAILED:
      return {
        data: {
          showOTP: false,
          message: action.payload.message,
          errorParams:
            action.payload.errorParams != null
              ? action.payload.errorParams
              : {},
        },
        status: {
          isFailed: true,
        },
      };
    case AUTHENTICATION_VERIFY_OTP_SUCCESS:
      return {
        data: { showOTP: false },
        status: {
          isSucceeded: true,
        },
      };
    case AUTHENTICATION_VERIFY_OTP_FAILED:
      return {
        data: {
          showOTP: true,
          otpIndex: action.payload.otpIndex,
          registerMobileOtp: action.payload.registerMobileOtp,
          message: action.payload.message,
          errorParams:
            action.payload.errorParams != null
              ? action.payload.errorParams
              : {},
        },
        status: {
          isFailed: true,
        },
      };
    default:
      return state;
  }
};
