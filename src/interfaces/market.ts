import {
  Market,
  MarketStatus,
  RealtimeChannelDataType,
  SymbolSession,
  SymbolType,
  SystemType,
} from 'constants/enum';

export interface ISymbolList {
  readonly array: INewSymbolData[];
  readonly map?: { readonly [s: string]: INewSymbolData };
  readonly latest?: boolean;
  readonly lastestModified?: string;
}

export interface IMarketData {
  readonly symbolList: ISymbolList;
  readonly stockList?: INewSymbolData[];
  readonly indexList?: INewSymbolData[];
  readonly cwList?: INewSymbolData[];
  readonly futuresList?: INewSymbolData[];
}

export interface IBidOfferData {
  readonly bidPrice?: number;
  readonly bidVolume?: number;
  readonly bidVolumeChange?: number;
  readonly offerPrice?: number;
  readonly offerVolume?: number;
  readonly offerVolumeChange?: number;
}

export interface IIndexListData {
  readonly array: IIndexData[];
  readonly map: { readonly [s: string]: IIndexData };
  readonly mapIndex: { readonly [s: string]: number };
}

export interface ISession {
  readonly last: number;
  readonly change: number;
  readonly rate: number;
  readonly tradingVolume: number;
  readonly tradingValue: number;
}

export interface IIndexData {
  readonly code: string;
  readonly last?: number;
  readonly open?: number;
  readonly high?: number;
  readonly low?: number;
  readonly change?: number;
  readonly rate?: number;
  readonly tradingVolume?: number;
  readonly tradingValue?: number;
  readonly time?: string;
  readonly isHighlight?: boolean;
  readonly market?: Market;
  readonly indexName?: string;
  readonly indexNameEn?: string;
  readonly priorVolume?: number;
  readonly ptVolume?: number;
  readonly upCount?: number;
  readonly ceilingCount?: number;
  readonly downCount?: number;
  readonly floorCount?: number;
  readonly unchangedCount?: number;
  readonly date?: string;
  readonly sessions?: ISession[];
  readonly lastUpdatedAt?: number;
}

export interface ICurrentSymbol {
  readonly code: string;
  readonly refCode?: string;
  readonly symbolType?: SymbolType;
  readonly infoData?: INewSymbolData;
  readonly dataUpdated?: boolean;
  /**
   * Query symbol data to `infoData`
   */
  readonly forceUpdate?: boolean;
  readonly price?: number;
  readonly resetData?: boolean;
}

export interface ISubscribeSymbol {
  readonly code: string;
  readonly symbolType?: SymbolType;
}

export interface INewSubscribeSymbol {
  readonly symbolList: INewSymbolData[];
  readonly types: RealtimeChannelDataType[];
  readonly isOddlot?: boolean;
  readonly fromBrowser?: boolean;
  readonly symbolType?: SymbolType;
  readonly cbKey?: string;
  readonly cb?: (data: INewSymbolData) => void;
}

export interface IMarketStatus {
  readonly market: Market;
  readonly type: SystemType;
  readonly time: string;
  readonly status: MarketStatus;
}

export interface IAlarmForm {
  readonly alertBy?: string;
  readonly symbol: string;
  readonly condition?: number;
  readonly frequency?: string;
  readonly expirationFrom?: string;
  readonly expirationTo?: string;
  readonly deliveryBy?: string;
  readonly message?: string;
}

export interface IIndexBoardData {
  readonly type: 'chart' | 'main-index-slider' | 'main-index';
  readonly array: INewSymbolData[];
}

export interface IBidOffer {
  /**
   * Price
   */
  readonly p?: number;
  /**
   * Volume
   */
  readonly v?: number;
  /**
   * Volumn change
   */
  readonly c?: number;
}

export interface ISymbolQuote {
  /**
   * Close price
   */
  readonly c?: number;
  /**
   * High price
   */
  readonly h?: number;
  /**
   * Low price
   */
  readonly l?: number;
  /**
   * Open price
   */
  readonly o?: number;
  /**
   * time `yyyyMMddhhmmss` or `HHmmss`
   */
  readonly t?: string;
  /**
   * Ceiling floor equal
   */
  readonly cf?: string;
  /**
   * Change
   */
  readonly ch?: number;
  /**
   * Matched by
   */
  readonly mb?: string;
  /**
   * Matching volume
   */
  readonly mv?: number;
  /**
   * Rate
   */
  readonly ra?: number;
  /**
   * Sequence
   */
  readonly se?: number;
  /**
   * Trading value
   */
  readonly va?: number;
  /**
   * Trading volume
   */
  readonly vo?: number;
}

export interface ISymbolQuoteChart {
  readonly lastTradingDate?: string;
  readonly quotes: Record<string, ISymbolQuote[]>;
}

export interface IIndexChange {
  /**
   * Ceiling count
   */
  readonly ce: number;
  /**
   * Floor count
   */
  readonly fl: number;
  /**
   * Up count
   */
  readonly up: number;
  /**
   * Down count
   */
  readonly dw: number;
  /**
   * Unchange count
   */
  readonly uc: number;
  /**
   *
   */
  readonly tc?: number;
  /**
   *
   */
  readonly utc?: number;
}

