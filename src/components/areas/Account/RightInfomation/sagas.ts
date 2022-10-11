import {
  ACCOUNT_AVAILABLE_POWER_EXERCISE_RIGHT,
  ACCOUNT_RIGHT_INFORMATION,
  ACCOUNT_RIGHT_INFORMATION_LOAD_MORE,
  ACCOUNT_RIGHT_INFOR_ON_POP_UP,
  ACCOUNT_RIGHT_INFOR_REGISTER_POST,
  ACCOUNT_RIGHT_SUBSCRIPTION_HISTORY,
  ACCOUNT_RIGHT_SUBSCRIPTION_HISTORY_LOAD_MORE,
  COMMON_SHOW_NOTIFICATION,
} from 'redux/actions';
import { IAction, INotification, IResponse } from 'interfaces/common';
import {
  IEquityAssetInfoMarginCallByResponse,
  IEquityRightInforOnPopUpParams,
  IEquityRightInforOnPopUpResponse,
  IEquityRightInformationParams,
  IEquityRightInformationResponse,
  IEquityRightSubsHistoryParams,
  IEquityRightSubsHistoryResponse,
  IRightInforRegisterPostParams,
  IRightInforRegisterPostRespone,
} from 'interfaces/api';
import {
  IMASEquityRightSubscriptionsParams,
  IMASEquityRightSubscriptionsResponse,
} from 'interfaces/apiTTL';
import { IState } from 'redux/global-reducers';
import { ToastType } from 'react-toastify';
import { call, put, select, takeLatest } from 'redux-saga/effects';
import { formatDateToString } from 'utils/datetime';
import { formatStringToNumber } from 'utils/common';
import { query, queryRestTTL } from 'utils/socketApi';
import config from 'config';

const queryRightInformation = (params: IEquityRightInformationParams) => {
  return query(config.apis.equityRightInformation, params);
};

const queryRightInformationIICA = (
  params: IMASEquityRightSubscriptionsParams
) => {
  return queryRestTTL(config.apis.equityRightSubsciptionsIICA, params);
};

const getRightSubsHistory = (params: IEquityRightSubsHistoryParams) => {
  return query(config.apis.equityRightSubsHistory, params);
};

const getRightInforOnPopUp = (params: IEquityRightInforOnPopUpParams) => {
  return query(config.apis.equityRightInforOnPopUp, params);
};

const getRightInforResgisterPost = (params: IRightInforRegisterPostParams) => {
  return query(config.apis.rightInforResgisterPost, params);
};

const getAvailablePowerExerciseRight = (params: {
  readonly accountNumber: string;
}) => {
  return query(config.apis.equityAssetInfoMarginCallBy, params);
};

const getReduce = (
  accumulator: number,
  item: { readonly totalStock: string }
) => {
  return accumulator + formatStringToNumber(item.totalStock);
};

function* doRightInformation(request: IAction<IEquityRightInformationParams>) {
  let rightInfomationIICA: IMASEquityRightSubscriptionsResponse | undefined;
  try {
    const store: IState = yield select((s: IState) => ({
      selectedAccount: s.selectedAccount,
    }));
    let payload: IEquityRightInformationResponse[] = [];
    const today = new Date();
    const response: IResponse<IEquityRightInformationResponse[]> = yield call(
      queryRightInformation,
      request.payload
    );
    if (store.selectedAccount?.isIICA) {
      const rightInfoIICAResponse: IMASEquityRightSubscriptionsResponse = yield call(
        queryRightInformationIICA,
        {
          subAccountID: request.payload.accountNumber,
          mvActionType: 'D',
          mvStockId: 'ALL',
          mvStartDate: `${formatDateToString(
            new Date(
              today.getFullYear(),
              today.getMonth() - 6,
              today.getDate()
            ),
            'dd/MM/yyyy'
          )}`,
          mvEndDate: `${formatDateToString(today, 'dd/MM/yyyy')}`,
          start: 0,
          limit: 100,
        }
      );
      rightInfomationIICA = rightInfoIICAResponse;
      payload = response.data.map((val) => {
        return {
          ...val,
          initialRightQty:
            rightInfomationIICA?.rightList
              ?.filter((ele) => ele.stockId === val.symbol)
              .reduce(getReduce, 0) || 0,
        };
      });
    } else {
      payload = response.data;
    }
    if (request.response) {
      yield put<IAction<IEquityRightInformationResponse[]>>({
        type: request.response.success,
        payload,
      });
    }
  } catch (error) {
    if (request.response) {
      yield put({
        type: request.response.failed,
        payload: error.code || error.message,
      });
    }
  }
}

