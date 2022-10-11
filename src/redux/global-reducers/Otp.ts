import {
  ACCOUNT_OTP_CLOSE_MODAL,
  ACCOUNT_OTP_COUNT_DOWN,
  ACCOUNT_OTP_GET_MATRIX,
  ACCOUNT_OTP_GET_MATRIX_FAIL,
  ACCOUNT_OTP_GET_MATRIX_SUCCESS,
  ACCOUNT_OTP_GET_TYPE,
  ACCOUNT_OTP_GET_TYPE_FAIL,
  ACCOUNT_OTP_GET_TYPE_SUCCESS,
  ACCOUNT_OTP_RESET,
  ACCOUNT_OTP_SENT,
  ACCOUNT_OTP_SET_VALID,
  ACCOUNT_OTP_SHOW_MODAL,
  ACCOUNT_OTP_VERIFY,
  ACCOUNT_OTP_VERIFY_FAIL,
  ACCOUNT_OTP_VERIFY_SUCCESS,
  AUTHENTICATION_LOGOUT,
} from 'redux/actions';
import { IAction, IQueryStatus, IReducer } from 'interfaces/common';
import {
  IOtp,
  IOtpMatrix,
  IOtpSendToNotifyOrSms,
  IOtpToken,
} from 'interfaces/reducers';
import {
  updateFailQueryState,
  updateStartQueryState,
  updateSuccessQueryState,
} from 'utils/reducerHelper';

const initialState: IOtp = {
  type: { status: {} },
  showOtpForm: false,
  otpMatrix: {
    data: {
      otpMatrixKey: 200,
      otpMatrixNumbers: [],
    },
    status: {},
  },
  otpToken: { status: {} },
};

export const Otp: IReducer<
  IOtp,
  Partial<IOtp> | Partial<IQueryStatus> | string | IOtpMatrix | IOtpToken
> = (
  state: IOtp = initialState,
  action: IAction<
    Partial<IOtp> | Partial<IQueryStatus> | string | IOtpMatrix | IOtpToken
  >
) => {
  switch (action.type) {
    case ACCOUNT_OTP_VERIFY_FAIL:
      return {
        ...state,
        otpToken: updateFailQueryState(action.payload as Partial<IQueryStatus>),
      };
    case ACCOUNT_OTP_VERIFY_SUCCESS:
      return {
        ...state,
        otpToken: updateSuccessQueryState(action.payload as IOtpToken),
        showOtpForm: false,
      };
    case ACCOUNT_OTP_VERIFY:
      return { ...state, otpToken: updateStartQueryState() };
    case ACCOUNT_OTP_GET_MATRIX_FAIL:
      return {
        ...state,
        otpMatrix: updateFailQueryState(
          action.payload as Partial<IQueryStatus>
        ),
      };
    case ACCOUNT_OTP_GET_MATRIX_SUCCESS:
      return {
        ...state,
        otpMatrix: updateSuccessQueryState(action.payload as IOtpMatrix),
      };
    case ACCOUNT_OTP_GET_MATRIX:
      return { ...state, otpMatrix: updateStartQueryState() };
    case ACCOUNT_OTP_SHOW_MODAL:
      return { ...state, showOtpForm: true };
    case ACCOUNT_OTP_CLOSE_MODAL:
      return { ...state, showOtpForm: false };
    case ACCOUNT_OTP_GET_TYPE:
      return { ...state, type: updateStartQueryState() };
    case ACCOUNT_OTP_GET_TYPE_FAIL:
      return {
        ...state,
        type: updateFailQueryState(action.payload as Partial<IQueryStatus>),
      };
    case ACCOUNT_OTP_GET_TYPE_SUCCESS:
      return {
        ...state,
        type: updateSuccessQueryState(action.payload as string),
      };
    case ACCOUNT_OTP_SET_VALID:
      return { ...state, isValid: true };
    case ACCOUNT_OTP_RESET:
    case AUTHENTICATION_LOGOUT:
      return initialState;
    default:
      return state;
  }
};

export const OtpToken: IReducer<string | null, IOtpToken> = (
  state = null,
  action
) => {
  switch (action.type) {
    case ACCOUNT_OTP_VERIFY_SUCCESS:
      return (action.payload as IOtpToken).token;
    case ACCOUNT_OTP_VERIFY_FAIL:
    case ACCOUNT_OTP_RESET:
    case AUTHENTICATION_LOGOUT:
      return null;
    default:
      return state;
  }
};

const initialStateOtpSending: IOtpSendToNotifyOrSms = {
  countDownSeconds: 0,
  countSentOtp: 0,
  countDownMessage15s: '',
};
export const OtpSending: IReducer<IOtpSendToNotifyOrSms> = (
  state = initialStateOtpSending,
  action
) => {
  switch (action.type) {
    case ACCOUNT_OTP_COUNT_DOWN:
      return { ...state, ...action.payload };
    case ACCOUNT_OTP_SENT:
      return {
        ...state,
        countDownSeconds: 15,
        countDownMessage15s: '',
      };
    case AUTHENTICATION_LOGOUT:
      return initialStateOtpSending;
    default:
      return state;
  }
};