export interface INewSymbolData {
  /**
   * Symbol code
   */
  readonly s: string;
  /**
   * Reference code
   */
  readonly r?: string;
  /**
   * Market
   */
  readonly m?: Market;
  /**
   * Name
   */
  readonly n1?: string;
  /**
   * Englist name
   */
  readonly n2?: string;
  /**
   * Symbol type: INDEX/STOCK/FUTURES/CW
   */
  readonly t?: SymbolType;
  /**
   * Base code
   */
  readonly b?: string;
  /**
   * Base code securities type (INDEX/BOND)
   */
  readonly bs?: SymbolType;
  /**
   * Base code price CW (Additional)
   */
  readonly bp?: INewSymbolData;
  /**
   * Is highlight
   */
  readonly i?: boolean;
  /**
   * Index type
   */
  readonly it?: 'F' | 'D';
  /**
   * Open price
   */
  readonly o?: number;
  /**
   * High price
   */
  readonly h?: number;
  /**
   * Low price
   */
  readonly l?: number;
  /**
   * Close price
   */
  readonly c?: number;
  /**
   * Average price
   */
  readonly a?: number;
  /**
   * Change
   */
  readonly ch?: number;
  /**
   * Rate
   */
  readonly ra?: number;
  /**
   * Reference price
   */
  readonly re?: number;
  /**
   * Trading volume
   */
  readonly vo?: number;
  /**
   * Trading value
   */
  readonly va?: number;
  /**
   * Ceiling price
   */
  readonly ce?: number;
  /**
   * Floor price
   */
  readonly fl?: number;
  /**
   * Best bid
   */
  readonly bb?: IBidOffer[];
  /**
   * Best offer
   */
  readonly bo?: IBidOffer[];
  /**
   * Matching volume
   */
  readonly mv?: number;
  /**
   * Matching by
   */
  readonly mb?: 'BID' | 'OFFER';
  /**
   * Time
   */
  readonly ti?: string;
  /**
   * Session
   */
  readonly ss?: SymbolSession;
  /**
   * Total bid volume
   */
  readonly tb?: number;
  /**
   * Total offer volume
   */
  readonly to?: number;
  /**
   * 52 Weeks
   */
  readonly w52?: {
    /**
     * High
     */
    readonly h: number;
    /**
     * Low
     */
    readonly l: number;
  };
  /**
   * First trade date (YYYYMMDD)
   */
  readonly ftd?: string;
  /**
   * Last trade date (YYYYMMDD)
   */
  readonly ltd?: string;
  /**
   * Maturity date (YYYYMMDD)
   */
  readonly md?: string;
  /**
   * Index change
   */
  readonly ic?: IIndexChange;
  /**
   *
   */
  readonly et?: {
    readonly ce?: number;
    readonly fl?: number;
  };
  /**
   * Foreigner
   */
  readonly fr?: {
    /**
     * Buy volumn
     */
    readonly bv: number;
    /**
     * Sell volumn
     */
    readonly sv: number;
    /**
     * Current room
     */
    readonly cr: number;
    /**
     * Total room
     */
    readonly tr: number;
    /**
     *
     */
    readonly fvo?: number;
    /**
     *
     */
    readonly fva?: number;
  };
  /**
   * Open interest
   */
  readonly oi?: number;
  /**
   * Issuer name
   */
  readonly is?: string;
  /**
   * Expected price
   */
  readonly ep?: number;
  /**
   * Exercise price
   */
  readonly exp?: number;
  /**
   * Expected volume
   */
  readonly exv?: number;
  /**
   *  Expected change
   */
  readonly exc?: number;
  /**
   *  Expected rate
   */
  readonly exr?: number;
  /**
   * Exercise ratio
   */
  readonly er?: string;
  /**
   *
   */
  readonly iv?: number;
  /**
   *
   */
  readonly rv?: number;
  /**
   *
   */
  readonly vd?: number;
  /**
   * Delta
   */
  readonly de?: number;
  /**
   *
   */
  readonly pc?: number;
  /**
   * Previous close
   */
  readonly lq?: number;
  /**
   * Underlying symbol
   */
  readonly ud?: string;
  /**
   *  Avg Volume (10 days)
   */
  readonly av?: number;
  /**
   *  Is Ex diviend date
   */
  readonly ie?: boolean;
  /**
   *  Basis
   */
  readonly ba?: number;
  /**
   *  Break even
   */
  readonly be?: number;
  /**
   *  %Premium
   */
  readonly pe?: number;
  /**
   * Real time channel type (QUOTE/BID_OFFER/EXTRA)
   */
  readonly channelType?: RealtimeChannelDataType;
  /**
   * Total Put-through Value
   */
  readonly pva?: number;
  /**
   * Total Put-through Volume
   */
  readonly pvo?: number;
}