function* doAvailablePowerExerciseRight(
  request: IAction<IEquityRightInformationParams>
) {
  try {
    let response: { data?: IEquityAssetInfoMarginCallByResponse } | null = null;
    response = yield call(getAvailablePowerExerciseRight, request.payload);
    yield put({
      type: request.response?.success,
      payload: response?.data?.availablePowerToExerciseRight,
    });
  } catch (error) {
    if (request.response) {
      yield put({
        type: request.response.failed,
        payload: error.code || error.message,
      });
    }

    yield put<IAction<INotification>>({
      type: COMMON_SHOW_NOTIFICATION,
      payload: {
        type: ToastType.ERROR,
        title: 'Right Infor Available Power',
        content: error.code || error.message,
        contentParams: error.messageParams,
        time: new Date(),
      },
    });
  }
}

function* doRightSubsHistory(request: IAction<IEquityRightSubsHistoryParams>) {
  try {
    let response: { data?: IEquityRightSubsHistoryResponse } | null = null;
    response = yield call(getRightSubsHistory, request.payload);
    yield put({
      type: request.response?.success,
      payload: response?.data,
    });
  } catch (error) {
    if (request.response) {
      yield put({
        type: request.response.failed,
        payload: error.code || error.message,
      });
    }

    if (error.code !== 'NODATA') {
      yield put<IAction<INotification>>({
        type: COMMON_SHOW_NOTIFICATION,
        payload: {
          type: ToastType.ERROR,
          title: 'Right Subscription History',
          content: error.code || error.message,
          contentParams: error.messageParams,
          time: new Date(),
        },
      });
    }
  }
}

function* doRightInforOnPopUp(
  request: IAction<IEquityRightInforOnPopUpParams>
) {
  try {
    let response: { data?: IEquityRightInforOnPopUpResponse } | null = null;
    response = yield call(getRightInforOnPopUp, request.payload);
    yield put({
      type: request.response?.success,
      payload: response?.data,
    });
  } catch (error) {
    if (request.response) {
      yield put({
        type: request.response.failed,
        payload: error.code || error.message,
      });
    }

    yield put<IAction<INotification>>({
      type: COMMON_SHOW_NOTIFICATION,
      payload: {
        type: ToastType.ERROR,
        title: 'Right Information Pop Up',
        content: error.code || error.message,
        contentParams: error.messageParams,
        time: new Date(),
      },
    });
  }
}

function* doRightInforResgisterPost(
  request: IAction<IRightInforRegisterPostParams>
) {
  try {
    let response: { data?: IRightInforRegisterPostRespone } | null = null;
    response = yield call(getRightInforResgisterPost, request.payload);
    yield put({
      type: request.response?.success,
      payload: null,
    });
    yield put<IAction<INotification>>({
      type: COMMON_SHOW_NOTIFICATION,
      payload: {
        type: ToastType.SUCCESS,
        title: 'Right Information Resgister ',
        content: response?.data?.mvResult,
        time: new Date(),
      },
    });
  } catch (error) {
    if (request.response) {
      yield put({
        type: request.response.failed,
        payload: error.code || error.message,
      });
    }

    yield put<IAction<INotification>>({
      type: COMMON_SHOW_NOTIFICATION,
      payload: {
        type: ToastType.ERROR,
        title: 'Right Information Resgister',
        content: error.code || error.message,
        contentParams: error.messageParams,
        time: new Date(),
      },
    });
  }
}

export function* watchRightInformation() {
  yield takeLatest(ACCOUNT_RIGHT_INFORMATION, doRightInformation);
  yield takeLatest(ACCOUNT_RIGHT_INFORMATION_LOAD_MORE, doRightInformation);
}

export function* watchAvailablePowerExerciseRight() {
  yield takeLatest(
    ACCOUNT_AVAILABLE_POWER_EXERCISE_RIGHT,
    doAvailablePowerExerciseRight
  );
}

export function* watchRightSubsHistory() {
  yield takeLatest(ACCOUNT_RIGHT_SUBSCRIPTION_HISTORY, doRightSubsHistory);
  yield takeLatest(
    ACCOUNT_RIGHT_SUBSCRIPTION_HISTORY_LOAD_MORE,
    doRightSubsHistory
  );
}

export function* watchRightInforOnPopUp() {
  yield takeLatest(ACCOUNT_RIGHT_INFOR_ON_POP_UP, doRightInforOnPopUp);
}

export function* watchRightInforResgisterPost() {
  yield takeLatest(
    ACCOUNT_RIGHT_INFOR_REGISTER_POST,
    doRightInforResgisterPost
  );
}
