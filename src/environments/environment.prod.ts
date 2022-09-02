import { Environment } from 'src/app/Environment';
import { ChainName } from 'src/app/services/chain';

export const environment: Environment = {
  production: true,
  apiEndpoint: 'https://cirrushelperapi-testnet.azurewebsites.net',
  wstraxaddress: '0xde09a7cb4c7631f243e5a5454cbb02404aea65e7',
  wstraxaddressprefix: 120,
  chain: ChainName.Ropsten,
  alchemyApiKey: 'demo'
};
