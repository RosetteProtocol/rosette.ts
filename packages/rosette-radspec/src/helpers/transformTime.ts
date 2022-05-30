import dayjs from 'dayjs';
import type { DurationUnitType } from 'dayjs/plugin/duration';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(duration);
dayjs.extend(relativeTime);

import { TypedValue } from '../evaluator';
import type { RadspecHelper } from '../types';

export const transformTime: RadspecHelper =
  () =>
  /**
   * Transform between time units.
   *
   * @param {*} time The base time amount
   * @param [toUnit] The unit to convert the time to
   * @param {string} [fromUnit='second'] The unit to convert the time from
   * @return {Promise<radspec/evaluator/TypedValue>}
   */
  (
    time: number | string,
    toUnit?: DurationUnitType,
    fromUnit: DurationUnitType = 'seconds',
  ) => {
    const timeFromDuration = dayjs.duration(Number(time), fromUnit);

    const timeToDuration = toUnit
      ? dayjs.duration(timeFromDuration.as(toUnit), toUnit)
      : timeFromDuration;

    return new TypedValue('string', timeToDuration.humanize());
  };
