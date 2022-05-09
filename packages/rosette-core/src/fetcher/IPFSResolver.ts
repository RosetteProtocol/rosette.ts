import fetch from 'isomorphic-fetch';

export const DEFAULT_IPFS_GATEWAY = 'https://ipfs.blossom.software/ipfs/';

const buildIPFSUrlTemplate = (ipfsGateway: string): string =>
  `${ipfsGateway}${
    ipfsGateway.charAt(ipfsGateway.length - 1) !== '/' ? '/' : ''
  }{cid}{path}`;

export class IPFSResolver {
  #urlTemplate: string;

  constructor(ipfsGateway = DEFAULT_IPFS_GATEWAY) {
    this.#urlTemplate = buildIPFSUrlTemplate(ipfsGateway);
  }

  async json(cid: string, path = ''): Promise<any> {
    const url = await this.#buildURL(cid, path);

    const fetchJson = async () => {
      let response;
      let data;

      try {
        response = await fetch(url);
      } catch (_) {
        throw new Error(`Couldn't fetch ${url}.`);
      }

      try {
        data = await response.json();
      } catch (_) {
        throw new Error(`Couldn't parse the result of ${url} as JSON.`);
      }

      return data;
    };

    return fetchJson();
  }

  #buildURL(cid: string, path: string): string {
    const url = this.#urlTemplate.replace(/\{cid\}/, cid);

    if (!path) {
      return url.replace(/\{path\}/, '');
    }
    if (!path.startsWith('/')) {
      path = `/${path}`;
    }
    return url.replace(/\{path\}/, path);
  }
}
