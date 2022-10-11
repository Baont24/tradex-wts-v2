import {
  ACCOUNT_QUERY_DERIVATIVES_PORTFOLIO,
  ACCOUNT_QUERY_EQUITY_PORTFOLIO,
  ACCOUNT_QUERY_PORTFOLIOS,
  COMMON_SHOW_NOTIFICATION,
} from 'redux/actions';
import { IAccount, IAction, INotification, IResponse } from 'interfaces/common';
import {
  IDerivativesAccountSummaryDetail,
  IDerivativesPortfolioPositionResponse,
  IDerivativesPortfolioResponse,
  IEquityEnquiryPortfolioAccountSummaryResponse,
  IEquityEnquiryPortfolioPerSubAccResponse,
} from 'interfaces/api';
import {
  IDerivativesPortfoliosReducer,
  IEquityPortfoliosReducer,
  IPortfoliosReducer,
} from 'interfaces/reducers';
import { IMASEquityPortfolioResponse } from 'interfaces/apiTTL';
import { IState } from 'redux/global-reducers';
import { SystemType } from 'constants/enum';
import { ToastType } from 'react-toastify';
import { all, call, put, select, takeLatest } from 'redux-saga/effects';
import { formatStringToNumber } from 'utils/common';
import { query, queryRestTTL } from 'utils/socketApi';
import config from 'config';

const queryEquityPortfolio = (params: { readonly accountNumber: string }) => {
  return query(config.apis.queryEquityPortfolio, params);
};

const queryDerivativesSummary = (params: { readonly accountNo: string }) => {
  return query(config.apis.queryDerivativesSummary, params);
};

const queryDerivativesPortfolio = (params: { readonly accountNo: string }) => {
  return query(config.apis.queryDerivativesPortfolio, params);
};

const queryEquityPortfolioIICA = (params: {
  readonly subAccountID: string;
}) => {
  return queryRestTTL(config.apis.equityPortfolioIICA, params);
};

