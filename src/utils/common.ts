import * as globalStyles from 'styles/style.scss';
import { BoardKey, IWatchlist } from 'interfaces/common';
import { ColumnState } from 'ag-grid-community';
import { IColumnConfig } from 'components/common/StockBoard';
import { INavbar } from 'interfaces/config';
import { INewSymbolData } from 'interfaces/market';
import { SystemType } from 'constants/enum';
import { ToastType } from 'react-toastify';
import { getKey, setKey } from './localStorage';
import { updateWatchlist } from 'redux/global-actions';
import i18next from 'i18next';
import store from 'redux/store';

export function handleError(error: Error, componentStack: string) {
  console.error(error);
}

export function isBlank(str?: string) {
  return str == null || /^\s*$/.test(str);
}

export function formatGender(str?: string) {
  if (str === '001') {
    return 'Male';
  } else {
    return 'Female';
  }
}

export function calculatorAdvanceFee(
  requestAmt: number,
  days: number,
  feeRate: number,
  minFeeAmt: number,
  maxFeeAmt: number
) {
  return Math.min(
    Math.max((requestAmt * days * feeRate) / 360 / 100, minFeeAmt),
    maxFeeAmt
  );
}

export function formatEnDisplay(str?: string) {
  return str
    ?.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toUpperCase();
}

export function upperFirstLetter(data: string) {
  if (/\S[ ]/.test(data) || /\S[_]/.test(data)) {
    return data;
  }
  const result = data.toLowerCase();
  return result.charAt(0).toUpperCase() + data.slice(1);
}

export function maskingEmail(data: string) {
  return data.split('@')[0].replace(/.{4}$/, '****') + '@' + data.split('@')[1];
}

export function maskingNumber(data: string) {
  return data.replace(/\d{4}$/, '****');
}

