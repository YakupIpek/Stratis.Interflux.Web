import { Injectable } from '@angular/core';
import { Chain, CHAINS } from './chain';
import { Token, TOKENS } from './tokens';
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
    this.chains = CHAINS;
    this.tokens = TOKENS;
  }
}
