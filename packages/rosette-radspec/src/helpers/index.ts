import HelperManager from './HelperManager';
import { echo } from './echo';
import { formatDate } from './formatDate';
import { fromHex } from './fromHex';
import { formatPct } from './formatPct';
import { withDecimals } from './withDecimals';
import { tokenAmount } from './tokenAmount';
import { transformTime } from './transformTime';
import type { MetadataFetcher as RadspecHelperMetadataFetcher } from './radspec';
import { radspec } from './radspec';
import type { UninitializedRadspecHelper } from '../types';

const defaultHelpers: Record<string, UninitializedRadspecHelper> = {
  echo,
  formatDate,
  formatPct,
  fromHex,
  tokenAmount,
  transformTime,
  withDecimals,
};

export type { RadspecHelperMetadataFetcher };
export {
  HelperManager,
  defaultHelpers,
  echo,
  formatDate,
  formatPct,
  fromHex,
  radspec,
  transformTime,
  tokenAmount,
  withDecimals,
};
