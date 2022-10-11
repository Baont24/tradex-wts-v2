import {
  IEKycInfo,
  IEkycOTPParams,
  IEkycParams,
  IEkycUploadImgParams,
  IEkycVerifyOTPParams,
  Investor,
} from 'interfaces/ekyc';

export const EKYC_CHANGE_PARAMS = 'EKYC_CHANGE_PARAMS';
export const EKYC_SELECT_INVESTOR = 'EKYC_SELECT_INVESTOR';
export const EKYC_SDK_DATA = 'EKYC_SDK_DATA';

export const SEND_EKYC_OTP = 'SEND_EKYC_OTP';
export const SEND_EKYC_OTP_SUCCESS = 'SEND_EKYC_OTP_SUCCESS';
export const SEND_EKYC_OTP_FAILED = 'SEND_EKYC_OTP_FAILED';

export const VERIFY_EKYC_OTP = 'VERIFY_EKYC_OTP';
export const VERIFY_EKYC_OTP_SUCCESS = 'VERIFY_EKYC_OTP_SUCCESS';
export const VERIFY_EKYC_OTP_FAILED = 'VERIFY_EKYC_OTP_FAILED';

export const UPLOAD_IMAGE = 'UPLOAD_IMAGE';
export const UPLOAD_IMAGE_SUCCESS = 'UPLOAD_IMAGE_SUCCESS';
export const UPLOAD_IMAGE_FAILED = 'UPLOAD_IMAGE_FAILED';

export const REGISTER_EKYC = 'REGISTER_EKYC';
export const REGISTER_EKYC_SUCCESS = 'REGISTER_EKYC_SUCCESS';
export const REGISTER_EKYC_FAILED = 'REGISTER_EKYC_FAILED';

export const changeEkycParams = (data: IEkycParams) => ({
  type: EKYC_CHANGE_PARAMS,
  payload: data,
});

export const setEkycSDKData = (data: IEKycInfo) => ({
  type: EKYC_SDK_DATA,
  payload: data,
});

export const selectInvestor = (data: Investor) => ({
  type: EKYC_SELECT_INVESTOR,
  payload: data,
});

export const sendEkycOTP = (payload: IEkycOTPParams) => ({
  type: SEND_EKYC_OTP,
  response: {
    success: SEND_EKYC_OTP_SUCCESS,
    failed: SEND_EKYC_OTP_FAILED,
  },
  payload,
});

export const verifyEkycOTP = (payload: IEkycVerifyOTPParams) => ({
  type: VERIFY_EKYC_OTP,
  response: {
    success: VERIFY_EKYC_OTP_SUCCESS,
    failed: VERIFY_EKYC_OTP_FAILED,
  },
  payload,
});

export const uploadImg = (payload: IEkycUploadImgParams) => ({
  type: UPLOAD_IMAGE,
  response: {
    success: UPLOAD_IMAGE_SUCCESS,
    failed: UPLOAD_IMAGE_FAILED,
  },
  payload,
});

export const registerEkyc = (payload: IEkycParams) => ({
  type: REGISTER_EKYC,
  response: {
    success: REGISTER_EKYC_SUCCESS,
    failed: REGISTER_EKYC_FAILED,
  },
  payload,
});

export const resetUploadImageStatus = () => ({
  type: UPLOAD_IMAGE_SUCCESS,
});
