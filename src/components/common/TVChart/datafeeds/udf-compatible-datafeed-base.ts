/* eslint-disable */

import {
  Bar,
  DatafeedConfiguration,
  ErrorCallback,
  GetMarksCallback,
  HistoryCallback,
  HistoryDepth,
  IDatafeedChartApi,
  IDatafeedQuotesApi,
  IExternalDatafeed,
  LibrarySymbolInfo,
  Mark,
  OnReadyCallback,
  QuoteData,
  QuotesCallback,
  ResolutionBackValues,
  ResolutionString,
  ResolveCallback,
  SearchSymbolResultItem,
  SearchSymbolsCallback,
  ServerTimeCallback,
  SubscribeBarsCallback,
  TimescaleMark,
} from '../datafeed-api';

import { getErrorMessage, logMessage, RequestParams, UdfErrorResponse } from './helpers';

import { GetBarsResult, HistoryProvider } from './history-provider';

import { IQuotesProvider } from './iquotes-provider';
import { Requester } from './requester';
import { INewSubscribeSymbol, INewSymbolData } from 'interfaces/market';
import { RealtimeChannelDataType, SymbolType } from 'constants/enum';
import { Global } from '../../../../constants/main';

export interface UdfCompatibleConfiguration extends DatafeedConfiguration {
  supports_search?: boolean;
  supports_group_request?: boolean;
}

export interface ResolveSymbolResponse extends LibrarySymbolInfo {
  s: undefined;
}

// it is hack to let's TypeScript make code flow analysis
export interface UdfSearchSymbolsResponse extends Array<SearchSymbolResultItem> {
  s?: undefined;
}

export const enum Constants {
  SearchItemsLimit = 30,
}

type UdfDatafeedMarkType<T extends TimescaleMark | Mark> = { [K in keyof T]: T[K] | T[K][] } & {
  id: (string | number)[];
};

type UdfDatafeedMark = UdfDatafeedMarkType<Mark>;
type UdfDatafeedTimescaleMark = UdfDatafeedMarkType<TimescaleMark>;

function extractField<Field extends keyof Mark>(data: UdfDatafeedMark, field: Field, arrayIndex: number): Mark[Field];
function extractField<Field extends keyof TimescaleMark>(
  data: UdfDatafeedTimescaleMark,
  field: Field,
  arrayIndex: number
): TimescaleMark[Field];
function extractField<Field extends keyof (TimescaleMark | Mark)>(
  data: UdfDatafeedMark | UdfDatafeedTimescaleMark,
  field: Field,
  arrayIndex: number
): (TimescaleMark | Mark)[Field] {
  const value = data[field];
  return Array.isArray(value) ? value[arrayIndex] : value;
}

/**
 * This class implements interaction with UDF-compatible datafeed.
 * See UDF protocol reference at https://github.com/tradingview/charting_library/wiki/UDF
 */
export class UDFCompatibleDatafeedBase implements IExternalDatafeed, IDatafeedQuotesApi, IDatafeedChartApi {
  protected _configuration: UdfCompatibleConfiguration = defaultConfiguration();
  private readonly _datafeedURL: string;
  private readonly _configurationReadyPromise: Promise<void>;
  public initPromise: Promise<boolean>;
  private _initResolve: Function;
  private readonly _historyProvider: HistoryProvider;
  private readonly _quotesProvider: IQuotesProvider;

  private readonly _requester: Requester;
  private readonly instanceId: number = Math.floor(new Date().getTime() + Math.random()) * 10000;
  private subscribeQuoteMap: { [key: string]: INewSubscribeSymbol[] } = {};
  private subscribeBarMap: { [key: string]: INewSubscribeSymbol } = {};
  private currentResolution: ResolutionString | null = null;
  private lastBar: Bar | null | undefined = null;
  private currentSymbol: string | null = null;
  private todayTimeInMs: number;
  private resolutionTime: number;

  private subscribeSymbol: (data: INewSubscribeSymbol) => void;
  private unSubscribeSymbol: (data: INewSubscribeSymbol) => void;

