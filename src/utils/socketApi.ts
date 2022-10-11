import {
  ACCOUNT_OTP_RESET,
  ACCOUNT_OTP_SET_VALID,
  AUTHENTICATION_LOGOUT,
} from 'redux/actions';
import { Global } from 'constants/main';
import { IAPI, IDAPI } from 'interfaces/config';
import {
  IClientData,
  IError,
  IParams,
  IResponse,
  ISelf,
  ISocket,
} from 'interfaces/common';
import { IMASCommonResponse } from 'interfaces/apiTTL';
import { METHOD } from './METHOD';
import { SocketAuthState, WS } from 'constants/enum';
import { detectPlatform } from './detectPlatform';
import config from 'config';
import i18n from 'i18next';
import jwt_decode from 'jwt-decode';
import store from 'redux/store';

declare let self: ISelf;

let baseURI: string = config.apiUrl.baseURI;

let rId = 0;
function emitSocket<T>(
  socket: ISocket | null,
  service: string,
  data: any // eslint-disable-line
): Promise<IResponse<T>> {
  if (socket == null) {
    throw new Error(i18n.t('INTERNAL_SERVER_ERROR'));
  }
  rId++;
  return new Promise<IResponse<T>>((resolve: Function, reject: Function) => {
    socket.emit(
      service,
      { ...data, _rId: rId },
      (err: IError, responseData: IResponse<T>) => {
        if (err) {
          console.log(socket.id, rId, service, data.uri, err);
          reject(err);
        } else {
          resolve(responseData);
        }
      }
    );
  });
}

export function setBaseUri(baseUri: string) {
  baseURI = baseUri;
}

async function refreshToken(socket: ISocket) {
  const clientData: IResponse<IClientData> = await loadClientData(
    socket,
    config.serviceName
  );
  return emitSocket(socket, 'login', {
    grant_type: 'refresh_token',
    client_id: clientData.data.clientId,
    client_secret: clientData.data.clientSecret,
    refresh_token: socket.authToken?.refreshToken,
  });
}

export async function loadClientData(
  socket: ISocket | null,
  serviceName: string
): Promise<IResponse<IClientData>> {
  return emitSocket<IClientData>(socket, 'loadServiceConfig', {
    headers: {
      'accept-language': self.lang,
    },
    body: {
      serviceName,
      sourceIp: self.sourceIp,
      platform: detectPlatform(),
    },
  });
}

export async function logout<T = any>(
  socket: ISocket | null,
  params: IParams
): Promise<IResponse<T>> {
  return emitSocket<T>(socket, 'logout', {
    headers: {
      'accept-language': self.lang,
      platform: detectPlatform(),
    },
    body: params
      ? { ...params, sourceIp: self.sourceIp }
      : { sourceIp: self.sourceIp },
  });
}

export async function login<T = any>(
  socket: ISocket | null,
  params: IParams
): Promise<IResponse<T>> {
  return emitSocket<T>(socket, 'login', {
    headers: {
      'accept-language': self.lang,
      platform: detectPlatform(),
    },
    body: params
      ? { ...params, sourceIp: self.sourceIp }
      : { sourceIp: self.sourceIp },
  });
}

export async function verifyOTP<T = any>(
  socket: ISocket | null,
  params: IParams = {}
): Promise<IResponse<T>> {
  return emitSocket<T>(socket, 'login/sec/verifyOTP', {
    headers: {
      'accept-language': self.lang,
      platform: detectPlatform(),
    },
    body: params
      ? { ...params, sourceIp: self.sourceIp }
      : { sourceIp: self.sourceIp },
  });
}

/**
 *  Query data using rest
 */
