import {
  ACCOUNT_QUERY_DERIVATIVES_PORTFOLIO,
  ACCOUNT_QUERY_DERIVATIVES_PORTFOLIO_FAILED,
  ACCOUNT_QUERY_DERIVATIVES_PORTFOLIO_SUCCESS,
  ACCOUNT_QUERY_EQUITY_PORTFOLIO,
  ACCOUNT_QUERY_EQUITY_PORTFOLIO_FAILED,
  ACCOUNT_QUERY_EQUITY_PORTFOLIO_SUCCESS,
  ACCOUNT_QUERY_PORTFOLIOS,
  ACCOUNT_QUERY_PORTFOLIOS_FAILED,
  ACCOUNT_QUERY_PORTFOLIOS_SUCCESS,
  AUTHENTICATION_LOGOUT,
} from 'redux/actions';
import {
  IDerivativesPortfoliosReducer,
  IEquityPortfoliosReducer,
  IPortfoliosReducer,
} from 'interfaces/reducers';
import { IQueryReducer } from 'interfaces/common';

const Portfolios: IQueryReducer<IPortfoliosReducer[]> = (
  state = { data: [], status: {} },
  action
) => {
  switch (action.type) {
    case ACCOUNT_QUERY_PORTFOLIOS:
      return {
        data: [],
        status: {
          isLoading: true,
        },
      };
    case ACCOUNT_QUERY_PORTFOLIOS_SUCCESS:
      return {
        data: action.payload,
        status: {
          isSucceeded: true,
        },
      };
    case ACCOUNT_QUERY_PORTFOLIOS_FAILED:
      return {
        data: [],
        status: {
          isFailed: true,
        },
      };
    case AUTHENTICATION_LOGOUT:
      return {
        data: [],
        status: {},
      };
    default:
      return state;
  }
};

const EquityPortfolio: IQueryReducer<
  IEquityPortfoliosReducer | null,
  string
> = (state = { data: null, status: {} }, action) => {
  switch (action.type) {
    case ACCOUNT_QUERY_EQUITY_PORTFOLIO:
      return {
        data: state.data,
        status: {
          isLoading: true,
        },
      };
    case ACCOUNT_QUERY_EQUITY_PORTFOLIO_SUCCESS:
      return {
        data: action.payload as IEquityPortfoliosReducer,
        status: {
          isSucceeded: true,
        },
      };
    case ACCOUNT_QUERY_EQUITY_PORTFOLIO_FAILED:
      return {
        data: null,
        status: {
          isFailed: true,
          errorMessage: action.payload as string,
        },
      };
    case AUTHENTICATION_LOGOUT:
      return {
        data: null,
        status: {},
      };
    default:
      return state;
  }
};

const DerivativesPortfolio: IQueryReducer<
  IDerivativesPortfoliosReducer | null,
  string
> = (state = { data: null, status: {} }, action) => {
  switch (action.type) {
    case ACCOUNT_QUERY_DERIVATIVES_PORTFOLIO:
      return {
        data: state.data,
        status: {
          isLoading: true,
        },
      };
    case ACCOUNT_QUERY_DERIVATIVES_PORTFOLIO_SUCCESS:
      return {
        data: action.payload as IDerivativesPortfoliosReducer,
        status: {
          isSucceeded: true,
        },
      };
    case ACCOUNT_QUERY_DERIVATIVES_PORTFOLIO_FAILED:
      return {
        data: null,
        status: {
          isFailed: true,
          errorMessage: action.payload as string,
        },
      };
    case AUTHENTICATION_LOGOUT:
      return {
        data: null,
        status: {},
      };
    default:
      return state;
  }
};

export { EquityPortfolio, DerivativesPortfolio, Portfolios };
