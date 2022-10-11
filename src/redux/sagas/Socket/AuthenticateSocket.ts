import {
  ACCOUNT_OTP_GET_TYPE,
  GLOBAL_ACCOUNT_LIST,
  GLOBAL_DOMAIN_USERINFO,
  GLOBAL_SELECT_ACCOUNT,
  GLOBAL_USERINFO,
  ROUTER_RESET,
  SOCKET_AUTHENTICATED,
  WATCHLIST_SERVER_GET_LIST,
} from 'redux/actions';
import {
  IAccount,
  IAction,
  IAuthToken,
  IRequest,
  IResponse,
  ISocket,
  IUserInfo,
} from 'interfaces/common';
import { IBankInfoForKisResponse } from 'interfaces/api';
import { IState } from 'redux/global-reducers';
import { SystemType } from 'constants/enum';
import { all, put, select, takeLatest } from 'redux-saga/effects';
import { getAccounts } from 'utils/domain';
import { query } from 'utils/socketApi';
import config from 'config';

function* getAccountBankInfo(accounts: IAccount[]) {
  const response: IAccount[] = yield all(
    yield accounts.map((val) => {
      let responseBankInfo;
      if (val.type === SystemType.DERIVATIVES) {
        responseBankInfo = query(config.apis.derivativesBankInfoForKis, {
          accountNo: val.accountNumber,
        });
      } else {
        responseBankInfo = query(config.apis.equityBankInfoForKis, {
          accountNo: val.accountNumber,
        });
      }
      return responseBankInfo
        .then((resp: IResponse<IBankInfoForKisResponse[]>) => {
          const bankIICA = resp.data.find((bank) => bank.isDefault);
          return {
            ...val,
            isIICA: bankIICA?.isDefault,
            bankIICAId: bankIICA?.bankID,
          };
        })
        .catch(() => val);
    })
  );
  return response;
}

export function* doAuthenticateSocket(request: IRequest<ISocket>) {
  try {
    const socket = request.payload;

    const domainUserInfo = socket.authToken;

    const username = socket.authToken?.userInfo?.username;

    const accountList = socket.authToken?.userInfo?.accounts;

    const store: IState = yield select((state: IState) => ({
      selectedAccount: state.selectedAccount,
    }));

    yield put({
      type: WATCHLIST_SERVER_GET_LIST,
    });

    yield put({
      type: ACCOUNT_OTP_GET_TYPE,
    });

    if (domainUserInfo != null) {
      yield put<IAction<IAuthToken>>({
        type: GLOBAL_DOMAIN_USERINFO,
        payload: domainUserInfo,
      });

      yield put<IAction<IUserInfo>>({
        type: GLOBAL_USERINFO,
        payload: domainUserInfo.userInfo,
      });
    }

    if (accountList != null && accountList.length > 0) {
      const accounts = getAccounts(username, accountList);

      yield put<IAction<IAccount[]>>({
        type: GLOBAL_ACCOUNT_LIST,
        payload: accounts,
      });

      if (
        store.selectedAccount == null ||
        store.selectedAccount.username !== username
      ) {
        yield put<IAction<IAccount>>({
          type: GLOBAL_SELECT_ACCOUNT,
          payload: accounts[0],
        });
      }

      const accountsBankData: IAccount[] = yield getAccountBankInfo(accounts);
      if (accountsBankData.some((val) => val.isIICA)) {
        yield put<IAction<IAccount[]>>({
          type: GLOBAL_ACCOUNT_LIST,
          payload: accountsBankData,
        });

        if (
          accountsBankData[0].isIICA &&
          (store.selectedAccount == null ||
            store.selectedAccount.username !== username)
        ) {
          yield put<IAction<IAccount>>({
            type: GLOBAL_SELECT_ACCOUNT,
            payload: accountsBankData[0],
          });
        }
      }
    }

    yield put({
      type: ROUTER_RESET,
    });
  } catch (error) {
    console.error('Authenticate Socket ', error);
  }
}

export default function* watchAuthenticateSocket() {
  yield takeLatest(SOCKET_AUTHENTICATED, doAuthenticateSocket);
}