async function queryRest<T, P = IParams>(
  socket: ISocket | undefined,
  uri: string,
  method: string,
  params: P | IParams = {},
  baseUri: string,
  secToken?: string,
  secDomain?: string,
  customBaseURI?: string,
  index?: number,
  otpToken?: string
): Promise<IResponse<T>> {
  let parsedUri = `${baseUri}${customBaseURI ?? baseURI}${uri}`;
  let localBody: any = {};
  const localSearchParams: Array<{
    key: string;
    value: string | string[];
  }> = [];
  let hasBody = false;
  if (params != null) {
    if (
      (method === METHOD.PUT || method === METHOD.POST) &&
      Array.isArray(params)
    ) {
      hasBody = true;
      localBody = params;
    } else {
      Object.keys(params).forEach((requestKey: string) => {
        const requestValue = params[requestKey];
        const pathParm = `{${requestKey}}`;
        if (parsedUri.indexOf(pathParm) > -1) {
          parsedUri = parsedUri.replace(pathParm, requestValue);
        } else {
          if (method === METHOD.GET || method === METHOD.DELETE) {
            if (requestValue == null) {
              return;
            }
            localSearchParams.push({
              key: requestKey,
              value: requestValue,
            });
          } else {
            localBody[requestKey] = requestValue;
            hasBody = true;
          }
        }
      });
    }
  }
  const url = new URL(parsedUri, window.location.href);
  localSearchParams.forEach((item) => {
    if (Array.isArray(item.value)) {
      url.searchParams.set(item.key, (item.value as string[]).join(','));
    } else {
      url.searchParams.set(item.key, item.value);
    }
  });

  const localeHeaders: Record<string, string> = {
    'accept-language': self.lang,
    platform: detectPlatform(),
    rid: rId.toString(),
    ...(otpToken != null && { otpToken }),
  };
  if (
    socket?.authState === SocketAuthState.AUTHENTICATED &&
    socket.authToken != null
  ) {
    localeHeaders.authorization = `jwt ${socket.authToken.accessToken}`;
  }
  if (secToken != null) {
    localeHeaders.secToken = secToken;
  }
  if (secDomain != null) {
    localeHeaders.secDomain = secDomain;
  }

  const localRequestOptions: RequestInit = {
    method: method.toUpperCase(),
    headers: localeHeaders,
  };

  if (method === METHOD.POST || method === METHOD.PUT) {
    localeHeaders['Content-Type'] = 'application/json';
    if (hasBody) {
      localRequestOptions.body = JSON.stringify(localBody);
    }
  }
  const finalUrl = url.toString();
  const response: Response = await fetch(finalUrl, localRequestOptions);
  if (response.status >= 200 && response.status < 300) {
    // success
    const data: T = (await response.json()) as T;
    return {
      data,
    };
  } else {
    if (response.status >= 500) {
      // internal server error
      throw new Error('INTERNAL_SERVER_ERROR');
    } else if (response.status === 401 || response.status === 403) {
      // authorization. will try to refresh token
      if (index != null && index > 0) {
        throw new Error('TOKEN_ERROR'); // consider later
      }
      if (socket != null) {
        const data = await response.json();
        if (
          data.code === 'OTP_TOKEN_IS_EXPIRED' ||
          data.code === 'OTP_TOKEN_IS_REQUIRED'
        ) {
          store.dispatch({
            type: ACCOUNT_OTP_RESET,
          });
          throw new Error(data.code);
        }
        await refreshToken(socket);
      }
      return queryRest<T, P>(
        socket,
        uri,
        method,
        params,
        baseUri,
        secToken,
        secDomain,
        customBaseURI,
        1
      );
    } else {
      // validation error
      const data = await response.json();

      throw new Error(
        data.code === 'Fail, incorrect'
          ? 'INVALID_OTP_' + data.params[0].leftAttempts
          : data.code
      );
    }
  }
}

export async function request<T, P>(
  api: IDAPI<P, T>,
  params: P,
  secToken?: string,
  secDomain?: string,
  failoverSocket?: ISocket | null,
  customBaseURI?: string
): Promise<IResponse<T>> {
  return query(api, params, secToken, secDomain, failoverSocket, customBaseURI);
}

