import { watchSendOTP, watchVerifyOTP } from './OTP';
import { watchUploadImage } from './UploadImage';
import watchRegisterEkyc from './Register';

export {
  watchSendOTP as ekycSendOTP,
  watchVerifyOTP as ekycVerifyOTP,
  watchUploadImage as uploadImage,
  watchRegisterEkyc as registerEkyc,
};
