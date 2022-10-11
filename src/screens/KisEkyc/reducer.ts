import {
  EKYC_CHANGE_PARAMS,
  EKYC_SDK_DATA,
  EKYC_SELECT_INVESTOR,
  REGISTER_EKYC,
  REGISTER_EKYC_FAILED,
  REGISTER_EKYC_SUCCESS,
  SEND_EKYC_OTP_SUCCESS,
  UPLOAD_IMAGE_FAILED,
  UPLOAD_IMAGE_SUCCESS,
  VERIFY_EKYC_OTP_SUCCESS,
} from './action';
import { IAction } from 'interfaces/common';
import { IEKycInfo, IEkycParams } from 'interfaces/ekyc';

export function EkycParams(
  state: IEkycParams = {},
  action: IAction<IEkycParams>
) {
  switch (action.type) {
    case EKYC_CHANGE_PARAMS:
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

export function EkycSdkData(
  state: IEKycInfo | null = null,
  action: IAction<IEKycInfo>
) {
  switch (action.type) {
    case EKYC_SDK_DATA:
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

export function EkycDocumentType(state = -1, action: IAction<number>) {
  switch (action.type) {
    case EKYC_SELECT_INVESTOR:
      return action.payload;
    default:
      return state;
  }
}

export function EkycOTP(
  state: { readonly otpId: string } | null = null,
  action: IAction<string>
) {
  switch (action.type) {
    case SEND_EKYC_OTP_SUCCESS:
      return { otpId: action.payload };
    default:
      return state;
  }
}

export function EkycOTPResult(state = false, action: IAction<null>) {
  switch (action.type) {
    case VERIFY_EKYC_OTP_SUCCESS:
      return true;
    default:
      return state;
  }
}

export function EkycUploadImageFailed(state = false, action: IAction<boolean>) {
  switch (action.type) {
    case UPLOAD_IMAGE_FAILED:
      return true;
    case UPLOAD_IMAGE_SUCCESS:
      return false;
    default:
      return state;
  }
}

export function EkycRegisterResult(state = null, action: IAction<null>) {
  switch (action.type) {
    case REGISTER_EKYC:
      return { loading: true, status: false };
    case REGISTER_EKYC_SUCCESS:
      return { loading: false, status: true };
    case REGISTER_EKYC_FAILED:
      return { loading: false, status: false };
    default:
      return state;
  }
}
