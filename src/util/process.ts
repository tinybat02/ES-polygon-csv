import { Frame, CSVRow } from '../types';
import * as dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const processData = (data: Array<Frame>) => {
  let num_stats: { polygon: { [key: string]: number[] }; time: number[] } = {
      polygon: {},
      time: data[0].fields[1].values.buffer,
    },
    duration_stats: { polygon: { [key: string]: (null | number)[] }; time: number[] } = {
      polygon: {},
      time: data[0].fields[1].values.buffer,
    };

  data.map(category => {
    if (!category.name) return;
    if (category.name.startsWith('num')) {
      num_stats.polygon[category.name.split('num')[1]] = category.fields[0].values.buffer;
    } else {
      duration_stats.polygon[category.name] = category.fields[0].values.buffer;
    }
  });

  return { num_stats, duration_stats };
};

export const csvProcess = (
  stats: { polygon: { [key: string]: Array<number | null> }; time: number[] },
  timezone: string,
  flat_area: { [key: string]: number },
  isTime: Boolean = false
) => {
  const result: CSVRow[] = [];
  stats.time.map((ti, idx) => {
    const dayobj = dayjs.unix(ti / 1000).tz(timezone);

    const obj: { Timestamp: string; [key: string]: any } = { Timestamp: '' };
    obj.Timestamp = dayobj.format('YYYY-MM-DD HH:00');
    if (isTime)
      Object.keys(stats.polygon).map(store => {
        if (flat_area[store]) {
          const tmp = stats.polygon[store][idx] || 0;
          obj[store] = tmp / 60 / flat_area[store];
        }
      });
    else
      Object.keys(stats.polygon).map(store => {
        if (flat_area[store]) {
          obj[store] = (stats.polygon[store][idx] || 0) / flat_area[store];
        }
      });

    result.push(obj);
  });

  return result;
};
