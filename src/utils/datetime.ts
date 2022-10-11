import * as dateFns from 'date-fns';
import {
  DATE_FORMAT_DISPLAY,
  DATE_FORMAT_INPUT,
  DATE_TIME_FORMAT_INPUT,
  TIME_FORMAT_DISPLAY,
} from 'constants/main';
import i18next from 'i18next';

export function formatDateToString(
  date?: Date,
  formatOutput = DATE_FORMAT_INPUT
) {
  if (date == null) {
    return date;
  }
  return dateFns.format(date, formatOutput);
}

export function formatNotificationTimeToDisplay(notificationTime: Date) {
  const now = new Date();
  const delta = (now.getTime() - notificationTime.getTime()) / 1000;
  if (delta < 60) {
    return i18next.t('SECOND_AGO', { count: Math.round(delta) });
  }
  if (delta < 3600) {
    return i18next.t('MINUTE_AGO', { count: Math.round(delta / 60) });
  }
  if (delta <= 86400) {
    return i18next.t('HOUR_AGO', { count: Math.round(delta / 3600) });
  }
  return formatDateToString(notificationTime, DATE_FORMAT_DISPLAY);
}

export function formatTimeToDisplay(
  stringInput?: string,
  formatOutput = TIME_FORMAT_DISPLAY,
  formatInput = DATE_TIME_FORMAT_INPUT,
  ignoreTimeZone?: boolean
) {
  try {
    if (!stringInput) {
      return null;
    }
    let time = dateFns.parse(stringInput, formatInput, new Date());
    if (ignoreTimeZone !== true) {
      time = dateFns.addHours(time, 7);
    }
    return dateFns.format(time, formatOutput);
  } catch (error) {
    return null;
  }
}

export function formatDateToDisplay(
  stringInput?: string,
  formatOutput = DATE_FORMAT_DISPLAY,
  formatInput = DATE_FORMAT_INPUT,
  ignoreTimeZone?: boolean
) {
  try {
    if (!stringInput) {
      return null;
    }
    let time = dateFns.parse(stringInput, formatInput, new Date());
    if (ignoreTimeZone !== true) {
      time = dateFns.addHours(time, 7);
    }
    return dateFns.format(time, formatOutput);
  } catch (error) {
    return null;
  }
}

export function formatStringToDate(
  stringInput: string | undefined,
  formatInput = DATE_FORMAT_INPUT
) {
  if (stringInput == null) {
    return new Date();
  }

  return dateFns.parse(stringInput, formatInput, new Date());
}

export function addDays(date: Date, day: number) {
  return dateFns.addDays(date, day);
}

export function formatTimeToUTC(a: Date, offsetTimeZone = 0) {
  const year = a.getFullYear();
  const month = a.getMonth();
  const date = a.getDate();
  const hour = a.getHours();
  const min = a.getMinutes();
  const sec = a.getSeconds();
  return Date.UTC(year, month, date, hour + offsetTimeZone, min, sec);
}

export function getDateAMonthAgo() {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
}
