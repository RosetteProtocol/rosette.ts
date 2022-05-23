import type { Evaluator, TypedValue } from '../evaluator';

export type HelperConfig = {
  evaluator: Evaluator;
};

export type RadspecHelper = (
  config: HelperConfig,
) => (...params: any[]) => TypedValue | Promise<TypedValue>;
