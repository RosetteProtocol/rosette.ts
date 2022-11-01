import type { providers } from 'ethers';

import type { TypedValue } from '../evaluator';
import type { HelperManager } from '../helpers';

export type HelperConfig = {
  helperManager: HelperManager;
  provider: providers.Provider;
  // Aditional config data the helper may need
  [x: string]: unknown;
};

export type RadspecHelper = (
  ...params: any[]
) => TypedValue | Promise<TypedValue>;

export type UninitializedRadspecHelper = (
  config: HelperConfig,
) => RadspecHelper;
