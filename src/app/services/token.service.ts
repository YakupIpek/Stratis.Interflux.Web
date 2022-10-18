import { Injectable } from '@angular/core';
import { ethers } from 'ethers';
import { Chain, ChainName, CHAINS } from './chain';
import { Token, TokenData, InterFluxTokenResponse, Destination } from './tokens';
import { RestApi } from './rest-api';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TokenService extends RestApi {
  chains: Chain[];
  web3: any;
  tokens: Token[];

  constructor(private web3Provider: ethers.providers.Web3Provider,
    http: HttpClient) {
    super(http, environment.apiEndpoint);

    this.chains = CHAINS.map(data => new Chain(data, web3Provider));

    this.tokens = []

    this.get<InterFluxTokenResponse>('interfluxtokens').subscribe(res => {

      let data: TokenData = {
        ticker: "WSTRAX",
        chain: environment.chain,
        title: 'WStrax => Strax',
        destination: Destination.Strax,
        erc20: environment.wstraxaddress,
        addressPrefix: environment.wstraxaddressprefix,
        decimals: 18
      };

      this.tokens.push(new Token(data, this.chains.find(c=>c.name.valueOf() == data.chain.valueOf())!, 0, web3Provider))

      res.supportedTokenContractAddresses.forEach((a, i) => {
        if (a.nativeChainAddress != undefined)
        {
          let data: TokenData = {
            ticker: a.tokenName,
            chain: environment.chain,
            title: a.title + ' => Cirrus',
            destination: Destination.Cirrus,
            erc20: a.nativeChainAddress,
            addressPrefix: a.addressPrefix,
            decimals: a.decimals
          };

          this.tokens.push(new Token(data, this.chains.find(c=>c.name.valueOf() == data.chain.valueOf())!, (++i + 1), web3Provider))
        }
      });

      let n:number = this.tokens.length;

      res.supportedNftContractAddresses.forEach((a, i) => {
        if (a.nativeChainAddress != undefined)
        {
          let data: TokenData = {
            ticker: a.tokenName,
            chain: environment.chain,
            title: a.title + ' => Cirrus',
            destination: Destination.CirrusNft,
            erc20: a.nativeChainAddress,
            addressPrefix: a.addressPrefix,
            decimals: 0
          };

          this.tokens.push(new Token(data, this.chains.find(c=>c.name.valueOf() == data.chain.valueOf())!, (++i + n), web3Provider))
        }
      });
    });
  }
}
