import { OrderKind, SellBuyType, SymbolType } from 'constants/enum';

export const getPrice = (price?: number, symbolType?: SymbolType) =>
  price != null
    ? symbolType === SymbolType.FUTURES
      ? price
      : price / 1000
    : undefined;

export const getTitleModal = (
  sellBuyType: SellBuyType,
  orderKind: OrderKind
) => {
  let title = '';
  title =
    sellBuyType === SellBuyType.SELL
      ? orderKind === OrderKind.STOP_LIMIT_ORDER
        ? 'Place stop order sell'
        : 'Place order sell'
      : orderKind === OrderKind.STOP_LIMIT_ORDER
      ? 'Place stop order buy'
      : 'Place order buy';
  return title;
};
