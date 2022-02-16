import { Chain, chains } from './chain';
import { metadata } from './erc20-metadata';
import { web3 } from './web3';

export class Token {
  id: number;
  ticker: string;
  chain: Chain;
  title: string;
  erc20: string;
  destination: 'Strax' | 'Cirrus';
  private contract: any;

  constructor(data: TokenData, id: number) {
    this.id = id;
    this.ticker = data.ticker;
    this.chain = data.chain;
    this.title = data.title;
    this.destination = data.destination;
    this.erc20 = data.erc20;
    this.contract = new web3.eth.Contract(metadata, data.erc20);
  }
}

interface TokenData {
  ticker: string,
  chain: Chain,
  title: string,
  destination: 'Strax' | 'Cirrus',
  erc20: string
}

var mainnet = chains[0];
var ropsten = chains[1];

export var tokenValues: TokenData[] = [
  {
    ticker: 'WSTRAX',
    chain: mainnet,
    title: 'WStrax => Strax',
    destination: 'Strax',
    erc20: '0xa3c22370de5f9544f0c4de126b1e46ceadf0a51b',
  },
  {
    ticker: 'WSTRAX',
    chain: ropsten,
    title: 'WStrax => Strax',
    destination: 'Strax',
    erc20: '0xde09a7cb4c7631f243e5a5454cbb02404aea65e7',
  },
  {
    ticker: 'TST-1',
    chain: ropsten,
    title: 'Token 1',
    destination: 'Cirrus',
    erc20: '0xf197f5f8c406d269e2cc44aaf495fbc4eb519634',
  },
  {
    ticker: 'TST-2',
    chain: ropsten,
    title: 'Token 2',
    destination: 'Cirrus',
    erc20: '0xa3c22370de5f9544f0c4de126b1e46ceadf0a51b',
  },
  {
    ticker: 'TST-3',
    chain: ropsten,
    title: 'Token 3',
    destination: 'Cirrus',
    erc20: '0x5da5cfe7d4ce1cc0712ebc0bb58eff93817a6801'
  },
  {
    ticker: 'TST-4',
    chain: ropsten,
    title: 'Token 4',
    destination: 'Cirrus',
    erc20: '0x14f768657135d3daafb45d242157055f1c9143f3'
  }
];

export const tokens = tokenValues.map((data,i) => new Token(data,++i));
