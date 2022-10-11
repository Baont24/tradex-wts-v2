import { LOCALIZATION_CHANGE_LANGUAGE } from 'redux/actions';
import { Lang } from 'constants/enum';

export const changeLanguage = (data: Lang) => ({
  type: LOCALIZATION_CHANGE_LANGUAGE,
  data,
});