function* doEnquiryPortfolio(
  request: IAction<{
    readonly accountNumber: string;
    readonly type?: SystemType;
  }>
) {
  try {
    const store: IState = yield select((state: IState) => ({
      accountList: state.accountList,
    }));

    if (request.payload.accountNumber === 'ALL') {
      const accountListIICA = store.accountList.filter((val) => val.isIICA);
      let portfolioList: IPortfoliosReducer[] = [];
      let portfolioListIICA: Array<{
        readonly accountNumber: string;
        readonly type: SystemType;
        readonly summary: Partial<
          | IEquityEnquiryPortfolioAccountSummaryResponse
          | IDerivativesAccountSummaryDetail
        >;
      }> | null = null;

      if (accountListIICA.length > 0) {
        portfolioListIICA = yield all(
          accountListIICA.map((val) => call(doEnquiryPortfolioIICA, val))
        );
      }

      const responseEquity: IResponse<
        IEquityEnquiryPortfolioPerSubAccResponse[]
      > = yield call(queryEquityPortfolio, request.payload);

      const derivativesAccount = store.accountList.find(
        (val) => val.type === SystemType.DERIVATIVES
      );

      let responseDerivativesPosition: IResponse<
        IDerivativesPortfolioPositionResponse
      > | null = null;

      let derivativesAccountSummary:
        | IPortfoliosReducer['summary']
        | null = null;

      if (derivativesAccount != null) {
        const responseDerivativesSummary: IResponse<IDerivativesPortfolioResponse> = yield call(
          queryDerivativesSummary,
          {
            accountNo: derivativesAccount.accountNumber,
          }
        );
        if (responseDerivativesSummary != null) {
          const minPP = Math.min(
            responseDerivativesSummary.data.cashInformation.internal.EE,
            responseDerivativesSummary.data.cashInformation.exchange.EE
          );
          derivativesAccountSummary = {
            ...responseDerivativesSummary.data.accountSummary,
            netAssetValue:
              responseDerivativesSummary.data.accountSummary.totalEquity,
            PP: minPP,
          };
        }

        responseDerivativesPosition = yield call(queryDerivativesPortfolio, {
          accountNo: derivativesAccount.accountNumber,
        });
      }

      const equityPortfolio = responseEquity.data.map((val) => ({
        ...val,
        type: SystemType.EQUITY,
      }));
      const derivativesPortfolio: IPortfoliosReducer[] =
        derivativesAccount && derivativesAccountSummary
          ? [
              {
                accountNumber: derivativesAccount.accountNumber,
                summary: derivativesAccountSummary,
                portfolioList:
                  responseDerivativesPosition?.data.openPositionList ?? [],
                type: SystemType.DERIVATIVES,
              },
            ]
          : [];

      portfolioList = [
        ...portfolioList,
        ...equityPortfolio,
        ...derivativesPortfolio,
      ];
      portfolioList = portfolioList.map((val) => {
        const portfolioIICA = portfolioListIICA?.find(
          (p) => p.accountNumber === val.accountNumber
        );
        return {
          ...val,
          summary: {
            ...val.summary,
            ...portfolioIICA?.summary,
          },
        };
      });

      if (request.response) {
        yield put<IAction<IPortfoliosReducer[]>>({
          type: request.response.success,
          payload: portfolioList,
        });
      }
    } else {
      // Get data for portfolio account
      const accountIICA = store.accountList.find(
        (val) => val.accountNumber === request.payload.accountNumber
      );
      let portfolioIICA: {
        readonly accountNumber: string;
        readonly type: SystemType;
        readonly summary: Partial<
          | IEquityEnquiryPortfolioAccountSummaryResponse
          | IDerivativesAccountSummaryDetail
        >;
      } | null = null;

      if (accountIICA != null) {
        portfolioIICA = yield call(doEnquiryPortfolioIICA, accountIICA);
      }

      if (request.payload.type === SystemType.DERIVATIVES) {
        const responseDerivativesSummary: IResponse<IDerivativesPortfolioResponse> = yield call(
          queryDerivativesSummary,
          { accountNo: request.payload.accountNumber }
        );

        const responseDerivativesPosition: IResponse<IDerivativesPortfolioPositionResponse> = yield call(
          queryDerivativesPortfolio,
          {
            accountNo: request.payload.accountNumber,
          }
        );

        const minPP = Math.min(
          Number(responseDerivativesSummary?.data.cashInformation.internal.EE),
          Number(responseDerivativesSummary?.data.cashInformation.exchange.EE)
        );
        const minAccountRatio = Math.max(
          Number(
            responseDerivativesSummary?.data.portfolioAssessment.internal
              .accountRatio
          ),
          Number(
            responseDerivativesSummary?.data.portfolioAssessment.exchange
              .accountRatio
          )
        );

        const total: IDerivativesPortfoliosReducer['totalOpenPosition'] = responseDerivativesPosition.data.openPositionList.reduce(
          (acc, curr) => ({
            floatingPL: acc.floatingPL + curr.floatingPL,
          }),
          {
            floatingPL: 0,
          }
        );

        if (request.response) {
          yield put<IAction<IDerivativesPortfoliosReducer>>({
            type: request.response.success,
            payload: {
              accountNumber: request.payload.accountNumber,
              summary: {
                ...responseDerivativesSummary.data.accountSummary,
                ...portfolioIICA?.summary,
              },
              openPositionList:
                responseDerivativesPosition.data.openPositionList,
              closePositionList:
                responseDerivativesPosition.data.closePositionList,
              totalOpenPosition: total,
              minPP,
              minAccountRatio,
              type: SystemType.DERIVATIVES,
            },
          });
        }
      } else {
        const response: IResponse<
          IEquityEnquiryPortfolioPerSubAccResponse[]
        > = yield call(queryEquityPortfolio, request.payload);

        const total: IEquityPortfoliosReducer['total'] = response.data[0].portfolioList.reduce(
          (val, curr) => {
            const valueUnrealizedPL =
              val.unrealizedPLValue + curr.unrealizedPLValue;
            const totalValue = val.value + curr.value;
            return {
              awaitTrading: val.awaitTrading + curr.awaitTrading,
              avgPrice: val.avgPrice + curr.avgPrice,
              value: val.value + curr.value,
              marketValue: val.marketValue + curr.marketValue,
              lendingRate: val.lendingRate + curr.lendingRate,
              unrealizedPLValue: val.unrealizedPLValue + curr.unrealizedPLValue,
              unrealizedPLPercent: (valueUnrealizedPL / totalValue) * 100,
              weight: '100%',
            };
          },
          {
            awaitTrading: 0,
            avgPrice: 0,
            value: 0,
            marketValue: 0,
            lendingRate: 0,
            unrealizedPLValue: 0,
            unrealizedPLPercent: 0,
            weight: '0',
          }
        );

        if (request.response) {
          yield put<IAction<IEquityPortfoliosReducer>>({
            type: request.response.success,
            payload: {
              ...response.data[0],
              total,
              type: SystemType.EQUITY,
              summary: {
                ...response.data[0].summary,
                ...portfolioIICA?.summary,
              },
            },
          });
        }
      }
    }
  } catch (error) {
    console.error('Query Portfolio', error);
    yield put({
      type: request.response?.failed,
      payload: error.code || error.message,
    });

    yield put<IAction<INotification>>({
      type: COMMON_SHOW_NOTIFICATION,
      payload: {
        type: ToastType.ERROR,
        title: 'Enquiry Portfolio',
        content: error.code || error.message,
        contentParams: error.messageParams,
        time: new Date(),
      },
    });
  }
}

