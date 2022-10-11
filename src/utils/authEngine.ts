export interface IAuthEngineOptions {
  readonly useCookie?: boolean;
  readonly cookieDomain?: string;
  readonly cookieExpires?: number;
}

const PREFIX = 'scauthengine-';
const DEFAULT_COOKIE_EXPIRES = 24 * 7;

export default class AuthEngine {
  constructor(private options: IAuthEngineOptions) {}

  getOptions() {
    return this.options;
  }

  saveToken = (
    name: string,
    token: string,
    options: any,
    callback?: (e?: Error, token?: string | null) => void
  ) => {
    try {
      if (this.options.useCookie === true) {
        const date = new Date();
        date.setHours(date.getHours() + this.getCookieExpire());
        document.cookie = `${PREFIX}${name}=${token};expires=${date};path=/;domain=${this.options.cookieDomain}`; // eslint-disable-line
      } else {
        window.localStorage.setItem(`${PREFIX}${name}`, token);
      }
      if (callback != null) {
        callback(undefined, token);
      }
    } catch (e) {
      console.error(e);
      if (callback != null) {
        callback(e, null);
      }
    }
  };

  removeToken = (
    name: string,
    callback?: (e?: Error, token?: string | null) => void
  ) => {
    try {
      this.loadToken(name, callback);
      if (this.options.useCookie === true) {
        const date = new Date();
        date.setHours(date.getHours() - this.getCookieExpire());
        document.cookie = `${PREFIX}${name}=;expires=${date};path=/;domain=${this.options.cookieDomain}`; // eslint-disable-line
      } else {
        window.localStorage.removeItem(`${PREFIX}${name}`);
      }
    } catch (e) {
      console.error(e);
      if (callback != null) {
        callback(e, null);
      }
    }
  };

  loadToken = (
    name: string,
    callback?: (e?: Error, token?: string | null) => void
  ) => {
    try {
      if (this.options.useCookie === true) {
        const parts = document.cookie.split(';');
        const key = `${PREFIX}${name}=`;
        const token = parts.find((part) => part.trim().startsWith(key));
        if (token != null) {
          if (callback != null) {
            callback(undefined, token.trim().substr(key.length).trim());
          }
        } else {
          if (callback != null) {
            callback(undefined, undefined);
          }
        }
      } else {
        if (callback != null) {
          callback(undefined, window.localStorage.getItem(`${PREFIX}${name}`));
        }
      }
    } catch (e) {
      console.error(e);
      if (callback != null) {
        callback(e, null);
      }
    }
  };

  private getCookieExpire = () =>
    this.options.cookieExpires == null
      ? DEFAULT_COOKIE_EXPIRES
      : this.options.cookieExpires;
}
