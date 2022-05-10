import {
  addDays,
  addHours,
  addMilliseconds,
  addMinutes,
  addMonths,
  addSeconds,
  addWeeks,
  addYears,
  formatDistanceStrict,
} from 'date-fns';

import { TypedValue } from '../evaluator';

type TimeUnit =
  | 'second'
  | 'minute'
  | 'hour'
  | 'day'
  | 'month'
  | 'year'
  | 'best'
  | undefined;

const BEST_UNIT = 'best';

const ADD_UNIT_FN = new Map([
  ['millisecond', addMilliseconds],
  ['second', addSeconds],
  ['minute', addMinutes],
  ['hour', addHours],
  ['day', addDays],
  ['week', addWeeks],
  ['month', addMonths],
  ['year', addYears],
]);
const DISALLOWED_FROM_UNITS = new Set(['millisecond']);

export default () =>
  /**
   * Transform between time units.
   *
   * @param {*} time The base time amount
   * @param [toUnit] The unit to convert the time to.
   *                          Defaults to using the "best" unit
   * @param {string} [fromUnit='second'] The unit to convert the time from
   * @return {Promise<radspec/evaluator/TypedValue>}
   */
  async (
    time: number | string,
    toUnit: TimeUnit = BEST_UNIT,
    fromUnit = 'second',
  ): Promise<TypedValue> => {
    if (DISALLOWED_FROM_UNITS.has(fromUnit) || !ADD_UNIT_FN.has(fromUnit)) {
      throw new Error(
        `@transformTime: Time unit '${fromUnit}' is not supported as a fromUnit`,
      );
    }

    if (toUnit !== BEST_UNIT && !ADD_UNIT_FN.has(toUnit)) {
      throw new Error(
        `@transformTime: Time unit '${toUnit}' is not supported as a toUnit`,
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const addTime = ADD_UNIT_FN.get(fromUnit)!;

    const zeroDate = new Date(0);
    const duration = addTime(zeroDate, Number(time));

    return new TypedValue(
      'string',
      formatDistanceStrict(
        zeroDate,
        duration,
        toUnit !== BEST_UNIT ? { unit: toUnit } : {},
      ),
    );
  };
