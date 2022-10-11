/* eslint-disable */

import { logMessage, RequestParams, UdfErrorResponse, UdfResponse } from './helpers';
import store from 'redux/store';
import { Global } from 'constants/main';
import { WS } from 'constants/enum';

export class Requester {
  private _headers: HeadersInit | undefined;

  public constructor(headers?: HeadersInit) {
    if (headers) {
      this._headers = headers;
    }
  }

  public sendRequest<T extends UdfResponse>(
    datafeedUrl: string,
    urlPath: string,
    params?: RequestParams
  ): Promise<T | UdfErrorResponse>;
  public sendRequest<T>(datafeedUrl: string, urlPath: string, params?: RequestParams): Promise<T>;
  public sendRequest<T>(datafeedUrl: string, urlPath: string, params?: RequestParams): Promise<T> {
    logMessage('New request: ' + urlPath);

    // Send user cookies if the URL is on the same origin as the calling script.
    const options: RequestInit = { credentials: 'same-origin' };

    if (this._headers !== undefined) {
      options.headers = this._headers;
    }

    const data = {
      uri: `get:${datafeedUrl}${urlPath}`,
      headers: {
        'accept-language': store.getState().lang,
      },
      body: params == null ? {} : params,
    };

    return new Promise((resolve: Function, reject: Function) => {
      const socket = Global.sockets[WS.PRICE_BOARD];

      socket!.emit('doQuery', data, (err: any, responseData: any) => {
        if (err) {
          reject(err);
        } else {
          if (responseData != null) {
            resolve(responseData.data);
          } else {
            resolve({});
          }
        }
      });
    });
  }
}
