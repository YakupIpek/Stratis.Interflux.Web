import { Injectable } from "@angular/core";
declare let base58Check: any;

@Injectable({
  providedIn: 'root'
})
export class AddressValidator {
  constructor() {

  }

  validate(address:string, prefix:string) {
    try {
      var result = base58Check.decode(address);
      return result.prefix[0] == prefix;
    } catch (e) {
      return false;
    }
  }
}

