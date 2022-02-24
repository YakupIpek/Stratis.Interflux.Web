import { metadata } from './key-value-metadata'
import { web3 } from './web3';

export interface ChainData {
  id: string,
  name: 'Ropsten' | 'Main',
  /**multi-sig address*/
  contractAddress: string,
  txUrlBase: string,
}

export class Chain {
  id: string;
  name: 'Ropsten' | 'Main';

  /**multi-sig address*/
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

  registerAddressCall(crsAddress: string): string {
    return this.contract.methods.set('CirrusDestinationAddress', crsAddress).encodeABI();
  }
}

let items: ChainData[] = [
  {
    id: '0x1',
    name: 'Main',
    contractAddress: '0xa61AB12Eb1964C5b478283d3233270800674aCe0',//Multi-sig address contract
    txUrlBase: 'https://etherscan.io/tx/'
  },
  {
    id: '0x3',
    name: 'Ropsten',
    contractAddress: '0xd2390da742872294BE05dc7359D7249d7C79460E',//Multi-sig address contract
    txUrlBase: 'https://ropsten.etherscan.io/tx/',
  }
]

export let chains = items.map(data => new Chain(data));

