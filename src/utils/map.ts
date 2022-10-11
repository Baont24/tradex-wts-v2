import {
  IDerivativesOrderBookResponse,
  IEquityOrderBookResponse,
} from 'interfaces/api';
import { IMatchingDataRecord } from 'interfaces/apiTTL';
import { IOrderBookReducer } from 'interfaces/reducers';
import { ISymbolQuote } from 'interfaces/market';
import { TIME_FORMAT_INPUT } from 'constants/main';
import {
  formatDateToString,
  formatStringToDate,
  formatTimeToUTC,
} from './datetime';

export const mapOrderBookData = (
  input: IEquityOrderBookResponse | IDerivativesOrderBookResponse
): IOrderBookReducer => {
  const equityData = input as IEquityOrderBookResponse;
  const derivativesData = input as IDerivativesOrderBookResponse;
  return {
    ...derivativesData,
    ...(equityData.accountNo != null && {
      accountNumber: equityData.accountNo,
    }),
    ...(equityData.buySellOrder != null && {
      sellBuyType: equityData.buySellOrder,
    }),
    ...(equityData.orderQty != null && { orderQuantity: equityData.orderQty }),
    ...(equityData.matchedQty != null && {
      matchedQuantity: equityData.matchedQty,
    }),
    ...(equityData.unmatchedQty != null && {
      unmatchedQuantity: equityData.unmatchedQty,
    }),
    ...(equityData.orderNo != null && { orderNumber: equityData.orderNo }),
  };
};

export const mapMatchingDataToQuote = (
  input: IMatchingDataRecord
): ISymbolQuote => {
  const timeUTC = formatTimeToUTC(
    formatStringToDate(input.mtim, TIME_FORMAT_INPUT),
    -14
  );
  const time = formatDateToString(new Date(timeUTC), TIME_FORMAT_INPUT);
  return {
    c: +input.curr,
    vo: +input.avol,
    ch: +input.diff,
    ra: +input.rate,
    o: +input.open,
    t: time,
    h: +input.high,
    l: +input.lowe,
    mv: Math.abs(+input.lvol),
  };
};
