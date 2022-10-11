/* eslint-disable */

import { LibrarySymbolInfo, SearchSymbolResultItem } from '../datafeed-api';
import { INewSymbolData } from 'interfaces/market';
import store from 'redux/store';
import { Lang, SymbolType } from 'constants/enum';
import { Global } from 'constants/main';

interface SymbolInfoMap {
  [symbol: string]: IMultiLangSymbolInfo | undefined;
}

interface IMultiLangSymbolInfo extends LibrarySymbolInfo {
  nameInLang: { [s: string]: string };
}

export class SymbolsStorage {
  private lastestModified: string | null = null;
  private _symbolsInfo: SymbolInfoMap = {};
  private _symbolsInfoByName: SymbolInfoMap = {};
  private _symbolsList: string[] = [];
  private readonly _readyPromise: Promise<void>;
  private readonly _supportedResolutions: string[];

  public constructor(_supportedResolutions: string[]) {
    this._supportedResolutions = _supportedResolutions;
    this._readyPromise = this.init();
    this._readyPromise.catch((error: Error) => {
      // seems it is impossible
      console.error(`SymbolsStorage: Cannot init, error=${error.toString()}`);
    });
  }

  // BEWARE: this function does not consider symbol's exchange
  public resolveSymbol(symbolName: string): Promise<LibrarySymbolInfo> {
    console.log('resolveSymbol', symbolName);
    return this._readyPromise.then(() => {
      let symbolInfo = this._symbolsInfo[symbolName];
      if (symbolInfo === undefined) {
        symbolInfo = this._symbolsInfoByName[symbolName];
      }
      if (symbolInfo === undefined) {
        return Promise.reject('invalid symbol');
      }

      return Promise.resolve(symbolInfo);
    });
  }

  public searchSymbols(
    searchString: string,
    exchange: string,
    symbolType: string,
    maxSearchResults: number
  ): Promise<SearchSymbolResultItem[]> {
    interface WeightedItem {
      symbolInfo: LibrarySymbolInfo;
      weight: number;
    }

    return this._readyPromise.then(() => {
      const weightedResult: WeightedItem[] = [];
      const queryIsEmpty = searchString.length === 0;

      searchString = searchString.toUpperCase();

      for (const symbolName of this._symbolsList) {
        let symbolInfo = this._symbolsInfoByName[symbolName];

        if (symbolInfo === undefined) {
          symbolInfo = this._symbolsInfo[symbolName];
        }

        if (symbolInfo === undefined) {
          continue;
        }

        if (
          symbolType?.length > 0 &&
          symbolInfo.type !== symbolType.toUpperCase()
        ) {
          continue;
        }

        if (
          exchange &&
          exchange.length > 0 &&
          symbolInfo.exchange !== exchange
        ) {
          continue;
        }

        const positionInName = symbolInfo.name
          .toUpperCase()
          .indexOf(searchString);
        const positionInDescription = symbolInfo.description
          .toUpperCase()
          .indexOf(searchString);

        if (queryIsEmpty || positionInName >= 0 || positionInDescription >= 0) {
          const alreadyExists = weightedResult.some(
            (item: WeightedItem) => item.symbolInfo === symbolInfo
          );
          if (!alreadyExists) {
            const weight =
              positionInName >= 0
                ? positionInName
                : 8000 + positionInDescription;
            weightedResult.push({ symbolInfo: symbolInfo, weight: weight });
          }
        }
      }

      const result = weightedResult
        .sort(
          (item1: WeightedItem, item2: WeightedItem) =>
            item1.weight - item2.weight
        )
        .slice(0, maxSearchResults)
        .map((item: WeightedItem) => {
          const symbolInfo = item.symbolInfo;
          return {
            symbol: symbolInfo.name,
            full_name: symbolInfo.full_name,
            description: symbolInfo.description,
            exchange: symbolInfo.exchange,
            params: [],
            type: symbolInfo.type,
            ticker: symbolInfo.name,
          };
        });

      return Promise.resolve(result);
    });
  }

