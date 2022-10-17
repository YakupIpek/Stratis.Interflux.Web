import { Environment } from 'src/app/Environment';
import { ChainName } from 'src/app/services/chain';

export const environment: Environment = {
  production: true,
  apiEndpoint: 'https://cirrushelperapi-testnet.azurewebsites.net',
  wstraxaddress: '0xf128715b5AF562b2B45BBc8ede79973Ff48C3815',
  wstraxaddressprefix: 120,
  chain: ChainName.Sepolia,
  alchemyApiKey: 'demo'
};
