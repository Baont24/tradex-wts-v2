import {
  CW_LIST_DATA_STORAGE_KEY,
  FUTURES_LIST_DATA_STORAGE_KEY,
  INDEX_LIST_DATA_STORAGE_KEY,
  STOCK_LIST_DATA_STORAGE_KEY,
} from 'constants/main';

export function getKey<T>(key: string): T | null {
  try {
    let value = null;
    if (window.localStorage != null) {
      value = window.localStorage.getItem(key);
    }
    if (value == null) {
      return null;
    }

    return JSON.parse(value);
  } catch (error) {
    return null;
  }
}

export function setKey<T>(key: string, value: T): void {
  try {
    if (value != null) {
      if (window.localStorage != null) {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    }
  } catch (error) {
    return;
  }
}

export function removeKey(key: string): void {
  try {
    if (window.localStorage != null) {
      window.localStorage.removeItem(key);
    }
  } catch (error) {
    return;
  }
}

export function getStockKey(code: string) {
  return `${STOCK_LIST_DATA_STORAGE_KEY}-${code}`;
}

export function getCWKey(code: string) {
  return `${CW_LIST_DATA_STORAGE_KEY}-${code}`;
}

export function getIndexKey(code: string) {
  return `${INDEX_LIST_DATA_STORAGE_KEY}-${code}`;
}

export function getFuturesKey(code: string) {
  return `${FUTURES_LIST_DATA_STORAGE_KEY}-${code}`;
}

export function getCrossKey<T>(key: string): Promise<T | null> {
  if ((window as any).getKey != null) {
    return (window as any).getKey(key) as Promise<T | null>;
  } else {
    return Promise.resolve(getKey(key));
  }
}

export function setCrossKey<T>(key: string, value: T): Promise<void> {
  if ((window as any).setKey != null) {
    return (window as any).setKey(key, JSON.stringify(value)) as Promise<void>;
  } else {
    return Promise.resolve(setKey(key, value));
  }
}

export function removeCrossKey<T>(key: string): Promise<void> {
  if ((window as any).removeKey != null) {
    return (window as any).removeKey(key) as Promise<void>;
  } else {
    return Promise.resolve(removeKey(key));
  }
}
