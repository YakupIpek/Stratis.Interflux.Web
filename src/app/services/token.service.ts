import { Injectable } from '@angular/core';
import { ethers } from 'ethers';
import { Chain, CHAINS } from './chain';
import { Token, TOKENS } from './tokens';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  chains: Chain[];
  web3: any;
  tokens: Token[];

  constructor(private web3Provider: ethers.providers.Web3Provider) {
    this.chains = CHAINS.map(data => new Chain(data,web3Provider));
    this.tokens = TOKENS.map((data, i) => new Token(data,this.chains.find(c=>c.name == data.chain)!, ++i, web3Provider));
  }
}
