import { TIME_FORMAT_INPUT } from 'constants/main';
import { formatStringToDate, formatTimeToUTC } from 'utils/datetime';

export const getChartData = (
  c?: number,
  mv?: number,
  ti?: string,
  offsetTimeZone?: number
) => {
  let value: [number, number] = [0, 0];
  let volume: [number, number] = [0, 0];
  if (ti != null) {
    const time = formatTimeToUTC(
      formatStringToDate(ti, TIME_FORMAT_INPUT),
      offsetTimeZone
    );
    if (c != null) {
      value = [time, c];
    }
    if (mv != null) {
      volume = [time, mv];
    }
  }

  return { value, volume };
};
