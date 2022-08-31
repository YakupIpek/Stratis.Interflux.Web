import { Environment } from './environment';
import { ChainName } from 'src/app/services/chain';

export const environment: Environment = {
  production: true,
  apiEndpoint: 'https://interflux-rates.stratisplatform.com',
  wstraxaddress: '0xa3c22370de5f9544f0c4de126b1e46ceadf0a51b',
  wstraxaddressprefix: 75,
  chain: ChainName.Main,
  alchemyApiKey: 'demo'
};
