import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { async, concatMap, defer, delay, filter, from, fromEvent, interval, map, Subscription, take, takeUntil, timer } from 'rxjs';
import { Chain } from '../services/chain';
import { TokenService } from '../services/token.service';
import { Token } from '../services/tokens';
import { Utils } from '../services/utils';
import { web3 } from '../services/web3';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, OnDestroy {
  connected = false;
  connecting = false;
  metaMaskInstalled = false;
  account = '';
  balance = '';
  chain?: Chain;
  tokenOptions: { title: string; tokens: Token[]; }[] = [];
  token?: Token;
  form: FormGroup;
  tokens: Token[];
  chains: Chain[];
  ethereum: any;
  subscription = Subscription.EMPTY;
  tokenId = 0;
  returnAddress?: string;
  registeryMessage = 'Please submit transaction...';

  constructor(private tokenService: TokenService) {
    this.tokens = tokenService.tokens;
    this.chains = tokenService.chains;
    this.form = new FormGroup({
      address: new FormControl(null, { validators: [Validators.required, this.validateAddress], asyncValidators: [this.validateAddressRegistery] }),
      amount: new FormControl(null, { validators: [] }),
    });
  }


  ngOnInit(): void {

    this.ethereum = (window as any).ethereum;

    let subs = fromEvent<string[]>(this.ethereum, 'accountsChanged').subscribe(this.updateAccount);

    this.subscription.add(subs);

    subs = fromEvent<string>(this.ethereum, 'chainChanged').subscribe(chainId => window.location.reload());

    this.subscription.add(subs);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  validateAddress = () => {
    if (!this.token)
      return {};

    const address = this.address.value as string;

    if (!address)
      return {};

    const valid = address.length == 34 && address[0] == this.token.addressPrefix;

    if (valid)
      return {};

    return { address: true };
  }

  validateAddressRegistery = async () => {
    if (this.token?.destination == 'Cirrus')
      return {};

    if (this.returnAddress == this.address.value)
      return {};

    return { addressRegistery: true };
  }

  async registerAddress() {
    try {
      this.registeryMessage = 'Transaction submit is waiting...'
      this.form.disable();
      const newAddress = this.address.value as string;
      var data = this.token!.chain.registerAddressCall(newAddress);
      const txid = await this.ethereum.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: this.account,
            to: this.token!.chain.contractAddress,
            value: web3.utils.fromDecimal(0),
            data: data
          }
        ]
      });

      this.registeryMessage = 'The address is registering now. Please keep waiting...';
      const tx = await interval(2000).pipe(
        concatMap(async val => await web3.eth.getTransaction(txid)),
        filter(x => x.blockNumber > 0),
        take(1),
        delay(1000)
      ).toPromise();

      this.returnAddress = await this.token!.chain.getAddress(this.account);
      this.form.enable();
    } catch (e) {
      this.form.enable();
    }

  }

  updateAccount(accounts: string[]) {
    if (accounts.length == 0) {
      this.connected = false;
      return;
    }
    this.account = accounts[0];
  }

  get amount() { return this.form.get('amount')!; }
  get address() { return this.form.get('address')!; }

  async tokenSelected() {
    if (this.tokenId == 0) {
      this.token = undefined;
      return;
    }

    this.token = this.tokens.find(t => t.id == this.tokenId);

    if (!this.address.dirty && this.token!.destination == 'Cirrus') {
      this.address.setValue(this.returnAddress);
    } else if (!this.address.dirty) {
      this.address.setValue(null);
    }

    this.balance = await this.token!.balance(this.account);

    this.amount.clearValidators();
    this.amount.addValidators([Validators.required, Validators.min(Utils.toCRS(1)), Validators.max(this.toEther(this.balance))])

    this.amount.updateValueAndValidity();
    this.address.updateValueAndValidity();
  }

  toEther(amount: string) {
    return web3.utils.fromWei(amount, "ether");
  }

  updateTokenOptions() {
    this.tokenOptions = [
      {
        title: 'ETH To Strax Chain',
        tokens: this.tokens.filter(t => t.destination == 'Strax' && t.chain == this.chain),
      },
      {
        title: 'ETH To Cirrus Sidechain',
        tokens: this.tokens.filter(t => t.destination == 'Cirrus' && t.chain == this.chain),
      }
    ];
  }

  async connect() {
    try {
      this.connecting = true;
      const accounts: string[] = await this.getAccounts();

      this.updateAccount(accounts);
      const chainId: string = await this.getChainId();
      this.chain = this.chains.find(c => c.id == chainId);

      this.updateTokenOptions();

      this.returnAddress = await this.chain!.getAddress(this.account);

      this.connected = true;
    } catch { }

    this.connecting = false;
  }

  async getChainId(): Promise<string> {
    return await this.ethereum.request({ method: 'eth_chainId' });
  }

  async getAccounts(): Promise<string[]> {
    return await this.ethereum.request({ method: 'eth_requestAccounts' });
  }

  setFullBalance() {
    this.form.get('amount')!.setValue(this.toEther(this.balance));
  }

  toWei(amount: number): number {
    return web3.utils.toWei(amount, "ether");
  }

  async transfer() {
    const token = this.token!;
    const chain = this.chain!;

    const amount = this.toWei(this.amount.value.toString())
    const callData = token.destination == 'Strax' ?
      token.burnCall(amount, this.address.value) :
      token.transferCall(chain.contractAddress, amount);

    const txid = await this.ethereum.request({
      method: 'eth_sendTransaction',
      params: [
        {
          from: this.account,
          to: token.erc20,
          value: web3.utils.fromDecimal(0),
          data: callData
        }
      ]
    });
    this.form.reset();

    console.log(txid);
  }
}
