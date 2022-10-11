import { BoardKey } from 'interfaces/common';
import { GridApi, RowNode } from 'ag-grid-community';
import { IMarketStatus, INewSymbolData } from 'interfaces/market';
import { IState } from 'redux/global-reducers';
import {
  MarketStatus,
  SymbolSession,
  SymbolType,
  SystemType,
} from 'constants/enum';
import { STOCK_BOARD_INFO } from 'constants/main';
import i18next from 'i18next';

export const getBoardData = (
  boardData: INewSymbolData[],
  tabKey: BoardKey,
  marketStatus: { readonly [s: string]: MarketStatus },
  symbolSession: { readonly [s: string]: SymbolSession }
) => {
  let data: INewSymbolData[] = boardData.map((val) => {
    return {
      ...val,
      ss: getSymbolSession(marketStatus, symbolSession, val, val.ss),
    };
  });

  // Set underlying data stock in CW
  if (tabKey === 'CW') {
    const stocks = data.filter((val) => val.t === SymbolType.STOCK);
    data = data
      .filter((val) => val.t === SymbolType.CW)
      ?.map((val) => {
        const stock = stocks.find((item) => item.s === val.b);
        return {
          ...val,
          bp: stock,
        };
      });
  }

  return data;
};

export const getSymbolSession = (
  marketStatus: { readonly [s: string]: MarketStatus },
  symbolSession: { readonly [s: string]: SymbolSession },
  data?: INewSymbolData,
  ss?: SymbolSession
) => {
  const typeName =
    (data?.t !== SymbolType.FUTURES ? SymbolType.STOCK : data.t) + data?.m;

  return data?.t && data?.m && marketStatus[typeName] !== MarketStatus.CLOSED
    ? ss || symbolSession[typeName]
    : undefined;
};

export const getMarketStatus = (marketStatus: IMarketStatus[]) => {
  const mutableSymbolSession: {
    [s: string]: SymbolSession;
  } = {};

  const mutableMarketStatus: {
    [s: string]: MarketStatus;
  } = {};

  marketStatus.forEach((val) => {
    const session =
      val.status === MarketStatus.ATO
        ? SymbolSession.ATO
        : val.status === MarketStatus.ATC
        ? SymbolSession.ATC
        : null;
    const futuresTypeName = SymbolType.FUTURES + val.market;
    const stockTypeName = SymbolType.STOCK + val.market;

    if (
      session &&
      (val.status === MarketStatus.ATO || val.status === MarketStatus.ATC)
    ) {
      if (val.type === SystemType.DERIVATIVES) {
        mutableSymbolSession[futuresTypeName] = session;
      } else {
        mutableSymbolSession[stockTypeName] = session;
      }
    }

    if (val.type === SystemType.DERIVATIVES) {
      mutableMarketStatus[futuresTypeName] = val.status;
    } else {
      mutableMarketStatus[stockTypeName] = val.status;
    }
  });

  return { session: mutableSymbolSession, status: mutableMarketStatus };
};

export const getRowNodeId = (data: INewSymbolData) => {
  return data.s;
};

export const getLastRowContent = (tabKey: BoardKey) => {
  return tabKey === 'WATCHLIST'
    ? `${i18next.t('Derivatives')}: ${i18next.t(
        STOCK_BOARD_INFO.FUTURES
      )} - ${i18next.t('Equity')}: ${i18next.t(STOCK_BOARD_INFO.STOCK)}`
    : tabKey === 'FUTURES'
    ? i18next.t(STOCK_BOARD_INFO.FUTURES)
    : tabKey === 'Oddlot'
    ? i18next.t(STOCK_BOARD_INFO.ODDLOT)
    : i18next.t(STOCK_BOARD_INFO.STOCK);
};

export const getNewSymbolData = (
  tabKey: BoardKey,
  symbolData: INewSymbolData,
  symbolCachedData: IState['symbolCachedData'],
  symbolSession: { readonly [s: string]: SymbolSession },
  marketStatus: { readonly [s: string]: MarketStatus },
  gridApi?: GridApi
) => {
  const mutableNodes: INewSymbolData[] = [];
  const rowNode = gridApi?.getRowNode(symbolData.s);
  if (rowNode) {
    const rowData = symbolCachedData[symbolData.s];
    const rowNodeData = rowNode.data as INewSymbolData;
    let data: INewSymbolData = { s: symbolData.s };
    let newSymbolData = symbolData;

    if (Object.keys(symbolData.fr || {}).length === 0) {
      const { fr, ...rest } = symbolData;
      newSymbolData = rest;
    }

    if (rowData) {
      data = {
        ...rowData,
        ...data,
        ...newSymbolData,
        ...(newSymbolData.re && { re: newSymbolData.re }),
        ...(newSymbolData.ce && { ce: newSymbolData.ce }),
        ...(newSymbolData.fl && { fl: newSymbolData.fl }),
        ...(newSymbolData.tb && { tb: newSymbolData.tb }),
        ...(newSymbolData.to && { to: newSymbolData.to }),
        ss: getSymbolSession(
          marketStatus,
          symbolSession,
          rowData,
          newSymbolData.ss
        ),
        ...(newSymbolData.t === SymbolType.CW && { bp: rowNodeData.bp }),
      };
    }
    mutableNodes.push(data);
  } else if (tabKey === 'CW' && symbolData.t === SymbolType.STOCK) {
    // Set underlying realtime data stock in CW
    gridApi?.forEachNode((node) => {
      const data = symbolCachedData[(node.data as INewSymbolData).s];
      if (data != null && data.b === symbolData?.s) {
        const baseCodeData: INewSymbolData | undefined =
          symbolCachedData[(node.data as INewSymbolData).b ?? ''];
        const bp: INewSymbolData = {
          ...baseCodeData,
          ...symbolData,
          ss: getSymbolSession(
            marketStatus,
            symbolSession,
            data.bp,
            symbolData?.ss
          ),
        };
        mutableNodes.push({ ...data, bp });
      }
    });
  }

  return mutableNodes;
};

export const updatePinnedRowData = (
  tabKey: BoardKey,
  symbolData: INewSymbolData,
  symbolSession: { readonly [s: string]: SymbolSession },
  marketStatus: { readonly [s: string]: MarketStatus },
  updateData?: INewSymbolData,
  pinnedRows?: RowNode[],
  gridApi?: GridApi
) => {
  const rowNode = gridApi?.getRowNode(symbolData.s);
  if (pinnedRows == null || pinnedRows.length === 0) {
    return;
  }

  if (rowNode) {
    // Update data for pinned row
    const pinnedRow = pinnedRows.find((val) => val.data.s === updateData?.s);
    if (pinnedRow != null) {
      pinnedRow.updateData(updateData);
    }
  } else if (tabKey === 'CW' && symbolData.t === SymbolType.STOCK) {
    // Update data for pinned rows
    const stockPinnedRows = pinnedRows.filter(
      (val) => val.data.b === symbolData?.s
    );
    if (stockPinnedRows && stockPinnedRows.length > 0) {
      stockPinnedRows.forEach((val) => {
        const data = val.data as INewSymbolData;
        const updatedData: INewSymbolData = {
          ...data,
          bp: {
            ...data.bp,
            ...symbolData,
            s: data.b || '',
            ss: getSymbolSession(
              marketStatus,
              symbolSession,
              data.bp,
              symbolData?.ss
            ),
          },
        };
        val.updateData(updatedData);
      });
    }
  }
};
