import { Contract, ethers } from 'ethers';
import { metadata } from './key-value-metadata'

export interface ChainData {
  id: string,
  name: 'Ropsten' | 'Main',
  /**multi-sig address*/
  multisigAddress: string;
  kvStoreAddress: string,
  txUrlBase: string,
}

export class Chain {
  id: string;
  name: 'Ropsten' | 'Main';

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
    name: 'Main',
    kvStoreAddress: '0x479b5ed883e49d31a7dcee3a3c872efde4dcfee9',
    multisigAddress: '0x14F768657135D3DaAFB45D242157055f1C9143f3',
    txUrlBase: 'https://etherscan.io/tx/'
  },
  {
    id: '0x3',
    name: 'Ropsten',
    multisigAddress: '0xd2390da742872294BE05dc7359D7249d7C79460E',
    kvStoreAddress: '0xa61AB12Eb1964C5b478283d3233270800674aCe0',//Multi-sig address contract
    txUrlBase: 'https://ropsten.etherscan.io/tx/',
  }
];

