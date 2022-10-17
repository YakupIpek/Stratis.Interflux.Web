import { BigNumber, Contract, ethers } from 'ethers';
import * as internal from 'stream';
import { Chain, ChainName } from './chain';
import { metadata } from './erc20-metadata';
import { erc721metadata } from './erc721-metadata';
declare let base58Check: any;

export enum Destination {
  Strax = 'Strax',
  Cirrus = 'Cirrus',
  CirrusNft = 'Cirrus NFT'
}

export class Token {
  id: number;
  ticker: string;
  chain: Chain;
  title: string;
  erc20: string;
  destination: Destination;
  addressPrefix: number;
  contract: Contract;
  decimals: number;

  constructor(data: TokenData, chain: Chain, id: number, ether: ethers.providers.Web3Provider) {
    this.id = id;
    this.ticker = data.ticker;
    this.chain = chain;
    this.title = data.title;
    this.destination = data.destination;
    this.erc20 = data.erc20;
    this.addressPrefix = data.addressPrefix;
    this.decimals = data.decimals;

    this.contract = new Contract(data.erc20, data.destination == Destination.CirrusNft ? erc721metadata : metadata, ether);
  }

  async balance(address: string): Promise<string> {
    const balance = await this.contract['balanceOf'](address) as BigNumber;
    return balance.toString();
  }

  burnCall(amount: string, address: string): string {
    return this.contract.interface.encodeFunctionData('burn', [amount, address]);
  }

  /* Transfer method used only for ERC721-compatible tokens */
  nftTransferCall(from: string, to: string, tokenIdentifier: number): string {
    return this.contract.interface.encodeFunctionData('transferFrom', [from, to, tokenIdentifier]);
  }

  /* Transfer method used only for ERC20-compatible tokens */
  transferCall(to: string, amount: string): string {
    return this.contract.interface.encodeFunctionData('transfer', [to, amount]);
  }

  /* Validates destination address for cirrus or strax networks */
  validateAddress(address: string) {
    try {
      var result = base58Check.decode(address);
      return result.prefix[0] == this.addressPrefix;
    } catch (e) {
      return false;
    }
  }
}

interface SupportedContractAddress {
  decimals: number;
  nativeChainAddress: string;
  nativeNetwork: string;
  src20Address: string;
  tokenName: string;
  title: string;
  addressPrefix: number;
}

interface SupportedNftContractAddress {
  nativeChainAddress: string;
  nativeNetwork: string;
  src721Address: string;
  tokenName : string;
  title: string;
  addressPrefix: number;
}

export interface InterFluxTokenResponse {
  supportedTokenContractAddresses: SupportedContractAddress[];
  supportedNftContractAddresses: SupportedNftContractAddress[];
}

export interface TokenData {
  ticker: string,
  chain: ChainName,
  title: string,
  destination: Destination,
  erc20: string,
  addressPrefix: number;
  decimals: number;
}

export const TOKENS: TokenData[] = [
  {
    ticker: 'WSTRAX',
    chain: ChainName.Main,
    title: 'WStrax => Strax',
    destination: Destination.Strax,
    erc20: '0xa3c22370de5f9544f0c4de126b1e46ceadf0a51b',
    addressPrefix: 75,
    decimals: 18
  },
  {
    ticker: 'WETH',
    chain: ChainName.Main,
    title: 'Wrapped ETH',
    destination: Destination.Cirrus,
    erc20: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    addressPrefix: 28,
    decimals: 18
  },
  {
    ticker: 'WBTC',
    chain: ChainName.Main,
    title: 'Wrapped BTC',
    destination: Destination.Cirrus,
    erc20: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    addressPrefix: 28,
    decimals: 8
  },
  {
    ticker: 'USDC',
    chain: ChainName.Main,
    title: 'USDC',
    destination: Destination.Cirrus,
    erc20: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    addressPrefix: 28,
    decimals: 6
  },
  {
    ticker: 'USDT',
    chain: ChainName.Main,
    title: 'USDT',
    destination: Destination.Cirrus,
    erc20: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    addressPrefix: 28,
    decimals: 6
  },
  {
    ticker: 'LINK',
    chain: ChainName.Main,
    title: 'LINK',
    destination: Destination.Cirrus,
    erc20: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
    addressPrefix: 28,
    decimals: 18
  },
  {
    ticker: 'SHIB',
    chain: ChainName.Main,
    title: 'SHIB',
    destination: Destination.Cirrus,
    erc20: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
    addressPrefix: 28,
    decimals: 18
  },

  //
  {
    ticker: 'WSTRAX',
    chain: ChainName.Sepolia,
    title: 'WStrax => Strax',
    destination: Destination.Strax,
    erc20: '0xf128715b5AF562b2B45BBc8ede79973Ff48C3815',
    addressPrefix: 120,
    decimals: 18
  },
  {
    ticker: 'TSZ1',
    chain: ChainName.Sepolia,
    title: 'Test Token Z1',
    destination: Destination.Cirrus,
    erc20: '0xE4a444CB3222fd8E9518dB8F70A33aaDb9a1a358',
    addressPrefix: 127,
    decimals: 18
  },
  {
    ticker: 'TSZ2',
    chain: ChainName.Sepolia,
    title: 'Test Token Z2',
    destination: Destination.Cirrus,
    erc20: '0xF197f5f8c406d269E2cc44Aaf495fBC4EB519634',
    addressPrefix: 127,
    decimals: 8
  },
  {
    ticker: 'TSZ3',
    chain: ChainName.Sepolia,
    title: 'Test Token Z3',
    destination: Destination.Cirrus,
    erc20: '0xa3C22370de5f9544f0c4De126b1e46cEadF0A51B',
    addressPrefix: 127,
    decimals: 6
  },
];