/**
 *  This `requester` function won't check `otpToken`'s validity from Redux store
 */
export async function requester<T, P = IParams>(
  api: IAPI,
  params: P | IParams = {},
  secToken?: string,
  secDomain?: string,
  failoverSocket?: ISocket | null,
  customBaseURI?: string,
  otpToken?: string
): Promise<IResponse<T>> {
  let socket: ISocket;

  const method = api.method == null ? METHOD.GET : api.method;
  const newCustomBaseURI =
    customBaseURI == null
      ? api.useFullUri === true
        ? ''
        : undefined
      : customBaseURI;

  socket = Global.sockets[api.wsName];

  rId++;

  if (config.isFinishInjected && config.rest.enable) {
    const baseUri = config.rest.baseUri[api.wsName];
    if (baseUri != null) {
      return queryRest(
        socket,
        api.uri,
        method,
        params,
        baseUri,
        secToken,
        secDomain,
        newCustomBaseURI,
        undefined,
        otpToken
      );
    }
  }
  return queryRaw(
    socket,
    api.uri,
    method,
    params,
    secToken,
    secDomain,
    failoverSocket,
    newCustomBaseURI,
    otpToken
  );
}

/**
 *  This `query` function will check `otpToken`'s validity from Redux store
 */
export async function query<T, P = IParams>(
  api: IAPI,
  params: P | IParams = {},
  secToken?: string,
  secDomain?: string,
  failoverSocket?: ISocket | null,
  customBaseURI?: string,
  onceOtpToken?: string
): Promise<IResponse<T>> {
  let otpToken = api.useOtpToken
    ? store.getState().otpToken || undefined
    : undefined;
  if (onceOtpToken) {
    otpToken = onceOtpToken;
  }
  return requester<T, P>(
    api,
    params,
    secToken,
    secDomain,
    failoverSocket,
    customBaseURI,
    otpToken
  )
    .then((res) => {
      if (otpToken != null && !store.getState().otp.isValid) {
        store.dispatch({
          type: ACCOUNT_OTP_SET_VALID,
        });
      }
      return res;
    })
    .catch((err: IError) => {
      if (err.code === 'SESSION_EXPIRED' || err.message === 'SESSION_EXPIRED') {
        store.dispatch({
          type: AUTHENTICATION_LOGOUT,
        });
      }

      throw err;
    });
}

/**
 *  Query data using socket
 */
export async function queryRaw<T, P = IParams>(
  socket: ISocket | null,
  uri: string,
  method: string,
  params: P | IParams = {},
  secToken?: string,
  secDomain?: string,
  failoverSocket?: ISocket | null,
  customBaseURI?: string,
  otpToken?: string
): Promise<IResponse<T>> {
  const parsedUri = `${method}:${
    customBaseURI != null ? customBaseURI : baseURI
  }${uri}`;
  if (socket == null) {
    console.error('No connection available');
    throw new Error(i18n.t('INTERNAL_SERVER_ERROR'));
  }

  return new Promise<IResponse<T>>((resolve: Function, reject: Function) => {
    const data = {
      uri: parsedUri,
      headers: {
        'accept-language': self.lang,
        secToken,
        secDomain,
        platform: detectPlatform(),
        otpToken,
      },
      body: params
        ? { ...params, sourceIp: self.sourceIp }
        : { sourceIp: self.sourceIp },
      _rId: rId,
    };

    socket.emit('doQuery', data, (err: IError, responseData: IResponse<T>) => {
      if (err) {
        console.error('doQuery: ', uri, data, rId, socket, err);

        if (failoverSocket != null) {
          // eslint-disable-next-line promise/no-promise-in-callback
          queryRaw(failoverSocket, uri, method, params, secToken, secDomain)
            .then((res: IResponse<T>) => {
              resolve(res);
            })
            .catch(() => {
              reject(err);
            });
        }

        reject(err);
      } else {
        if (store.getState().isDebugging) {
          console.log(
            parsedUri,
            JSON.stringify(data),
            '\nres',
            JSON.stringify(responseData)
          );
        }

        resolve(responseData);
      }
    });
  });
}

