import { ACCOUNT_QUERY_INTEREST_EXPENSE_STATEMENT } from './actions';
import { COMMON_SHOW_NOTIFICATION } from 'redux/actions';
import { IAction, INotification } from 'interfaces/common';
import { ILoanExpenseStatementReducer } from 'interfaces/reducers';
import {
  ILoanExpenseStatementRequest,
  ILoanExpenseStatementResponse,
} from 'interfaces/api';
import { ToastType } from 'react-toastify';
import { call, put, takeLatest } from 'redux-saga/effects';
import { query } from 'utils/socketApi';
import config from 'config';

const queryInterestExpenseStatement = (
  params: ILoanExpenseStatementRequest
) => {
  return query(config.apis.equityInterestExpenseStatement, params);
};

function* doQueryInterestExpenseStatement(
  request: IAction<ILoanExpenseStatementRequest>
) {
  try {
    const response: { data: ILoanExpenseStatementResponse[] } = yield call(
      queryInterestExpenseStatement,
      request.payload
    );

    let totalDataCount = response?.data.length;
    let payload = response.data;
    let offset = 0;
    while (totalDataCount === 100) {
      offset += 100;
      const nextResponse: {
        data?: ILoanExpenseStatementResponse[];
      } = yield call(queryInterestExpenseStatement, {
        ...request.payload,
        offset,
      });
      if (nextResponse.data != null) {
        payload = [...payload, ...nextResponse.data];
        totalDataCount = nextResponse.data.length;
      } else {
        totalDataCount = 0;
      }
    }

    const total = payload.reduce(
      (val, curr) => ({
        debitInterest: +val.debitInterest + +curr.debitInterest,
        interestRate: '-',
        accruedInterestAmount: '-',
      }),
      {
        debitInterest: 0,
        interestRate: '',
        accruedInterestAmount: '',
      }
    );

    if (request.response) {
      yield put<IAction<ILoanExpenseStatementReducer>>({
        type: request.response.success,
        payload: { list: response.data, total },
      });
    }
  } catch (error) {
    console.error('Query interest expense statement', error);

    if (request.response) {
      yield put<IAction<string>>({
        type: request.response.failed,
        payload: error.code || error.message,
      });
    }

    yield put<IAction<INotification>>({
      type: COMMON_SHOW_NOTIFICATION,
      payload: {
        type: ToastType.ERROR,
        title: 'Interest Expense Statement',
        content: error.code || error.message,
        contentParams: error.messageParams,
        time: new Date(),
      },
    });
  }
}

export function* watchQueryInterestExpenseStatement() {
  yield takeLatest(
    ACCOUNT_QUERY_INTEREST_EXPENSE_STATEMENT,
    doQueryInterestExpenseStatement
  );
}