  constructor(
    datafeedURL: string,
    quotesProvider: IQuotesProvider = {
      getQuotes: () => new Promise<QuoteData[]>((resolve: Function, reject: Function) => {}),
    },
    requester: Requester = new Requester(),
    subscribeSymbol: (data: INewSubscribeSymbol) => void,
    unSubscribeSymbol: (data: INewSubscribeSymbol) => void
  ) {
    this.setTodayTime();
    this._datafeedURL = datafeedURL;
    this._requester = requester;
    this._historyProvider = new HistoryProvider(datafeedURL, this._requester);
    this._quotesProvider = quotesProvider;
    this.subscribeSymbol = subscribeSymbol;
    this.unSubscribeSymbol = unSubscribeSymbol;
    this.unSubscribeSymbol = unSubscribeSymbol;

    this._configurationReadyPromise = this._requestConfiguration().then(
      (configuration: UdfCompatibleConfiguration | null) => {
        if (configuration === null) {
          configuration = defaultConfiguration();
        }

        this._setupWithConfiguration(configuration);
      }
    );

    this.initPromise = new Promise<boolean>((resolve: Function, resject: Function) => {
      this._initResolve = resolve;
    });
  }

  protected setTodayTime = () => {
    const time = new Date().getTime();
    const timeInDay = time % 86400000;
    this.todayTimeInMs = time - timeInDay;
    setTimeout(this.setTodayTime, timeInDay + 500);
  };

  public onReady(callback: OnReadyCallback): void {
    this._configurationReadyPromise.then(() => {
      callback(this._configuration);
    });
  }

  public getQuotes(symbols: string[], onDataCallback: QuotesCallback, onErrorCallback: (msg: string) => void): void {
    this._quotesProvider.getQuotes(symbols).then(onDataCallback).catch(onErrorCallback);
  }

  public subscribeQuotes(
    symbols: string[],
    fastSymbols: string[],
    onRealtimeCallback: QuotesCallback,
    listenerGuid: string
  ): void {
    const subscribes: INewSubscribeSymbol[] = [];
    this.subscribeQuoteMap[listenerGuid] = subscribes;
    symbols.forEach((symbol: string) => {
      const listenerId = `${this.instanceId}-quote-${symbol}`;
      const subscribeData: INewSubscribeSymbol = {
        symbolList: [{ s: symbol }],
        types: [RealtimeChannelDataType.BID_OFFER, RealtimeChannelDataType.QUOTE, RealtimeChannelDataType.EXTRA],
        cbKey: listenerId,
      };
      this.subscribeSymbol(subscribeData);
      subscribes.push(subscribeData);
    });
  }

  public unsubscribeQuotes(listenerGuid: string): void {
    const subscribes: INewSubscribeSymbol[] = this.subscribeQuoteMap[listenerGuid];
    subscribes.forEach(this.unSubscribeSymbol);
  }

  public calculateHistoryDepth(
    resolution: ResolutionString,
    resolutionBack: ResolutionBackValues,
    intervalBack: number
  ): HistoryDepth | undefined {
    return undefined;
  }

  public getMarks(
    symbolInfo: LibrarySymbolInfo,
    from: number,
    to: number,
    onDataCallback: GetMarksCallback<Mark>,
    resolution: ResolutionString
  ): void {
    // console.log('getMarks', symbolInfo.name, from, to, resolution);
    if (!this._configuration.supports_marks) {
      return;
    }

    const requestParams: RequestParams = {
      symbol: symbolInfo.ticker || '',
      from: from,
      to: to,
      resolution: resolution,
    };

    this._send<Mark[] | UdfDatafeedMark>('marks', requestParams)
      .then((response: Mark[] | UdfDatafeedMark) => {
        if (!Array.isArray(response)) {
          const result: Mark[] = [];
          for (let i = 0; i < response.id.length; ++i) {
            result.push({
              id: extractField(response, 'id', i),
              time: extractField(response, 'time', i),
              color: extractField(response, 'color', i),
              text: extractField(response, 'text', i),
              label: extractField(response, 'label', i),
              labelFontColor: extractField(response, 'labelFontColor', i),
              minSize: extractField(response, 'minSize', i),
            });
          }

          response = result;
        }

        onDataCallback(response);
      })
      .catch((error?: string | Error) => {
        logMessage(`UdfCompatibleDatafeed: Request marks failed: ${getErrorMessage(error)}`);
        onDataCallback([]);
      });
  }

