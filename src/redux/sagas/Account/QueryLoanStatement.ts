import { ACCOUNT_EQUITY_LOAN_STATEMENT } from 'redux/actions';
import { IAction, IResponse } from 'interfaces/common';
import {
  ILoanStatementResponse,
  IParamsEquityLoanStatement,
} from 'interfaces/api';
import { call, put, takeLatest } from 'redux-saga/effects';
import { query } from 'utils/socketApi';
import config from 'config';

const getEquityLoanStatement = (params: IParamsEquityLoanStatement) => {
  return query(config.apis.equityLoanStatement, params);
};

function* doGetEquityLoanStatement(
  request: IAction<IParamsEquityLoanStatement>
) {
  try {
    let offset = request.payload.offset || 1;
    const fetchCount = request.payload.fetchCount || config.fetchCount;
    let payload: ILoanStatementResponse[] = [];
    let count = fetchCount;
    while (count >= fetchCount) {
      const response: IResponse<ILoanStatementResponse[]> = yield call(
        getEquityLoanStatement,
        {
          ...request.payload,
          offset,
          fetchCount,
        }
      );

      if (request.response) {
        count = response.data.length;
        payload = [...payload, ...response.data];
        offset = payload.length + 1;
        yield put<IAction<ILoanStatementResponse[]>>({
          type: request.response.success,
          payload,
        });
      }
    }
  } catch (error) {
    if (request.response) {
      yield put<IAction<string>>({
        type: request.response.failed,
        payload: error.code || error.message,
      });
    }
  }
}

export function* watchGetEquityLoanStatement() {
  yield takeLatest(ACCOUNT_EQUITY_LOAN_STATEMENT, doGetEquityLoanStatement);
}
