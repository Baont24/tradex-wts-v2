import {
  ACCOUNT_EQUITY_STOCK_TRANSACTION_HISTORY,
  ACCOUNT_EQUITY_STOCK_TRANSACTION_HISTORY_FAILED,
  ACCOUNT_EQUITY_STOCK_TRANSACTION_HISTORY_LOAD_MORE,
  ACCOUNT_EQUITY_STOCK_TRANSACTION_HISTORY_SUCCESS,
} from 'redux/actions';
import { IQueryReducer } from 'interfaces/common';
import { ISecuritiesStatementResponse } from 'interfaces/api';

const defaultState: ISecuritiesStatementResponse = {
  list: [],
  totalCount: 0,
};

export const SecuritiesStatement: IQueryReducer<
  ISecuritiesStatementResponse,
  string
> = (state = { data: defaultState, status: {} }, action) => {
  switch (action.type) {
    case ACCOUNT_EQUITY_STOCK_TRANSACTION_HISTORY:
      return {
        status: {
          isLoading: true,
        },
        data: defaultState,
      };
    case ACCOUNT_EQUITY_STOCK_TRANSACTION_HISTORY_LOAD_MORE:
      return {
        data: state.data,
        status: {
          isLoading: true,
        },
      };
    case ACCOUNT_EQUITY_STOCK_TRANSACTION_HISTORY_SUCCESS:
      return {
        status: {
          isSucceeded: true,
          loadMore:
            (action.payload as ISecuritiesStatementResponse).list.length > 0,
        },
        data: {
          ...(action.payload as ISecuritiesStatementResponse),
          list: [
            ...state.data.list,
            ...(action.payload as ISecuritiesStatementResponse).list,
          ],
        },
      };
    case ACCOUNT_EQUITY_STOCK_TRANSACTION_HISTORY_FAILED:
      return {
        data: defaultState,
        status: {
          isFailed: true,
          errorMessage: action.payload as string,
        },
      };
    default:
      return state;
  }
};
