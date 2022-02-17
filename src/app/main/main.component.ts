import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { fromEvent, Subscription } from 'rxjs';
import { createConstructor } from 'typescript';
import { servicesVersion } from 'typescript';
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
  addressValue = '';
  amountValue = 0;
  balance = '';
  chain?: Chain;
  tokenOptions: { title: string; tokens: Token[]; }[] = [];
  token?: Token;
  form: FormGroup;
  tokens: Token[];
  chains: Chain[];
  ethereum: any;
  subscription = Subscription.EMPTY;

  constructor(private tokenService: TokenService, window: Window) {
    this.chain = tokenService.chains[0];
    this.tokens = tokenService.tokens;
    this.chains = tokenService.chains;
    this.form = new FormGroup({
      amount: new FormControl(null, { validators: [Validators.required, Validators.min(Utils.toCRS(1))] }),
      address: new FormControl(null, { validators: [Validators.required] }),
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
  updateAccount(accounts: string[]) {
    if (accounts.length == 0) {
      this.connected = false;
      return;
    }
    this.account = accounts[0];
  }

  get amount() { return this.form.get('amount')!; }
  get address() { return this.form.get('address')!; }



  async tokenSelected(event: Event) {
    const id = +(event.target as any).value;

    if (id == 0)
      return;

    this.token = this.tokens.find(t => t.id == id);
    this.balance = await this.token!.balance(this.account);
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
        tokens: this.tokens.filter(t => t.destination == 'Cirrus'),
      }
    ]
  }

  async connect() {
    try {
      this.connecting = true;
      const accounts: string[] = await this.getAccounts();

      this.updateAccount(accounts);
      const chainId: string = await this.getChainId();
      this.chain = this.chains.find(c => c.id == chainId);

      this.updateTokenOptions();
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

    if (token.destination == 'Strax') {
      const amount = this.toWei(this.amount.value)

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
    }
  }
}
