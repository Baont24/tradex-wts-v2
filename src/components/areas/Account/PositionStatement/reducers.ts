import {
  ACCOUNT_QUERY_POSITION_STATEMENT,
  ACCOUNT_QUERY_POSITION_STATEMENT_FAILED,
  ACCOUNT_QUERY_POSITION_STATEMENT_SUCCESS,
} from './actions';
import { IPositionStatementResponse } from 'interfaces/api';
import { IQueryReducer } from 'interfaces/common';

export const PositionStatement: IQueryReducer<
  IPositionStatementResponse[],
  string
> = (state = { data: [], status: {} }, action) => {
  switch (action.type) {
    case ACCOUNT_QUERY_POSITION_STATEMENT:
      return { data: [], status: { isLoading: true } };
    case ACCOUNT_QUERY_POSITION_STATEMENT_SUCCESS:
      return {
        data: action.payload as IPositionStatementResponse[],
        status: {
          isSucceeded: true,
        },
      };
    case ACCOUNT_QUERY_POSITION_STATEMENT_FAILED:
      return {
        data: [],
        status: {
          isFailed: true,
          errorMessage: action.payload as string,
        },
      };
    default:
      return state;
  }
};
