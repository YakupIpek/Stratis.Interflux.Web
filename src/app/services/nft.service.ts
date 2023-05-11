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

  public async getOwnedNfts(account: string) : Promise<Nft[]>
  {
    let tokens : Nft[] = [];

    if (!account)
      return tokens;

    await this.get<OwnedNftResponse>('ownednfts?address=' + account).subscribe(res => {
        for (var key in res.ownedNfts)
        {
            res.ownedNfts[key].forEach(tokenId => { 
                tokens.push({contract: key, tokenId: tokenId});
            });
        }
    });

    return tokens;
  }
}
