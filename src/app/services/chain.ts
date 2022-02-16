import { metadata } from './key-value-metadata'
import { web3 } from './web3';

export interface ChainData {
  id: string,
  name: string,
  txUrlBase: string,
  //key-value pair
  contractAddress: string
}

export class Chain {
  id: string;
  name: string;
  contractAddress: string;
  txUrlBase: string;
  contract: any;
  constructor(data: ChainData) {

    this.id = data.id;
    this.name = data.name;
    this.contractAddress = data.contractAddress;
    this.txUrlBase = data.txUrlBase;

    this.contract = new web3.eth.Contract(metadata, data.contractAddress);
  }

  async getAddress(account: string) {
    return await this.contract.methods.get(account, 'CirrusDestinationAddress').call() as Promise<string>;

  }

  txUrl(txId: string) {
    return this.txUrlBase + txId;
  }

  registerAddress(crsAddress: string):string {
    return this.contract.set('CirrusDestinationAddress', crsAddress);
  }
}

export var chains = [
  {
    id: '0x1',
    name: 'Main',
    contractAddress: '0xa61AB12Eb1964C5b478283d3233270800674aCe0',
    txUrlBase: 'https://etherscan.io/tx/'
  },
  {
    id: '0x3',
    name: 'Ropsten',
    txUrlBase: 'https://ropsten.etherscan.io/tx/',
    contractAddress: '0xa61AB12Eb1964C5b478283d3233270800674aCe0'
  }
].map(data => new Chain(data));

