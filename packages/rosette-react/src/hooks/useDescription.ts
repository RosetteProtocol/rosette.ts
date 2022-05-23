import type { Transaction } from '@blossom-labs/rosette';
import { useEffect, useState } from 'react';

import { useRosette } from '../providers/Rosette';

export const useDescription = (
  tx: Transaction | undefined,
): [string | undefined, boolean, Error | undefined] => {
  const [description, setDescription] = useState<string>();
  const [error, setError] = useState<Error>();
  const [loading, setLoading] = useState(false);
  const { client, provider } = useRosette();

  useEffect(() => {
    if (!tx) {
      return;
    }

    async function fetchDescription(): Promise<void> {
      setLoading(true);
      try {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const d = await client.describe(tx!, provider);
        setDescription(d);
      } catch (e) {
        setError(e as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchDescription();
  }, [client, provider, tx]);

  return [description, loading, error];
};
