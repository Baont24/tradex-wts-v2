import {
  ACCOUNT_ASSET_INFORMATION,
  COMMON_SHOW_NOTIFICATION,
} from 'redux/actions';
import { IAction, INotification } from 'interfaces/common';
import {
  IAssetInformationParams,
  IAssetInformationResponse,
  IEquityAssetInfoMarginCallByResponse,
  IEquityEnquiryPortfolioPerSubAccResponse,
} from 'interfaces/api';
import { IMASEquityPortfolioResponse } from 'interfaces/apiTTL';
import { IState } from 'redux/global-reducers';
import { ToastType } from 'react-toastify';
import { call, put, select, takeLatest } from 'redux-saga/effects';
import { formatStringToNumber, multiplyBy1000, roundDown } from 'utils/common';
import { query, queryRestTTL } from 'utils/socketApi';
import config from 'config';

const getAssetInformation = (params: IAssetInformationParams) => {
  return query(config.apis.equityAssetInformation, params);
};

// filed cho Total Stock Market Value
const queryEquityPortfolio = (params: { readonly accountNumber: string }) => {
  return query(config.apis.queryEquityPortfolio, params);
};

// 2 fields marginCallByStockMainAmt & marginCallByCash lấy từ api get:/api/v1/services/eqt/accountbalance
const getAssetInfoMarginCallBy = (params: IAssetInformationParams) => {
  return query(config.apis.equityAssetInfoMarginCallBy, params);
};

const queryEquityPortfolioIICA = (params: {
  readonly subAccountID: string;
}) => {
  return queryRestTTL(config.apis.equityPortfolioIICA, params);
};

function* doGetAssetInformation(request: IAction<IAssetInformationParams>) {
  try {
    const store: IState = yield select((s: IState) => ({
      selectedAccount: s.selectedAccount,
    }));

    let response: { data?: IAssetInformationResponse } | null = null;
    response = yield call(getAssetInformation, request.payload);

    let responseMarginCallBy: {
      data?: IEquityAssetInfoMarginCallByResponse;
    } | null = null;
    responseMarginCallBy = yield call(
      getAssetInfoMarginCallBy,
      request.payload
    );

    const marginCallBy = {
      marginCallByCash: responseMarginCallBy?.data?.marginCallByCash ?? 0,
      marginCallByStockMainAmount:
        responseMarginCallBy?.data?.marginCallByStockMainAmount ?? 0,
    };

    if (store.selectedAccount?.isIICA) {
      const responseMASEquityPortfoIICA: IMASEquityPortfolioResponse = yield call(
        queryEquityPortfolioIICA,
        {
          subAccountID: request.payload.accountNumber,
        }
      );

      const { mvPortfolioAccSummaryBean } = responseMASEquityPortfoIICA;
      const accountIICA = {
        totalAsset: multiplyBy1000(
          formatStringToNumber(mvPortfolioAccSummaryBean?.totalAsset) +
            formatStringToNumber(mvPortfolioAccSummaryBean?.mvBuyingPowerd)
        ),
        totalStockMarketValue: multiplyBy1000(
          mvPortfolioAccSummaryBean?.stockValue
        ),
        netAssetValue: multiplyBy1000(
          formatStringToNumber(mvPortfolioAccSummaryBean?.totalAsset) +
            formatStringToNumber(mvPortfolioAccSummaryBean?.mvBuyingPowerd)
        ),
        purchasingPower: multiplyBy1000(
          mvPortfolioAccSummaryBean?.mvBuyingPowerd
        ),
        cashWithdrawal: multiplyBy1000(
          mvPortfolioAccSummaryBean?.mvBuyingPowerd
        ),
        availableAdvancedCash: multiplyBy1000(
          mvPortfolioAccSummaryBean?.CTodayConfirmSell
        ),
      };
      let accountSummary: Partial<
        IAssetInformationResponse['accountSummary']
      > = { ...response?.data?.accountSummary };
      if (accountSummary !== null) {
        const totalAsset = String(accountIICA.totalAsset);
        const totalStockMarketValue = Number(accountIICA.totalStockMarketValue);
        const netAssetValue = accountIICA.netAssetValue;
        accountSummary = {
          ...accountSummary,
          totalAsset,
          totalStockMarketValue,
          netAssetValue,
        };
      }

      let cashInformation: Partial<
        IAssetInformationResponse['cashInformation']
      > = {
        ...response?.data?.cashInformation,
      };
      if (cashInformation !== null) {
        const cashWithdrawal = accountIICA.cashWithdrawal;
        const availableAdvancedCash = accountIICA.availableAdvancedCash;
        cashInformation = {
          ...cashInformation,
          cashWithdrawal,
          availableAdvancedCash,
        };
      }
      let buyingPower: Partial<IAssetInformationResponse['buyingPower']> = {
        ...response?.data?.buyingPower,
      };
      if (buyingPower !== null) {
        const purchasingPower = accountIICA.purchasingPower;
        buyingPower = { ...buyingPower, purchasingPower };
      }

      const total = { marketValue: accountIICA.totalStockMarketValue };
      if (request.response) {
        yield put<IAction<Partial<IAssetInformationResponse>>>({
          type: request.response?.success,
          payload: {
            ...response?.data,
            marginCallBy,
            total,
            accountSummary,
            cashInformation,
            buyingPower,
          },
        });
      }
    } else {
      const responseTotalStockMarketValue: {
        data: IEquityEnquiryPortfolioPerSubAccResponse[];
      } = yield call(queryEquityPortfolio, request.payload);

      const total = responseTotalStockMarketValue.data[0].portfolioList.reduce(
        (val, curr) => {
          return {
            marketValue: val.marketValue + curr.marketValue,
          };
        },
        {
          marketValue: 0,
        }
      );

      if (request.response) {
        yield put<IAction<Partial<IAssetInformationResponse>>>({
          type: request.response.success,
          payload: {
            ...response?.data,
            cashInformation: roundDown(
              ['cashWithdrawal'],
              response?.data?.cashInformation
            ),
            marginCallBy,
            total,
          },
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

    yield put<IAction<INotification>>({
      type: COMMON_SHOW_NOTIFICATION,
      payload: {
        type: ToastType.ERROR,
        title: 'Asset information Equity',
        content: error.code || error.message,
        contentParams: error.messageParams,
        time: new Date(),
      },
    });
  }
}

export function* watchGetAssetInformation() {
  yield takeLatest(ACCOUNT_ASSET_INFORMATION, doGetAssetInformation);
}
