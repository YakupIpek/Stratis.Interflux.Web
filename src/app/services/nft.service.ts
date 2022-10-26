import { Injectable } from '@angular/core';
import { OwnedNftResponse, Nft } from './tokens';
import { RestApi } from './rest-api';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NftService extends RestApi {
    http: HttpClient;

  constructor(http: HttpClient) {
    super(http, environment.apiEndpoint);
    this.http = http;
  }

  public getOwnedNfts(account: string) : Nft[]
  {
    let tokens : Nft[] = [];

    this.get<OwnedNftResponse>('ownednfts?address=' + account).subscribe(res => {

      res.ownedNfts.forEach((ownedNft) => {
        if (ownedNft.contractAddress != undefined)
        {
            ownedNft.tokenIdentifiers.forEach((tokenId) => {
                tokens.push({contract: ownedNft.contractAddress, tokenId: tokenId});
            });
        }
      });
    });

    return tokens;
  }
}
