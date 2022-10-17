import { Contract, ethers } from 'ethers';
import { metadata } from './key-value-metadata'

export enum ChainName {
  Main = 'Main',
  Sepolia = 'Sepolia'
}

export interface ChainData {
  id: string,
  name: ChainName,
  /**multi-sig address*/
  multisigAddress: string;
  kvStoreAddress: string,
  txUrlBase: string,
}

export class Chain {
  id: string;
  name: ChainName;

  /**multi-sig address*/
  multisigAddress: string;
  kvStoreAddress: string;
  txUrlBase: string;
  contract: Contract;

  constructor(data: ChainData, private web3Provider: ethers.providers.Web3Provider) {

    this.id = data.id;
    this.name = data.name;
    this.kvStoreAddress = data.kvStoreAddress;
    this.multisigAddress = data.multisigAddress;
    this.txUrlBase = data.txUrlBase;

    this.contract = new Contract(data.kvStoreAddress, metadata, web3Provider);
  }

  async getAddress(account: string) {
    return await this.contract['get'](account, 'CirrusDestinationAddress') as Promise<string>;
  }

  txUrl(txId: string) {
    return this.txUrlBase + txId;
  }

  registerAddressCall(crsAddress: string): string {
    return this.contract.interface.encodeFunctionData('set', ['CirrusDestinationAddress', crsAddress]);
  }
}

export const CHAINS: ChainData[] = [
  {
    id: '0x1',
    name: ChainName.Main,
    kvStoreAddress: '0x479b5ed883e49d31a7dcee3a3c872efde4dcfee9',
    multisigAddress: '0x14F768657135D3DaAFB45D242157055f1C9143f3',
    txUrlBase: 'https://etherscan.io/tx/'
  },
  {
    id: '0xaa36a7',
    name: ChainName.Sepolia,
    multisigAddress: '0x14F768657135D3DaAFB45D242157055f1C9143f3',
    kvStoreAddress: '0x5Da5cFe7D4Ce1cC0712eBC0BB58EFF93817A6801',//Multi-sig address contract
    txUrlBase: 'https://sepolia.etherscan.io/tx/',
  }
];