export function deAuthenticate(socket: ISocket): Promise<void> {
  return new Promise((resolve, reject) => {
    socket.deauthenticate((err: unknown) => {
      if (err != null) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

export async function queryRestTTL<T, P = IParams>(
  api: IAPI,
  params: P | IParams = {}
) {
  try {
    const baseUri = config.rest.baseUri[WS.TTL];

    if (baseUri == null) {
      throw new Error('TTL API is unavailable');
    }
    let parsedUri = `${baseUri}${api.uri}`;
    const localHeaders: HeadersInit = {};
    const localBody = {};
    const localSearchParams: Array<{
      key: string;
      value: string | string[];
    }> = [];
    const url = new URL(parsedUri, window.location.href);
    let hasBody = false;

    if (params != null) {
      Object.keys(params).forEach((requestKey: string) => {
        const requestValue = params[requestKey];
        const pathParm = `{${requestKey}}`;
        if (parsedUri != null && parsedUri.indexOf(pathParm) > -1) {
          parsedUri = parsedUri.replace(pathParm, requestValue);
        } else {
          if (
            api.method == null ||
            api.method === METHOD.GET ||
            api.method === METHOD.DELETE
          ) {
            if (requestValue == null) {
              return;
            }
            localSearchParams.push({
              key: requestKey,
              value: requestValue,
            });
          } else {
            localBody[requestKey] = requestValue;
            hasBody = true;
          }
        }
      });
    }

    localSearchParams.forEach((item) => {
      if (Array.isArray(item.value)) {
        url.searchParams.set(item.key, (item.value as string[]).join(','));
      } else {
        url.searchParams.set(item.key, item.value);
      }
    });

    const localRequestOptions: RequestInit = {
      method: api.method ?? METHOD.GET,
      headers: localHeaders,
      credentials: 'include',
      redirect: 'follow',
    };

    localHeaders[
      'Authorization'
    ] = `jwt ${Global.sockets.wts?.authToken?.accessToken}`;

    let decodeToken;
    if (Global.sockets.wts?.authToken?.accessToken !== undefined) {
      decodeToken = jwt_decode<{ ud: { masDrTokenId: string } }>(
        Global.sockets.wts?.authToken?.accessToken
      );
    }

    if (hasBody && decodeToken !== undefined) {
      localHeaders['Content-Type'] = 'application/json';
      localHeaders.Cookie = `${decodeToken.ud.masDrTokenId}`;
      localRequestOptions.body = JSON.stringify(localBody);
      const loginCookie = decodeToken.ud.masDrTokenId.split(';')[0].split('=');

      // eslint-disable-next-line functional/immutable-data
      document.cookie = `${loginCookie[0]}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; Path=/;`;
      // eslint-disable-next-line functional/immutable-data
      document.cookie = `${loginCookie[0]}=${loginCookie[1]}; Path=/;`;
    } else {
      localHeaders['Content-Type'] = 'application/json';
      localRequestOptions.body = JSON.stringify(localBody);
    }

    const res: Response = await fetch(url.toString(), localRequestOptions);
    const result: IMASCommonResponse = await res.json();

    if (result.errorCode === 'OLS0012' || result.errorCode === 'OLS0027') {
      store.dispatch({
        type: AUTHENTICATION_LOGOUT,
      });
    }

    if (
      result.errorCode != null &&
      result.errorCode !== 'OLS0000' &&
      result.errorCode !== '0'
    ) {
      throw Error(result.errorMessage);
    }

    return result;
  } catch (error) {
    console.error(`Rest TTL Error`, error);
    throw Error(error.code || error.message);
  }
}
