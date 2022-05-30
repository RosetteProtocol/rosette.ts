import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';

dayjs.extend(advancedFormat);

import { TypedValue } from '../evaluator';
import type { RadspecHelper } from '../types';

export const formatDate: RadspecHelper =
  () =>
  /**
   * Format a timestamp as a string
   *
   * @param {*} timestamp Unix timestamp in seconds
   * @param {string} [format='MMM. Do YYYY'] Format for the date, defaults to a format like "Jan. 1st 2000"
   * @return {Promise<radspec/evaluator/TypedValue>}
   */
  (timestamp: number | string, format = 'MMM. Do YYYY') =>
    new TypedValue(
      'string',
      dayjs(new Date(Number(timestamp) * 1000)).format(format),
    );
