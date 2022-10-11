import {
  ACCOUNT_OTP_CLOSE_MODAL,
  ACCOUNT_OTP_GET_TYPE,
  ACCOUNT_OTP_INIT_DATA_FOR_OTP_FORM,
  ACCOUNT_OTP_SENT,
  ACCOUNT_OTP_SHOW_MODAL,
  ACCOUNT_OTP_VERIFY,
} from 'redux/actions';
import { IAction } from 'interfaces/common';
import { IOtp } from 'interfaces/reducers';
import { ISentOtp, IVerifyOtpRequest } from 'interfaces/api';

export const initDataForOtpForm = (): IAction<Partial<IOtp>> => ({
  type: ACCOUNT_OTP_INIT_DATA_FOR_OTP_FORM,
  payload: {},
});

export const queryOtpType = (): IAction<Partial<IOtp>> => ({
  type: ACCOUNT_OTP_GET_TYPE,
  payload: {},
});

export const openOtpModal = (): IAction<Partial<IOtp>> => ({
  type: ACCOUNT_OTP_SHOW_MODAL,
  payload: {},
});

export const closeOtpModal = (): IAction<Partial<IOtp>> => ({
  type: ACCOUNT_OTP_CLOSE_MODAL,
  payload: {},
});

export const verifyOtp = (
  payload: IVerifyOtpRequest
): IAction<Partial<IVerifyOtpRequest>> => ({
  type: ACCOUNT_OTP_VERIFY,
  payload,
});

export const sentOtp = (
  payload?: Pick<ISentOtp, 'matrixId' | 'isOtpOneModal' | 'forceSMS'>
): IAction<Partial<ISentOtp>> => ({
  type: ACCOUNT_OTP_SENT,
  payload: payload ?? {},
});