  public init(
    stockList?: INewSymbolData[],
    cwList?: INewSymbolData[],
    indexList?: INewSymbolData[],
    futuresList?: INewSymbolData[]
  ): Promise<void> {
    this._symbolsInfo = {};
    this._symbolsInfoByName = {};
    this._symbolsList = [];
    stockList &&
      stockList.forEach((item) => this._processItem(item, '0900-1500'));
    indexList &&
      indexList.forEach((item) => {
        if (item.it === 'F') {
          return;
        }
        this._processItem(item, '0900-1500');
      });
    cwList && cwList.forEach((item) => this._processItem(item, '0900-1500'));
    futuresList &&
      futuresList.forEach((item) => this._processItem(item, '0845-1445'));
    this._loadAdditionalCode();
    // console.log('init ', stockList && stockList.length, cwList && cwList.length);
    return Promise.resolve();
  }

  public reInitLang(lang: string) {
    this._symbolsInfoByName = {};
    this._symbolsList = [];
    Object.keys(this._symbolsInfo).forEach((key: string) => {
      const item = this._symbolsInfo[key]!;
      let symbolName = item.nameInLang[lang];
      if (symbolName == null) {
        symbolName = item.nameInLang[Lang.EN];
      }
      if (symbolName == null) {
        symbolName = item.nameInLang[Lang.VI];
      }
      const fullName = item.exchange + ':' + symbolName;
      item.base_name = [fullName];
      item.description = fullName;

      this._symbolsInfoByName[symbolName] = item;
      this._symbolsInfoByName[fullName] = item;
      this._symbolsList.push(item.ticker!);
      this._symbolsList.push(symbolName);
    });
  }

  private _processItem = (data: INewSymbolData, session: string) => {
    try {
      const symbolName =
        store.getState().lang === Lang.VI ? data.n1! : data.n2!;
      const listedExchange = data.m!;
      const tradedExchange = data.m!;
      const fullName = tradedExchange + ':' + symbolName;

      const ticker = data.s;

      const symbolInfo: IMultiLangSymbolInfo = {
        nameInLang: {
          [Lang.VI]: data.n1!,
          [Lang.EN]: data.n2!,
          [Lang.KO]: data.n2!,
          [Lang.ZH]: data.n2!,
        },
        ticker: ticker,
        name: ticker,
        base_name: [listedExchange + ':' + symbolName],
        full_name: fullName,
        listed_exchange: listedExchange,
        exchange: tradedExchange,
        description: fullName,
        has_intraday: true,
        has_no_volume: false,
        minmov: 1,
        minmove2: 0,
        pricescale: 100,
        type: data.t != null ? data.t.toString() : '',
        session: session,
        timezone: 'Asia/Bangkok',
        supported_resolutions: this._supportedResolutions,
        has_daily: true,
        intraday_multipliers: ['1', '5', '15', '30', '60'],
        has_weekly_and_monthly: true,
        has_empty_bars: false,
        volume_precision: 0,
      };

      this._symbolsInfo[ticker] = symbolInfo;
      this._symbolsInfoByName[symbolName] = symbolInfo;
      this._symbolsInfoByName[fullName] = symbolInfo;

      this._symbolsList.push(ticker);
      this._symbolsList.push(symbolName);
    } catch (error) {
      console.error(error);
      throw new Error(
        `SymbolsStorage: API error when processing item ${JSON.stringify(data)}`
      );
    }
  };

  private _loadAdditionalCode = () => {
    if (Global.config!.tvAdditionalCodeUrl == null) {
      return;
    }
    const headers = new Headers();

    headers.append('pragma', 'no-cache');
    headers.append('cache-control', 'no-cache');

    if (this.lastestModified != null) {
      headers.append('If-Modified-Since', this.lastestModified);
    }
    const process = this._processItem;
    fetch(Global.config!.tvAdditionalCodeUrl, {
      method: 'GET',
      headers,
    })
      .then((res) => {
        this.lastestModified = res.headers.get('Last-Modified');
        if (res.status === 304) {
          return;
        }
        res.json().then((arr: INewSymbolData[]) => {
          arr.forEach((item) =>
            process(
              item,
              item.t === SymbolType.FUTURES ? '0845-1445' : '0900-1500'
            )
          );
        });
      })
      .catch((err) => console.error('loadSymbolList', err));
  };
}
