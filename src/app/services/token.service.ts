import { Injectable } from '@angular/core';
import { Chain, chains } from './chain';
import { Token, tokens } from './tokens';
import { web3 } from './web3';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  chains: Chain[];
  web3: any;
  tokens: Token[];
  constructor() {
    this.web3 = web3;
    this.chains = chains;
    this.tokens = tokens;
  }
}
