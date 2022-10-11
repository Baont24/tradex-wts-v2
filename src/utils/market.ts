import { Big } from 'big.js';
import { BoardMarketRoutes } from 'constants/routes';
import { INewSymbolData } from 'interfaces/market';
import { Market, SellBuyType, SymbolType, SystemType } from 'constants/enum';
import config from '../config';

export function getSystemType(symbolType?: SymbolType) {
  if (
    symbolType === SymbolType.STOCK ||
    symbolType === SymbolType.CW ||
    symbolType === SymbolType.ETF ||
    symbolType === SymbolType.FUND
  ) {
    return SystemType.EQUITY;
  } else if (symbolType === SymbolType.FUTURES) {
    return SystemType.DERIVATIVES;
  }
  return null;
}

export function isStockSymbol(symbolType?: SymbolType) {
  if (
    symbolType === SymbolType.STOCK ||
    symbolType === SymbolType.ETF ||
    symbolType === SymbolType.FUND
  ) {
    return true;
  } else {
    return false;
  }
}

export function symbolToRoute(symbol?: INewSymbolData) {
  let route: BoardMarketRoutes | undefined;
  if (symbol == null) {
    return;
  }

  if (isStockSymbol(symbol.t)) {
    if (symbol.m === Market.HOSE) {
      route = BoardMarketRoutes.HOSE;
    } else if (symbol.m === Market.HNX) {
      route = BoardMarketRoutes.HNX;
    } else if (symbol.m === Market.UPCOM) {
      route = BoardMarketRoutes.UPCOM;
    }
  } else {
    if (symbol.t === SymbolType.CW) {
      route = BoardMarketRoutes.CW;
    } else if (symbol.t === SymbolType.FUTURES) {
      if (symbol.bs === SymbolType.INDEX) {
        route = BoardMarketRoutes.FUTURES;
      } else if (symbol.bs === SymbolType.BOND) {
        route = BoardMarketRoutes.FUTURES_BOND;
      }
    }
  }

  return route;
}

export function getPriceStep(
  price: number,
  market?: Market,
  secType?: SymbolType,
  baseSecType?: SymbolType
) {
  if (secType === SymbolType.CW) {
    return 10;
  } else if (secType === SymbolType.ETF) {
    if (market === Market.HOSE) {
      return 10;
    } else if (market === Market.HNX) {
      return 1;
    } else {
      return 1;
    }
  } else if (secType === SymbolType.FUTURES) {
    if (baseSecType === SymbolType.INDEX) {
      return 0.1;
    } else if (baseSecType === SymbolType.BOND) {
      return 1;
    } else {
      return 0.1;
    }
  } else {
    if (market === Market.HOSE) {
      if (price < 10000) {
        return 10;
      } else if (price >= 10000 && price < 50000) {
        return 50;
      } else {
        return 100;
      }
    } else if (market === Market.HNX || market === Market.UPCOM) {
      return 100;
    } else {
      return 100;
    }
  }
}

export function getFuturesPriceStep(securitiesType?: SymbolType) {
  if (securitiesType === SymbolType.INDEX) {
    return 0.1;
  } else if (securitiesType === SymbolType.BOND) {
    return 1;
  } else {
    return 0.1;
  }
}

export function roundStep(value?: number, step?: number) {
  if (
    value != null &&
    step != null &&
    !isNaN(value) &&
    !isNaN(step) &&
    step > 0
  ) {
    return Number(
      Big(Math.round((value - step) / step) * step + step).toFixed(2)
    );
  } else {
    return 0;
  }
}

export function roundLot(
  value: number,
  market?: Market,
  symbolType?: SymbolType,
  reverse?: boolean,
  useMinLot?: boolean,
  disableRound?: boolean,
  isRaw?: boolean,
  sellBuyType?: SellBuyType
) {
  if (symbolType == null || market == null) {
    return value;
  }

  if (symbolType === SymbolType.FUTURES) {
    if (isRaw === true) {
      return value;
    }
    if (value > 500) {
      if (reverse === true) {
        return value - 500;
      }
      return 500;
    }
    return Math.ceil(value);
  } else {
    const step = 100;
    let result =
      sellBuyType === SellBuyType.SELL
        ? Math.floor(value / step) * step
        : Math.round(value / step) * step;

    if (reverse === true) {
      return value - result;
    }

    if (value > 0 && result === 0 && useMinLot === true) {
      result = getMinLot(market);
    }

    if (disableRound === true) {
      return value;
    }

    return result;
  }
}

export function getMinLot(
  market?: Market,
  symbolType?: SymbolType,
  isOddLot?: boolean
) {
  if (isOddLot) {
    return 99;
  }
  if (symbolType === SymbolType.FUTURES) {
    return 1;
  } else {
    return 100;
  }
}

export function getTradingMultiplier(
  symbolType: SymbolType,
  baseCodeSecuritiesType?: SymbolType
) {
  if (symbolType === SymbolType.STOCK) {
    return 1;
  } else if (symbolType === SymbolType.FUTURES) {
    if (baseCodeSecuritiesType === SymbolType.INDEX) {
      return 100000;
    } else if (baseCodeSecuritiesType === SymbolType.BOND) {
      return 10000;
    } else {
      return 100000;
    }
  } else if (symbolType === SymbolType.CW) {
    return 1;
  } else {
    return 1;
  }
}

export function refreshMarketTimeout() {
  let timeout = 0;
  const date = new Date();
  const minRandomTime = config.schedules.refreshBoardRange[0];
  const maxRandomTime = config.schedules.refreshBoardRange[1];
  const randomTime = Math.round(
    (Math.random() * (maxRandomTime - minRandomTime) + minRandomTime) * 60000
  );
  const currentUtcTime: number =
    (date.getUTCHours() * 60 + date.getMinutes()) * 60000;
  const openTime =
    (config.schedules.refreshBoardOpen[0] * 60 +
      config.schedules.refreshBoardOpen[1]) *
    60000;
  const closeTime =
    (config.schedules.refreshBoardClose[0] * 60 +
      config.schedules.refreshBoardClose[1]) *
    60000;
  const openTimeLeft = openTime - currentUtcTime;
  const closeTimeLeft = closeTime - currentUtcTime;
  if (openTimeLeft >= 0) {
    timeout = openTimeLeft;
  } else if (openTimeLeft < 0 && closeTimeLeft >= 0) {
    timeout = closeTimeLeft;
  } else if (closeTimeLeft < 0) {
    const nextOpenTime = openTime + 86400000;
    timeout = nextOpenTime - currentUtcTime;
  }
  timeout += randomTime;
  return timeout;
}

export function getRefreshPageTime() {
  const date = new Date();
  const currentUtcTime: number =
    (date.getUTCHours() * 60 + date.getMinutes()) * 60000;
  const openTime =
    (config.schedules.refreshPage[0] * 60 + config.schedules.refreshPage[1]) *
    60000;
  let timeout = openTime - currentUtcTime;
  if (timeout <= 0) {
    timeout = timeout + 86400000;
  }
  return timeout;
}

export function isSymbolTypeValid(
  systemType?: SystemType,
  symbolType?: SymbolType
) {
  return (
    (systemType === SystemType.DERIVATIVES &&
      symbolType === SymbolType.FUTURES) ||
    (systemType === SystemType.EQUITY && symbolType !== SymbolType.FUTURES)
  );
}