  public getTimescaleMarks(
    symbolInfo: LibrarySymbolInfo,
    from: number,
    to: number,
    onDataCallback: GetMarksCallback<TimescaleMark>,
    resolution: ResolutionString
  ): void {
    if (!this._configuration.supports_timescale_marks) {
      return;
    }

    const requestParams: RequestParams = {
      symbol: symbolInfo.ticker || '',
      from: from,
      to: to,
      resolution: resolution,
    };

    this._send<TimescaleMark[] | UdfDatafeedTimescaleMark>('timescale_marks', requestParams)
      .then((response: TimescaleMark[] | UdfDatafeedTimescaleMark) => {
        if (!Array.isArray(response)) {
          const result: TimescaleMark[] = [];
          for (let i = 0; i < response.id.length; ++i) {
            result.push({
              id: extractField(response, 'id', i),
              time: extractField(response, 'time', i),
              color: extractField(response, 'color', i),
              label: extractField(response, 'label', i),
              tooltip: extractField(response, 'tooltip', i),
            });
          }

          response = result;
        }

        onDataCallback(response);
      })
      .catch((error?: string | Error) => {
        logMessage(`UdfCompatibleDatafeed: Request timescale marks failed: ${getErrorMessage(error)}`);
        onDataCallback([]);
      });
  }

  public getServerTime(callback: ServerTimeCallback): void {
    if (!this._configuration.supports_time) {
      return;
    }

    this._send<string>('time')
      .then((response: string) => {
        const time = parseInt(response);
        if (!isNaN(time)) {
          callback(time);
        }
      })
      .catch((error?: string | Error) => {
        logMessage(`UdfCompatibleDatafeed: Fail to load server time, error=${getErrorMessage(error)}`);
      });
  }

  public searchSymbols(userInput: string, exchange: string, symbolType: string, onResult: SearchSymbolsCallback): void {
    console.log(Global.tvSymbolStorage == null, this._configuration.supports_search);
    if (Global.tvSymbolStorage == null && this._configuration.supports_search) {
      const params: RequestParams = {
        limit: Constants.SearchItemsLimit,
        query: userInput.toUpperCase(),
        type: symbolType,
        exchange: exchange,
      };

      this._send<UdfSearchSymbolsResponse | UdfErrorResponse>('search', params)
        .then((response: UdfSearchSymbolsResponse | UdfErrorResponse) => {
          if (response.s !== undefined) {
            logMessage(`UdfCompatibleDatafeed: search symbols error=${response.errmsg}`);
            onResult([]);
            return;
          }

          onResult(response);
        })
        .catch((reason?: string | Error) => {
          logMessage(
            `UdfCompatibleDatafeed: Search symbols for '${userInput}' failed. Error=${getErrorMessage(reason)}`
          );
          onResult([]);
        });
    } else {
      if (Global.tvSymbolStorage == null) {
        throw new Error('UdfCompatibleDatafeed: inconsistent configuration (symbols storage)');
      }

      Global.tvSymbolStorage
        .searchSymbols(userInput, exchange, symbolType, Constants.SearchItemsLimit)
        .then(onResult)
        .catch(onResult.bind(null, []));
    }
  }

  public resolveSymbol(symbolName: string, onResolve: ResolveCallback, onError: ErrorCallback): void {
    // console.log('resolveSymbol', symbolName);
    logMessage('Resolve requested');

    const resolveRequestStartTime = Date.now();
    const onResultReady = (symbolInfo: LibrarySymbolInfo): void => {
      logMessage(`Symbol resolved: ${Date.now() - resolveRequestStartTime}ms`);
      onResolve(symbolInfo);
      this._initResolve(true);
    };

    if (Global.tvSymbolStorage == null && !this._configuration.supports_group_request) {
      const params: RequestParams = {
        symbol: symbolName,
      };

      this._send<ResolveSymbolResponse | UdfErrorResponse>('symbols', params)
        .then((response: ResolveSymbolResponse | UdfErrorResponse) => {
          // console.log('resolve symbol', response);
          if (response.s !== undefined) {
            onError('unknown_symbol');
          } else {
            onResultReady(response);
          }
        })
        .catch((reason?: string | Error) => {
          logMessage(`UdfCompatibleDatafeed: Error resolving symbol: ${getErrorMessage(reason)}`);
          onError('unknown_symbol');
        });
    } else {
      if (Global.tvSymbolStorage == null) {
        throw new Error('UdfCompatibleDatafeed: inconsistent configuration (symbols storage)');
      }

      Global.tvSymbolStorage
        .resolveSymbol(symbolName)
        .then(data => {
          // console.log('resolve symbol', data);
          onResultReady(data);
        })
        .catch((reason: string) => {
          onError(reason);
          this._initResolve(false);
        });
    }
  }

