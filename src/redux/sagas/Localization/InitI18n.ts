import * as Backend from 'i18next-chained-backend';
import * as LocalStorageBackend from 'i18next-localstorage-backend';
import * as XHR from 'i18next-xhr-backend';
import {
  GLOBAL_I18N,
  GLOBAL_LANG,
  LOCALIZATION_INIT_I18N,
} from 'redux/actions';
import { IAction, IError, ILocale, IResponse, ISelf } from 'interfaces/common';
import { IState } from 'redux/global-reducers';
import { Lang } from 'constants/enum';
import { call, put, select, takeLatest } from 'redux-saga/effects';
import { getKey, setKey } from 'utils/localStorage';
import { query } from 'utils/socketApi';
import { reactI18nextModule } from 'react-i18next';
import config from 'config';
import i18n from 'i18next';

declare var self: ISelf;

const getLocaleData = () => {
  return query(config.apis.locale, {
    msNames: ['wts', 'common'],
  });
};

const handleVersion = async (data: ILocale[], lang: Lang) => {
  return new Promise((resolve: Function) => {
    const mutableVersions: Partial<Record<Lang, string>> = {};
    const mutableDefaultResources: Record<string, string> = {};
    const langs = Object.values(Lang);

    data.forEach((val) => {
      const element = val;
      mutableVersions[element.lang] = element.latestVersion;

      if (val.lang === Lang.EN) {
        if (val.files) {
          for (let j = 0; j < val.files.length; j++) {
            const file = val.files[j];
            mutableDefaultResources[file.namespace] = file.url;
          }
        }
      }
    });

    langs.forEach((val) => {
      if (mutableVersions[val] == null) {
        mutableVersions[val] = '1.0';
      }
    });

    i18n.use(Backend).use(reactI18nextModule);
    i18n.init(
      {
        debug: false,
        lng: lang,
        fallbackLng: Lang.EN,
        preload: langs,
        // have a common namespace used around the full app
        ns: ['common', 'message', 'tuxedo'],
        defaultNS: 'common',
        fallbackNS: ['message', 'tuxedo'],
        interpolation: {
          escapeValue: false, // not needed for react as it does escape per default to prevent xss!
        },
        backend: {
          backends: [
            LocalStorageBackend, // primary
            XHR, // fallback
          ],
          backendOptions: [
            {
              // prefix for stored languages
              prefix: 'i18next_res_',

              // expiration
              expirationTime: 1, // 365 * 24 * 60 * 60 * 1000, //365 days

              // language versions
              versions: mutableVersions,
            },
            {
              loadPath: (languages: string[], namespaces: string[]) => {
                for (let i = 0; i < data.length; i++) {
                  const element = data[i];
                  if (element.lang === languages[0]) {
                    for (let j = 0; j < element.files.length; j++) {
                      const file = element.files[j];
                      if (file.namespace === namespaces[0]) {
                        return file.url;
                      }
                    }
                  }
                }
                return mutableDefaultResources[namespaces[0]];
              },
              crossDomain: true,
            },
          ],
        },
        react: {
          // wait: true,
        },
        keySeparator: false,
        nsSeparator: false,
      },
      () => {
        resolve(i18n);
      }
    );
  });
};

function* doInitI18n(request: IAction<ILocale[] | undefined>) {
  try {
    const lang: Lang = yield select((state: IState) => state.lang);
    self.lang = lang;
    yield put({ type: GLOBAL_LANG, payload: lang });

    if (request.payload != null) {
      yield handleVersion(request.payload, lang);
    } else {
      const localeLocalData = getKey<ILocale[]>('i18n');

      if (localeLocalData != null) {
        yield handleVersion(localeLocalData, lang);

        getLocaleData()
          .then((response: IResponse<ILocale[]>) => {
            setKey('i18n', response.data);
          })
          .catch((err: IError) => {
            console.error(err);
          });
      } else {
        const localeData: IResponse<ILocale[]> = yield call(getLocaleData);

        setKey('i18n', localeData.data);

        yield handleVersion(localeData.data, lang);
      }
    }

    yield put({ type: GLOBAL_I18N });
  } catch (err) {
    console.error('Init i18n', err);
  }
}

export default function* watchInitI18n() {
  yield takeLatest(LOCALIZATION_INIT_I18N, doInitI18n);
}
