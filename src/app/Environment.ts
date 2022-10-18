import { ChainName } from 'src/app/services/chain';

export interface Environment {
    production: boolean;
    apiEndpoint: string;
    wstraxaddress: string;
    wstraxaddressprefix: number;
    chain: ChainName;
    moralisApiKey: string;
  }