  public getBars(
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    rangeStartDate: number,
    rangeEndDate: number,
    onResult: HistoryCallback,
    onError: ErrorCallback
  ): void {
    // console.log('getBars', symbolInfo.name, resolution, rangeStartDate, rangeEndDate);
    if (this.currentSymbol != symbolInfo.name) {
      this.lastBar = null;
    }
    this.currentSymbol = symbolInfo.name;
    if (resolution !== this.currentResolution) {
      this.lastBar = null;
      this.currentResolution = resolution;
      // https://github.com/tradingview/charting_library/wiki/Resolution
      let unit = 60000;
      let numberString = resolution;
      if (resolution.endsWith('S')) {
        //seconds
        numberString = resolution.substring(0, resolution.length - 1);
        unit = 1000;
      } else if (resolution.endsWith('D')) {
        //Days
        numberString = resolution.substring(0, resolution.length - 1);
        unit = 86400000;
      } else if (resolution.endsWith('W')) {
        //Weeks
        numberString = resolution.substring(0, resolution.length - 1);
        unit = 86400000 * 7;
      } else if (resolution.endsWith('M')) {
        //Months
        numberString = resolution.substring(0, resolution.length - 1);
        unit = 86400000 * 7 * 30; // pretty sure that the difference cannot larger than this number
      }
      if (numberString === '') {
        this.resolutionTime = unit;
      } else {
        this.resolutionTime = parseInt(numberString) * unit;
      }
    }
    this._historyProvider
      .getBars(symbolInfo, resolution, rangeStartDate, rangeEndDate)
      .then((result: GetBarsResult) => {
        // console.log('symbol', symbolInfo.type);
        let bars = result.bars;
        if (symbolInfo.type !== SymbolType.FUTURES && symbolInfo.type !== SymbolType.INDEX) {
          bars = result.bars.map(val => ({
            ...val,
            close: val.close / 1000,
            open: val.open / 1000,
            high: val.high / 1000,
            low: val.low / 1000,
          }));
        }
        // console.log('bars', bars);
        // result.meta = {
        //   noData: result.meta.noData,
        // };
        // result.meta = {noData: false};
        let lastQueryBar = null;
        if (bars.length > 0) {
          lastQueryBar = bars[bars.length - 1];
        }
        if (lastQueryBar != null && (this.lastBar == null || this.lastBar.time < lastQueryBar.time)) {
          this.lastBar = lastQueryBar;
        }
        onResult(bars, result.meta);
      })
      .catch(onError);
  }

