import { IParamsIndexStockList } from 'interfaces/api';
import { IRequest } from 'interfaces/common';
import { MARKET_QUERY_INDEX_STOCK_LIST } from 'redux/actions';
import { call, put, takeLatest } from 'redux-saga/effects';
import { query } from 'utils/socketApi';
import config from '../../../config';

export const getIndexStockList = (params?: IParamsIndexStockList) => {
  return query<{ data: string[] }, IParamsIndexStockList>(
    config.apis.indexStockList,
    params
  );
};

function* doGetIndexStockList(request: IRequest<IParamsIndexStockList>) {
  try {
    const response = yield call(getIndexStockList, request.data);

    yield put({
      type: request.response.success,
      payload: response.data || [],
    });
  } catch (err) {
    console.error('Query index stock list', err);
    yield put({
      type: request.response.failed,
    });
  }
}

export default function* watchGetIndexStockList() {
  yield takeLatest(MARKET_QUERY_INDEX_STOCK_LIST, doGetIndexStockList);
}
