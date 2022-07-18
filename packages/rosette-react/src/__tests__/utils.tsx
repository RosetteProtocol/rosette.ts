import { DEFAULT_TEST_SERVER_CONFIG } from '@blossom-labs/rosette-test';
import type { RenderHookOptions } from '@testing-library/react';
import { waitFor as defaultWaitFor, renderHook } from '@testing-library/react';
import { providers } from 'ethers';

import type { RosetteProviderProps } from '../providers/Rosette';
import { RosetteProvider } from '../providers/Rosette';

const { ipfsGateway, network, rpcEndpoint } = DEFAULT_TEST_SERVER_CONFIG;

type ProviderProps = Partial<RosetteProviderProps> & {
  children?:
    | React.ReactElement<any, string | React.JSXElementConstructor<any>>
    | React.ReactNode;
};

const AllProviders = ({
  children,
  provider,
  options,
  ...props
}: ProviderProps) => {
  const provider_ = provider ?? new providers.JsonRpcProvider(rpcEndpoint);
  const options_ = options ?? {
    fetcherOptions: { rosetteNetworkId: network, ipfsGateway },
  };

  return (
    <RosetteProvider provider={provider_} options={options_} {...props}>
      {children}
    </RosetteProvider>
  );
};

export const renderRosetteHook = <TProps, TResult>(
  hook: (props: TProps) => TResult,
  {
    wrapper: wrapper_,
    ...options_
  }: RenderHookOptions<TProps & ProviderProps> | undefined = {},
) => {
  const defaultWrapper = (props: any) =>
    AllProviders({ ...props, ...options_.initialProps });

  const options = {
    wrapper: wrapper_ ?? defaultWrapper,
    ...options_,
  };

  const result = renderHook<TResult, TProps>(hook, options);

  return {
    ...result,
    waitFor:
      (result as { waitFor?: typeof defaultWaitFor }).waitFor ?? defaultWaitFor,
  };
};