export function formatNumber(
  value?: number,
  digit?: number,
  offsetRate?: number,
  toFixed?: boolean,
  failoverValue: string = '0'
) {
  if (value == null || isNaN(value)) {
    return failoverValue;
  }

  let data = value;

  if (offsetRate != null) {
    data = value / offsetRate;
  }

  let tempValueString = data.toString();
  let prefix = '';

  if (tempValueString[0] === '-') {
    prefix = '-';
    tempValueString = tempValueString.substring(1, tempValueString.length);
  }

  try {
    const tempValue = Number(tempValueString);
    let fractionDigit = 0;
    if (digit != null) {
      fractionDigit = digit;
    }
    if (fractionDigit > 0) {
      const temp = +`${Math.round(
        Number(`${Number(tempValue.toString())}e+${fractionDigit}`)
      )}e-${fractionDigit}`;
      let fractionString = '';
      let i = '';
      if (toFixed === true) {
        i = temp.toFixed(fractionDigit);
        fractionString = i.substring(i.indexOf('.'), i.length);
        i = i.substring(0, i.indexOf('.'));
      } else {
        i = temp.toString();
        if (temp.toString().indexOf('.') > 1) {
          fractionString = temp
            .toString()
            .substring(temp.toString().indexOf('.'), temp.toString().length);
          i = temp.toString().substring(0, temp.toString().indexOf('.'));
        }
      }
      return prefix + i.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + fractionString;
    } else {
      const temp = +`${Math.round(
        Number(`${Number(tempValue.toString())}e+${fractionDigit}`)
      )}e-${fractionDigit}`;
      const i = temp.toString();
      return prefix + i.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
  } catch {
    return '';
  }
}

export function getMap<T extends { readonly s: string }>(list: T[]) {
  if (!list) {
    return {};
  }

  return list.reduce<{ readonly [s: string]: T }>(
    (map: { readonly [s: string]: T }, item: T) => {
      const result = { ...map, [item.s]: item };
      return result;
    },
    {}
  );
}

export function translateLocaleText(key: string, defaultValue: string) {
  const value = i18next.t(key);

  return value || defaultValue;
}

export const truncateText = (
  str: string | undefined,
  n: number,
  useWordBoundary = false,
  usePeriodBoundary = false,
  isEllipsis = true
) => {
  if (str == null) {
    return '';
  }

  if (str.length <= n) {
    return str;
  }

  let result = '';
  const ellipsis = '...';
  const subString = str.substr(0, n - 1); // the original check

  if (useWordBoundary) {
    result = subString.substr(0, subString.lastIndexOf(' '));
  } else if (usePeriodBoundary) {
    result = subString.substr(0, subString.lastIndexOf('.') + 1);
  } else {
    result = subString;
  }

  return isEllipsis ? result + ellipsis : result;
};

export const arrayToObject = <T>(array: T[], key: keyof T) =>
  array.reduce<{ readonly [s: string]: T }>(
    (mutableVal, curr) => ({ ...mutableVal, [curr[key as string]]: curr }),
    {}
  );

export const removeFalsy = <T>(obj: T): T => {
  const mutableObj = {};
  Object.keys(obj).forEach((prop) => {
    if (obj[prop] != null) {
      mutableObj[prop] = obj[prop];
    }
  });
  return mutableObj as T;
};

export const nameof = <T>(name: keyof T) => name;

export function arrayMoveItem<T>(
  localArr: T[],
  fromIndex: number,
  toIndex: number
) {
  toIndex = toIndex !== -1 ? toIndex : localArr.length - 1;
  if (fromIndex === toIndex) {
    return;
  }
  const current: T = localArr[fromIndex];
  if (toIndex > fromIndex) {
    for (let i = fromIndex; i < toIndex; i++) {
      localArr[i] = localArr[i + 1];
    }
    localArr[toIndex] = current;
  } else {
    for (let i = fromIndex; i > toIndex; i--) {
      localArr[i] = localArr[i - 1];
    }
    localArr[toIndex] = current;
  }
  return localArr;
}

export const formatRouteName = (...routes: string[]) => '/' + routes.join('/');

export const getRoute = (
  navConfig: INavbar[],
  route?: string,
  subRoute?: string,
  systemType?: SystemType,
  isAuthenticated?: boolean
) => {
  const navBar = navConfig.find(
    (val) =>
      (val.systemType === systemType || val.systemType == null) &&
      val.route === route &&
      val.isAuthenticated === isAuthenticated
  );
  let verifiedRoute: string | undefined;
  let title = navBar?.tab[0]?.title ?? '';

  if (navBar == null) {
    return { title, route: verifiedRoute };
  }

  const tab = navBar.tab.find((val) => val.route === subRoute);
  const subTabs = navBar.tab.find((val) =>
    val.subTab?.find((el) => el.route === subRoute)
  );

  if (tab != null) {
    title = tab.title;
    verifiedRoute = tab.route;
  }

  if (subTabs != null) {
    const subTab = subTabs.subTab?.find((val) => val.route === subRoute);
    if (subTab != null) {
      title = subTab.title;
      verifiedRoute = subTab.route;
    }
  }
  return { title, route: verifiedRoute };
};

export const priceClassRules = (price?: number, symbol?: INewSymbolData) =>
  price != null && symbol != null
    ? price === symbol.re
      ? globalStyles.Ref
      : price === symbol.ce
      ? globalStyles.Ceil
      : price === symbol.fl
      ? globalStyles.Floor
      : symbol.re != null && price > symbol.re
      ? globalStyles.Up
      : symbol.re != null && price < symbol.re
      ? globalStyles.Down
      : globalStyles.Default
    : '';

export const combineSymbolData = (
  newValue: INewSymbolData,
  oldValue?: INewSymbolData
) => {
  if (oldValue == null) {
    return newValue;
  }

  return {
    ...oldValue,
    ...newValue,
    ...(newValue.re && { re: newValue.re }),
    ...(newValue.ce && { ce: newValue.ce }),
    ...(newValue.fl && { fl: newValue.fl }),
    ...(newValue.tb && { tb: newValue.tb }),
    ...(newValue.to && { to: newValue.to }),
    ...(Object.keys(newValue.fr || {}).length === 0 && { fr: oldValue.fr }),
  };
};
export const multiplyBy1000 = (value?: string | number) =>
  formatStringToNumber(value as string) * 1000;

export const multiplyBy1 = (value?: string | number) =>
  formatStringToNumber(value as string) * 1;

export const formatStringToNumber = (value?: string, separator = ',') =>
  typeof value === 'string'
    ? Number(value?.replace(new RegExp(`\\${separator}`, 'g'), ''))
    : value == null
    ? NaN
    : Number(value);

export const parseCookie = (cookie?: string) =>
  cookie
    ?.split(';')
    .map((val) => val.trim().split('='))
    .reduce<
      Array<{
        key: string;
        value: string;
      }>
    >((acc, val) => [...acc, { key: val[0], value: val[1] }], []);

export function isElectron() {
  // Renderer process
  // eslint-disable-next-line: no-string-literal
  if (
    typeof window !== 'undefined' &&
    typeof window.process === 'object' &&
    window.process['type'] === 'renderer'
  ) {
    return true;
  }

  // Main process
  if (
    typeof process !== 'undefined' &&
    typeof process.versions === 'object' &&
    !!process.versions.electron
  ) {
    return true;
  }

  // Detect the user agent when the `nodeIntegration` option is set to false
  if (
    typeof navigator === 'object' &&
    typeof navigator.userAgent === 'string' &&
    navigator.userAgent.indexOf('Electron') >= 0
  ) {
    return true;
  }

  return false;
}

export function roundDown<T>(keys: (keyof T)[], input?: T): T | undefined {
  if (!input) {
    return undefined;
  }
  let roundOutput = { ...input };
  const listKeys = Object.keys(input);
  for (const key of keys) {
    roundOutput = listKeys.includes(key as string)
      ? {
          ...roundOutput,
          [key]: Math.floor(input[key as string]),
        }
      : { ...roundOutput };
  }

  return roundOutput;
}

export function setColumnConfig(key: BoardKey, cols: ColumnState[]) {
  const BOARD_KEY = 'BoardKey';
  let mutableColConfigs = getKey<IColumnConfig[]>(BOARD_KEY);
  const colIds = cols.map((val) => ({
    colId: val.colId,
    hide: val.hide,
    pinned: val.pinned,
  }));
  if (mutableColConfigs != null) {
    let config = mutableColConfigs.find((val) => val.key === key);
    if (config != null) {
      config = { ...config, cols: colIds };
      mutableColConfigs = mutableColConfigs.map((val) =>
        val.key === key && config ? config : val
      );
    } else {
      config = {
        key,
        cols: colIds,
      };
      mutableColConfigs.push(config);
    }
    setKey<IColumnConfig[]>(BOARD_KEY, mutableColConfigs);
  } else {
    setKey<IColumnConfig[]>(BOARD_KEY, [{ key, cols: colIds }]);
  }
}

export function onRowDragEnd(
  stockCode: string,
  newIndex: number,
  selectedWatchlist: IWatchlist | null
) {
  if (selectedWatchlist?.data) {
    const currentIndex = selectedWatchlist.data.findIndex(
      (item) => item === stockCode
    );
    if (currentIndex > -1 && currentIndex !== newIndex) {
      const data = arrayMoveItem(
        selectedWatchlist.data,
        currentIndex,
        newIndex
      );
      if (selectedWatchlist != null) {
        store.dispatch(
          updateWatchlist(
            { ...selectedWatchlist, data },
            {
              type: ToastType.SUCCESS,
              title: 'Update Favorite List',
              content: 'DESTINATION_FAVORITE_LIST_UPDATE_MOVE_SYMBOL',
              contentParams: {},
              time: new Date(),
            }
          )
        );
      }
    }
  }
}
