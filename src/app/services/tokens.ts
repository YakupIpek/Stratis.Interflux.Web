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
