import { IPersistConfig } from 'interfaces/common';
import { IState, rootReducer } from './global-reducers';
import { Storage } from 'redux-persist/es/types';
import { applyMiddleware, compose, createStore } from 'redux';
import { persistReducer, persistStore } from 'redux-persist';
import reduxBlockUIMiddleware from 'react-block-ui/reduxMiddleware';
import sagaMiddlewareFactory from 'redux-saga';
import sagas from './sagas';

const storage: Storage = {
  getItem: (key: string) => {
    console.log(
      (window as any).getKey == null ? 'does not have getKey' : 'has get key'
    );
    const func =
      (window as any).getKey ??
      window.localStorage.getItem.bind(window.localStorage);
    const result: string | Promise<string> | null = func(key);
    if (
      result != null &&
      ((result as unknown) as Promise<string>).then != null
    ) {
      return result;
    }
    return Promise.resolve(result);
  },
  setItem: (key: string, value: string) => {
    const func =
      (window as any).setKey ??
      window.localStorage.setItem.bind(window.localStorage);
    const result: any | Promise<any> | null = func(key, value);
    if (result != null && ((result as unknown) as Promise<any>).then != null) {
      return result;
    }
    return Promise.resolve(result);
  },
  removeItem: (key: string) => {
    const func =
      (window as any).removeKey ??
      window.localStorage.removeItem.bind(window.localStorage);
    const result: any | Promise<any> | null = func(key);
    if (result != null && ((result as unknown) as Promise<any>).then != null) {
      return result;
    }
    return Promise.resolve(result);
  },
};

const persistConfig: IPersistConfig<IState> = {
  storage,
  key: 'root',
  whitelist: [
    'watchlist',
    'selectedWatchlist',
    'symbolList',
    'stockList',
    'cwList',
    'indexList',
    'futuresList',
    'lang',
    'currentSymbol',
    'otpToken',
    'selectedAccount',
    'bankInfo',
    'isSingleClickSpeedOrder',
    'settingsNav',
  ],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const sagaMiddleware = sagaMiddlewareFactory();

const composeEnhancers =
  ((!process.env.NODE_ENV || process.env.NODE_ENV === 'development') &&
    typeof window !== 'undefined' &&
    (window['__REDUX_DEVTOOLS_EXTENSION_COMPOSE__'] as typeof compose)) || // eslint-disable-line
  compose;

const store = createStore(
  persistedReducer,
  composeEnhancers(applyMiddleware(sagaMiddleware, reduxBlockUIMiddleware))
);

sagaMiddleware.run(sagas);

export const persistor = persistStore(store);

export default store;