  public subscribeBars(
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    onTick: SubscribeBarsCallback,
    listenerGuid: string,
    onResetCacheNeededCallback: () => void
  ): void {
    const listenerId = `${this.instanceId}-bars-${listenerGuid}`;
    const subscribeData: INewSubscribeSymbol = {
      symbolList: [{ s: symbolInfo.name }],
      types: [RealtimeChannelDataType.BID_OFFER, RealtimeChannelDataType.QUOTE, RealtimeChannelDataType.EXTRA],
      cbKey: listenerId,
      cb: (data: INewSymbolData) => {
        if (
          this.currentSymbol != null &&
          this.lastBar != null &&
          data.s === this.currentSymbol &&
          data.ti &&
          data.channelType === RealtimeChannelDataType.QUOTE
        ) {
          // console.log('receive data', data);
          const time =
            this.todayTimeInMs +
            ((parseInt(data.ti.substring(0, 2)) * 60 + parseInt(data.ti.substring(2, 4))) * 60 +
              parseInt(data.ti.substring(4, 6))) *
              1000;
          if (time < this.lastBar.time) {
            console.warn('time is less than lastbar. will reset');
            onResetCacheNeededCallback();
          } else {
            const closePrice = data.c
              ? data.t === SymbolType.FUTURES || data.t === SymbolType.INDEX
                ? data.c
                : data.c / 1000
              : 0;
            const highPrice = data.h
              ? data.t === SymbolType.FUTURES || data.t === SymbolType.INDEX
                ? data.h
                : data.h / 1000
              : 0;
            const lowPrice = data.l
              ? data.t === SymbolType.FUTURES || data.t === SymbolType.INDEX
                ? data.l
                : data.l / 1000
              : 0;
            const openPrice = data.o
              ? data.t === SymbolType.FUTURES || data.t === SymbolType.INDEX
                ? data.o
                : data.o / 1000
              : 0;

            const matchVolume = data.mv || 0;
            if (time - this.lastBar.time < this.resolutionTime) {
              // same bar
              this.lastBar.close = closePrice;
              if (this.currentResolution === 'D') {
                if (highPrice != null) {
                  this.lastBar.high = highPrice;
                } else {
                  if (this.lastBar.high == null || this.lastBar.high === 0 || this.lastBar.high < closePrice) {
                    this.lastBar.high = closePrice;
                  }
                }
                if (lowPrice != null) {
                  this.lastBar.low = lowPrice;
                } else {
                  if (this.lastBar.low == null || this.lastBar.low === 0 || this.lastBar.low > closePrice) {
                    this.lastBar.low = closePrice;
                  }
                }
                if (openPrice != null) {
                  this.lastBar.open = openPrice;
                } else {
                  if (this.lastBar.open == null || this.lastBar.open === 0) {
                    this.lastBar.open = closePrice;
                  }
                }
              } else {
                if (this.lastBar.high == null || this.lastBar.high === 0 || this.lastBar.high < closePrice) {
                  this.lastBar.high = closePrice;
                }
                if (this.lastBar.low == null || this.lastBar.low === 0 || this.lastBar.low > closePrice) {
                  this.lastBar.low = closePrice;
                }
                if (this.lastBar.open == null || this.lastBar.open === 0) {
                  this.lastBar.open = closePrice;
                }
              }

              if (this.currentResolution === 'D') {
                this.lastBar.volume = data.vo;
              } else {
                if (this.lastBar.volume) {
                  this.lastBar.volume += matchVolume;
                } else {
                  this.lastBar.volume = matchVolume;
                }
              }
              onTick(this.lastBar);
            } else {
              const newBar: Bar = {
                open: closePrice,
                close: closePrice,
                high: closePrice,
                time: time - (time % this.resolutionTime),
                low: closePrice,
                volume: matchVolume,
              };
              onTick(newBar);
              console.warn('-------------new bar', time, newBar.time);
              this.lastBar = newBar;
            }
          }
        }
      },
    };
    this.subscribeSymbol(subscribeData);
    this.subscribeBarMap[listenerId] = subscribeData;
  }

  public unsubscribeBars(listenerGuid: string): void {
    this.lastBar = null;
    this.currentSymbol = null;
    const listenerId = `${this.instanceId}-bars-${listenerGuid}`;
    const subscribeData = this.subscribeBarMap[listenerId];
    if (subscribeData != null) {
      this.unSubscribeSymbol(subscribeData);
    }
  }

  protected _requestConfiguration(): Promise<UdfCompatibleConfiguration | null> {
    return this._send<UdfCompatibleConfiguration>('config').catch((reason?: string | Error) => {
      logMessage(
        `UdfCompatibleDatafeed: Cannot get datafeed configuration - use default, error=${getErrorMessage(reason)}`
      );
      return null;
    });
  }

  private _send<T>(urlPath: string, params?: RequestParams): Promise<T> {
    return this._requester.sendRequest<T>(this._datafeedURL, urlPath, params);
  }

  private _setupWithConfiguration(configurationData: UdfCompatibleConfiguration): void {
    this._configuration = configurationData;

    if (configurationData.exchanges === undefined) {
      configurationData.exchanges = [];
    }

    if (!configurationData.supports_search && !configurationData.supports_group_request) {
      throw new Error('Unsupported datafeed configuration. Must either support search, or support group request');
    }

    logMessage(`UdfCompatibleDatafeed: Initialized with ${JSON.stringify(configurationData)}`);
  }
}

function defaultConfiguration(): UdfCompatibleConfiguration {
  return {
    supports_search: false,
    supports_group_request: true,
    supported_resolutions: ['1', '5', '15', '30', '60', '1D', '1W', '1M'],
    supports_marks: false,
    supports_timescale_marks: false,
  };
}
