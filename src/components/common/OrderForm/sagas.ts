import { IAction } from 'interfaces/common';
import {
  IDerivativesOrderMaxQtyParams,
  IDerivativesOrderMaxQtyResponse,
  IEquityEnquiryPortfolioPerSubAccResponse,
  IEquityOrderMaxQtyParams,
  IEquityOrderMaxQtyResponse,
  IEquityOrderStockInfoParams,
  IEquityOrderStockInfoResponse,
} from 'interfaces/api';
import { IEquityOrderStockInfoAction } from 'interfaces/actions';
import { IOrderStockInfo } from 'interfaces/reducers';
import { IState } from 'redux/global-reducers';
import {
  ORDER_QUERY_STOCK_INFO,
  ORDER_QUERY_STOCK_INFO_MAX_QTY,
  ORDER_QUERY_STOCK_INFO_MAX_QTY_SUCCESS,
  ORDER_QUERY_STOCK_INFO_MODAL,
  ORDER_QUERY_STOCK_INFO_MODAL_MAX_QTY,
  ORDER_QUERY_STOCK_INFO_MODAL_MAX_QTY_SUCCESS,
} from './actions';
import { SellBuyType, SymbolType, SystemType } from 'constants/enum';
import { call, put, select, takeLatest } from 'redux-saga/effects';
import { query } from 'utils/socketApi';
import config from 'config';

const queryEquityStockInfo = (params: IEquityOrderStockInfoParams) => {
  return query(config.apis.equityQueryStockInfo, params);
};

const queryEquityMaxQty = (params: IEquityOrderMaxQtyParams) => {
  return query(config.apis.equityQueryMaxQty, params);
};

const queryDerivativesMaxQty = (params: IDerivativesOrderMaxQtyParams) => {
  return query(config.apis.derivativesQueryMaxQty, params);
};

const queryEquityPortfolio = (params: { readonly accountNumber: string }) => {
  return query(config.apis.queryEquityPortfolio, params);
};

function* doGetOrderStockInfo(request: IAction<IEquityOrderStockInfoAction>) {
  try {
    const store: IState = yield select((state: IState) => ({
      accountList: state.accountList,
      orderStockInfo: state.orderStockInfo,
      equityPortfolio: state.equityPortfolio,
      derivativesPortfolio: state.derivativesPortfolio,
      assetInformation: state.assetInformation,
      symbolList: state.symbolList,
    }));

    const selectedAccount = store.accountList.find(
      (val) => val.accountNumber === request.payload.accountNumber
    );

    if (selectedAccount == null) {
      throw new Error('No account selected');
    }

    if (
      selectedAccount.type === SystemType.EQUITY &&
      store.symbolList.map?.[request.payload.symbolCode].t !==
        SymbolType.FUTURES &&
      store.symbolList.map?.[request.payload.symbolCode].t !==
        SymbolType.INDEX &&
      store.symbolList.map?.[request.payload.symbolCode].t !== SymbolType.BOND
    ) {
      const stockInfoParams: IEquityOrderStockInfoParams = {
        accountNumber: request.payload.accountNumber,
        market: request.payload.market,
        sellBuyType: request.payload.sellBuyType,
        symbolCode: request.payload.symbolCode,
      };

      let stockInfoResponse: {
        data?: IEquityOrderStockInfoResponse;
      } | null = null;
      let maxQty: number | undefined;
      let purchasingPower: number | undefined = store.orderStockInfo.data?.PP;

      if (!request.payload.onlyGetMaxQty) {
        stockInfoResponse = yield call(queryEquityStockInfo, stockInfoParams);
        purchasingPower = stockInfoResponse?.data?.PP;
      }

      if (request.payload.sellBuyType === SellBuyType.BUY) {
        const maxQtyParams: IEquityOrderMaxQtyParams = {
          market: request.payload.market,
          sellBuyType: request.payload.sellBuyType,
          symbolCode: request.payload.symbolCode,
          accountNo: request.payload.accountNumber,
          price: request.payload.price,
          PP: purchasingPower || 0,
        };

        const response: { data?: IEquityOrderMaxQtyResponse } = yield call(
          queryEquityMaxQty,
          maxQtyParams
        );
        maxQty = response.data?.maxQtty;
      } else {
        if (
          store.equityPortfolio.data?.accountNumber ===
          request.payload.accountNumber
        ) {
          maxQty = store.equityPortfolio.data?.portfolioList.find(
            (val) => val.symbol === request.payload.symbolCode
          )?.sellable;
        } else {
          const response: {
            data: IEquityEnquiryPortfolioPerSubAccResponse[];
          } = yield call(queryEquityPortfolio, {
            accountNumber: request.payload.accountNumber,
          });
          maxQty = response.data?.[0]?.portfolioList.find(
            (val) => val.symbol === request.payload.symbolCode
          )?.sellable;
        }
      }

      if (request.payload.onlyGetMaxQty) {
        yield put<IAction<number>>({
          type: request.payload.isModal
            ? ORDER_QUERY_STOCK_INFO_MODAL_MAX_QTY_SUCCESS
            : ORDER_QUERY_STOCK_INFO_MAX_QTY_SUCCESS,
          payload: maxQty || 0,
        });
      } else if (stockInfoResponse?.data != null && request.response != null) {
        yield put<IAction<IOrderStockInfo>>({
          type: request.response.success,
          payload: {
            market: request.payload.market,
            sellBuyType: request.payload.sellBuyType,
            symbolCode: request.payload.symbolCode,
            accountNumber: request.payload.accountNumber,
            price: request.payload.price,
            PP: purchasingPower || 0,
            marginRatio: stockInfoResponse.data.marginRatio,
            maxQty: maxQty || 0,
          },
        });
      }
    } else if (selectedAccount.type === SystemType.DERIVATIVES) {
      const params: IDerivativesOrderMaxQtyParams = {
        accountNumber: request.payload.accountNumber,
        sellBuyType: request.payload.sellBuyType,
        symbolCode: request.payload.symbolCode,
        price: request.payload.price,
      };

      const response: { data: IDerivativesOrderMaxQtyResponse } = yield call(
        queryDerivativesMaxQty,
        params
      );
      if (request.response != null) {
        yield put<IAction<IOrderStockInfo>>({
          type: request.response.success,
          payload: {
            market: request.payload.market,
            sellBuyType: request.payload.sellBuyType,
            symbolCode: request.payload.symbolCode,
            accountNumber: request.payload.accountNumber,
            price: request.payload.price,
            PP: 0,
            marginRatio: 0,
            maxQty:
              request.payload.sellBuyType === SellBuyType.BUY
                ? response.data.maxLong
                : response.data.maxShort,
          },
        });
      }
    }
  } catch (error) {
    if (request.response != null) {
      yield put<IAction<string>>({
        type: request.response.failed,
        payload: error.message,
      });
    }

    console.error('Query Order Max Qty', error);
  }
}

export function* watchGetOrderStockInfo() {
  yield takeLatest(ORDER_QUERY_STOCK_INFO, doGetOrderStockInfo);
  yield takeLatest(ORDER_QUERY_STOCK_INFO_MAX_QTY, doGetOrderStockInfo);
  yield takeLatest(ORDER_QUERY_STOCK_INFO_MODAL, doGetOrderStockInfo);
  yield takeLatest(ORDER_QUERY_STOCK_INFO_MODAL_MAX_QTY, doGetOrderStockInfo);
}
