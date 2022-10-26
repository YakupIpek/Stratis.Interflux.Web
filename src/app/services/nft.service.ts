import { Injectable } from '@angular/core';
import { OwnedNftResponse, Nft } from './tokens';
import { RestApi } from './rest-api';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NftService extends RestApi {
  tokens: Nft[];

  constructor(http: HttpClient) {
    super(http, environment.apiEndpoint);

    this.tokens = []

    this.get<OwnedNftResponse>('ownednfts').subscribe(res => {

      res.ownedNfts.forEach((ownedNft, i) => {
        if (ownedNft.contractAddress != undefined)
        {
            ownedNft.tokenIdentifiers.forEach((tokenId) => {
                this.tokens.push({contract: ownedNft.contractAddress, tokenId: tokenId});
            });
        }
      });
    });
  }
}
