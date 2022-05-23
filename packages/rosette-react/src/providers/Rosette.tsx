import type {
  Client as RosetteClient,
  ClientOptions as RosetteClientOptions,
} from '@blossom-labs/rosette';
import { Client } from '@blossom-labs/rosette';
import type { providers } from 'ethers';
import type { ReactNode } from 'react';
import { createContext, useContext, useMemo } from 'react';

type RosetteContext = {
  client: RosetteClient;
  provider: providers.Provider;
};

export type RosetteProviderProps = {
  children: ReactNode;
  options?: RosetteClientOptions;
  provider: providers.Provider;
};

export const RosetteContext = createContext<RosetteContext | undefined>(
  undefined,
);

export const RosetteProvider = ({
  children,
  options,
  provider,
}: RosetteProviderProps) => {
  const client = useMemo(() => new Client(options), [options]);

  return (
    <RosetteContext.Provider value={{ client, provider }}>
      {children}
    </RosetteContext.Provider>
  );
};

export const useRosette = () => {
  const rosetteContext = useContext(
    RosetteContext,
  ) as unknown as RosetteContext;

  if (!rosetteContext) {
    throw new Error('useRosette must be used within RosetteProvider');
  }

  return rosetteContext;
};
