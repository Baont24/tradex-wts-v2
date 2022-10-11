import { IBoardTab, IWatchlist } from 'interfaces/common';
import { INewSymbolData, ISymbolList } from 'interfaces/market';
import { IState } from 'redux/global-reducers';
import { SymbolType } from 'constants/enum';
// import { domainConfig } from 'config/domain';
// import config from 'config';

export const getCurrentTab = (
  key: string | undefined,
  watchlist: IWatchlist[],
  boardTabs: IState['config']['boardTabs']
): IBoardTab => {
  const defaultTab = boardTabs.find((val) => val.default) ?? boardTabs[1];

  const defaultSubTab =
    defaultTab?.data?.find((val) => val.default) ?? boardTabs[1].data?.[1];

  let marketTab = boardTabs.find(
    (tab) =>
      (key && tab.route?.toLowerCase() === key.toLowerCase()) ||
      tab.data?.find(
        (subTab) => key && subTab.route?.toLowerCase() === key.toLowerCase()
      ) != null
  );

  let subMarketTab = marketTab?.data?.find(
    (val) => key && val.route?.toLowerCase() === key.toLowerCase()
  );

  if (marketTab == null) {
    const selectedWatchlist = watchlist.find(
      (val) => key && val.id.toString() === key.toLowerCase()
    );

    if (selectedWatchlist != null) {
      marketTab = {
        key: 'WATCHLIST',
        data: watchlist.map((val) => ({
          title: val.name,
          key: val.id.toString(),
          data: val.data,
        })),
      };
      subMarketTab = {
        title: selectedWatchlist.name,
        key: selectedWatchlist.id.toString(),
        route: selectedWatchlist.id.toString(),
      };
    }
  }

  const selectedTab = marketTab ?? defaultTab;
  const selectedSubTab =
    marketTab?.key === 'WATCHLIST' || !key
      ? subMarketTab ?? defaultSubTab
      : subMarketTab;

  return {
    ...selectedTab,
    selectedSubTab,
  };
};

export const getCurrentSymbols = (
  symbolList: ISymbolList,
  stockList: INewSymbolData[],
  cwList: INewSymbolData[],
  futuresList: INewSymbolData[],
  watchlist: IWatchlist[],
  selectedWatchlist: IWatchlist | null,
  selectedTab: IBoardTab
) => {
  let symbols: INewSymbolData[] = [];
  const { selectedSubTab } = selectedTab;

  if (selectedTab.key === 'WATCHLIST') {
    symbols =
      selectedWatchlist?.data?.map(
        (val) => symbolList.map?.[val] || { s: val }
      ) || [];
  } else if (
    selectedTab.key === 'HNX' ||
    selectedTab.key === 'HOSE' ||
    selectedTab.key === 'UPCOM'
  ) {
    symbols =
      selectedSubTab?.key.split('-')[1] === SymbolType.INDEX
        ? []
        : stockList.filter(
            (val) => val.m === selectedTab.market && val.t !== SymbolType.ETF
            // /(domainConfig[config.domain]?.indexAgCellValue as boolean)
            //   ? val.m === selectedTab.market && val.t !== SymbolType.ETF
            //   : val.m === selectedTab.market
          );
  } else if (selectedTab.key === 'CW') {
    const underlyingStocks = cwList.map((val) => val.b);
    const stocks = underlyingStocks.filter(
      (val, idx) => val && underlyingStocks.indexOf(val) === idx
    );
    const stockData = stocks.map((val) => val != null && symbolList.map?.[val]);
    symbols = [...cwList, ...(stockData.filter(Boolean) as INewSymbolData[])];
  } else if (selectedTab.key === 'FUTURES') {
    symbols = futuresList.filter((val) => val.bs === selectedSubTab?.key);
  } else if (selectedTab.key === 'FUND') {
    symbols = [];
  } else if (selectedTab.key === 'BOND') {
    symbols = [];
  } else if (selectedTab.key === 'All') {
    symbols = symbolList.array;
  } else if (selectedTab.key === 'Oddlot') {
    symbols = stockList.filter((val) => val.m === selectedSubTab?.key);
  } else if (selectedTab.key === 'ETF') {
    symbols = stockList.filter((val) => val.t === SymbolType.ETF);
  }
  // } else if (
  //   selectedTab.key === 'ETF' &&
  //   (domainConfig[config.domain]?.indexAgCellValue as boolean)
  // ) {
  //   symbols =
  //     selectedSubTab?.key === Market.HOSE
  //       ? stockList.filter(
  //           (val) => val.t === SymbolType.ETF && val.m === Market.HOSE
  //         )
  //       : stockList.filter(
  //           (val) => val.t === SymbolType.ETF && val.m === Market.HNX
  //         );
  // }
  return symbols;
};

export const getCurrentSymbolsMap = (
  symbols: INewSymbolData[]
): Record<string, INewSymbolData> =>
  symbols.reduce((mutableVal, curr) => ({ ...mutableVal, [curr.s]: curr }), {});