function* doEnquiryPortfolioIICA(account?: IAccount) {
  let portfolio: {
    readonly accountNumber: string;
    readonly type: SystemType;
    readonly summary: Partial<
      | IEquityEnquiryPortfolioAccountSummaryResponse
      | IDerivativesAccountSummaryDetail
    >;
  } | null = {
    accountNumber: account?.accountNumber ?? '',
    type: account?.type ?? SystemType.EQUITY,
    summary: {},
  };

  try {
    if (account?.isIICA) {
      const response: IMASEquityPortfolioResponse = yield call(
        queryEquityPortfolioIICA,
        {
          subAccountID: account.accountNumber,
        }
      );

      const summary: Partial<
        | IEquityEnquiryPortfolioAccountSummaryResponse
        | IDerivativesAccountSummaryDetail
      > = {
        totalStockMarketValue: formatStringToNumber(
          response.mvPortfolioAccSummaryBean?.stockValue
        ),
        PP: formatStringToNumber(
          response.mvPortfolioAccSummaryBean?.mvBuyingPowerd
        ),
        netAssetValue:
          formatStringToNumber(
            response.mvPortfolioAccSummaryBean?.mvBuyingPowerd
          ) +
          formatStringToNumber(response.mvPortfolioAccSummaryBean?.totalAsset),
        totalAsset:
          formatStringToNumber(
            response.mvPortfolioAccSummaryBean?.mvBuyingPowerd
          ) +
          formatStringToNumber(response.mvPortfolioAccSummaryBean?.totalAsset),
      };

      portfolio = {
        accountNumber: account.accountNumber,
        type: account.type,
        summary,
      };
    }
  } catch (error) {
    console.error('Portfolio IICA Error', error);
  }

  return portfolio;
}

export function* watchEnquiryPortfolio() {
  yield takeLatest(ACCOUNT_QUERY_EQUITY_PORTFOLIO, doEnquiryPortfolio);
  yield takeLatest(ACCOUNT_QUERY_DERIVATIVES_PORTFOLIO, doEnquiryPortfolio);
}

export function* watchEnquiryPortfolios() {
  yield takeLatest(ACCOUNT_QUERY_PORTFOLIOS, doEnquiryPortfolio);
}
