/* eslint-disable */

import { QuoteData } from '../datafeed-api';

import { UdfOkResponse } from './helpers';

export interface UdfQuotesResponse extends UdfOkResponse {
  d: QuoteData[];
}

export interface IQuotesProvider {
  // eslint-disable-next-line:variable-name tv-variable-name
  getQuotes(symbols: string[]): Promise<QuoteData[]>;
}
