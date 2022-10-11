import { GLOBAL_LANG, LOCALIZATION_CHANGE_LANGUAGE } from 'redux/actions';
import { Global } from 'constants/main';
import { IRequest, ISelf } from 'interfaces/common';
import { IState } from 'redux/global-reducers';
import { Lang } from 'constants/enum';
import { call, put, select, takeLatest } from 'redux-saga/effects';
import { query } from 'utils/socketApi';
import config from 'config';
import i18n from 'i18next';

declare var self: ISelf;
export const changeLanguage = (param: { readonly language: string }) => {
  return query(config.apis.changeLanguage, param);
};
function* doChangeLanguage(request: IRequest<Lang>) {
  try {
    self.lang = request.data as Lang;
    yield put({ type: GLOBAL_LANG, payload: request.data });
    i18n.changeLanguage(self.lang);
    if (Global.tvSymbolStorage != null) {
      Global.tvSymbolStorage.reInitLang(self.lang);
    }
    const isAuthenticated: IState = yield select((state: IState) => ({
      isAuthenticated: state.isAuthenticated,
    }));
    if (isAuthenticated) {
      yield call(changeLanguage, { language: request.data });
    }
  } catch (err) {
    console.error('Change language', err);
    return;
  }
}

export default function* watchChangeLanguage() {
  yield takeLatest(LOCALIZATION_CHANGE_LANGUAGE, doChangeLanguage);
}
