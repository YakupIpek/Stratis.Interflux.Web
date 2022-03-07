import { BigNumber, Contract, ethers } from 'ethers';
import { Chain } from './chain';
import { metadata } from './erc20-metadata';
declare let base58Check: any;

export class Token {
  id: number;
  ticker: string;
  chain: Chain;
  title: string;
  erc20: string;
  destination: 'Strax' | 'Cirrus';
  addressPrefix: number;
  contract: Contract;

  constructor(data: TokenData, chain: Chain, id: number, ether: ethers.providers.Web3Provider) {
    this.id = id;
    this.ticker = data.ticker;
    this.chain = chain;
    this.title = data.title;
    this.destination = data.destination;
    this.erc20 = data.erc20;
    this.addressPrefix = data.addressPrefix;

    this.contract = new Contract(data.erc20, metadata, ether);

  }

  async balance(address: string): Promise<string> {
    const balance = await this.contract['balanceOf'](address) as BigNumber;
    return balance.toString();
  }
  burnCall(amount: string, address: string): string {
    return this.contract.interface.encodeFunctionData('burn', [amount, address]);
  }

  transferCall(to: string, amount: string): string {
    return this.contract.interface.encodeFunctionData('transfer', [to, amount]);
  }

  /**Validates destination address for cirrus or strax networks */
  validateAddress(address: string) {
    try {
      var result = base58Check.decode(address);
      return result.prefix[0] == this.addressPrefix;
    } catch (e) {
      return false;
    }
  }
}

interface TokenData {
  ticker: string,
  chain: 'Main' | 'Ropsten',
  title: string,
  destination: 'Strax' | 'Cirrus',
  erc20: string,
  addressPrefix: number;
}

export const TOKENS: TokenData[] = [
  {
    ticker: 'WSTRAX',
    chain: 'Main',
    title: 'WStrax => Strax',
    destination: 'Strax',
    erc20: '0xa3c22370de5f9544f0c4de126b1e46ceadf0a51b',
    addressPrefix: 75
  },
  {
    ticker: 'WETH',
    chain: 'Main',
    title: 'Wrapped ETH',
    destination: 'Cirrus',
    erc20: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    addressPrefix: 127
  },
  {
    ticker: 'WBTC',
    chain: 'Main',
    title: 'Wrapped BTC',
    destination: 'Cirrus',
    erc20: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    addressPrefix: 127
  },
  {
    ticker: 'USDC',
    chain: 'Main',
    title: 'USDC',
    destination: 'Cirrus',
    erc20: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    addressPrefix: 127
  },
  {
    ticker: 'USDT',
    chain: 'Main',
    title: 'USDT',
    destination: 'Cirrus',
    erc20: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    addressPrefix: 127
  },
  {
    ticker: 'LINK',
    chain: 'Main',
    title: 'LINK',
    destination: 'Cirrus',
    erc20: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
    addressPrefix: 127
  },
  {
    ticker: 'SHIB',
    chain: 'Main',
    title: 'SHIB',
    destination: 'Cirrus',
    erc20: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
    addressPrefix: 127
  },

  //
  {
    ticker: 'WSTRAX',
    chain: 'Ropsten',
    title: 'WStrax => Strax',
    destination: 'Strax',
    erc20: '0xde09a7cb4c7631f243e5a5454cbb02404aea65e7',
    addressPrefix: 120
  },
  {
    ticker: 'TST-2',
    chain: 'Ropsten',
    title: 'Token 2',
    destination: 'Cirrus',
    erc20: '0xf197f5f8c406d269e2cc44aaf495fbc4eb519634',
    addressPrefix: 127
  },
  {
    ticker: 'TST-3',
    chain: 'Ropsten',
    title: 'Token 3',
    destination: 'Cirrus',
    erc20: '0xa3c22370de5f9544f0c4de126b1e46ceadf0a51b',
    addressPrefix: 127
  },
  {
    ticker: 'TST-4',
    chain: 'Ropsten',
    title: 'Token 4',
    destination: 'Cirrus',
    erc20: '0x5da5cfe7d4ce1cc0712ebc0bb58eff93817a6801',
    addressPrefix: 127
  },
  {
    ticker: 'TST-5',
    chain: 'Ropsten',
    title: 'Token 5',
    destination: 'Cirrus',
    erc20: '0x14f768657135d3daafb45d242157055f1c9143f3',
    addressPrefix: 127
  }
];
