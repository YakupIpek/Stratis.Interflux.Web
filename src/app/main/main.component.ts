import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import MetaMaskOnboarding from '@metamask/onboarding';
import { concatMap, delay, filter, fromEvent, interval, Subscription, take } from 'rxjs';
import { Chain } from '../services/chain';
import { TokenService } from '../services/token.service';
import { Token } from '../services/tokens';
import { Utils } from '../services/utils';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, OnDestroy {
  connected = false;
  connecting = false;
  account = '';
  balance = '';
  chain?: Chain;
  tokenOptions: { title: string; tokens: Token[]; }[] = [];
  token?: Token;
  form: FormGroup;
  tokens: Token[];
  chains: Chain[];
  ethereum: any;
  subscription = new Subscription();
  returnAddress?: string;
  registeryMessage?: string;
  alert?: { type: string, message: string };
  metaMaskInstalled: boolean;
  web3: any;
  constructor(private tokenService: TokenService,
    @Inject('BASE_URL') public readonly baseUrl: string
  ) {
    this.tokens = tokenService.tokens;
    this.chains = tokenService.chains;
    this.web3 = tokenService.web3;
    this.form = new FormGroup({
      tokenId: new FormControl(0, { validators: [] }),
      address: new FormControl(null, { validators: [Validators.required, this.validateAddress], asyncValidators: [this.validateAddressRegistery] }),
      amount: new FormControl(null, { validators: [] }),
    });

    this.metaMaskInstalled = MetaMaskOnboarding.isMetaMaskInstalled();
  }

  ngOnInit(): void {
    this.ethereum = (window as any).ethereum;

    if (!this.ethereum)
      return;

    let subscription = fromEvent<string[]>(this.ethereum, 'accountsChanged').subscribe(this.updateAccount);

    this.subscription.add(subscription);

    subscription = fromEvent<string>(this.ethereum, 'chainChanged').subscribe(chainId => window.location.reload());

    this.subscription.add(subscription);

    subscription = this.tokenId.valueChanges.subscribe((value: number) => this.tokenSelected(value));

    this.subscription.add(subscription);
  }

  get tokenId() { return this.form.get('tokenId')!; }
  get amount() { return this.form.get('amount')!; }
  get address() { return this.form.get('address')!; }

  closeAlert() {
    this.alert = undefined;
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
    if (this.token?.destination == 'Strax')
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
            to: this.token!.chain.kvStoreAddress,
            value: this.web3.utils.fromDecimal(0),
            data: data
          }
        ]
      });

      this.registeryMessage = 'The address is registering now. Please keep waiting...';

      const tx = await interval(2000).pipe(
        concatMap(async val => await this.web3.eth.getTransaction(txid)),
        filter(x => x.blockNumber > 0),
        take(1),
        delay(1000)
      ).toPromise();

      this.returnAddress = newAddress;

      this.alert = { type: 'success', message: 'Your return address registered successfully.' };
    } catch {
    }

    this.registeryMessage = undefined
    this.form.enable();

  }

  updateAccount(accounts: string[]) {
    if (accounts.length == 0) {
      this.connected = false;
      return;
    }
    this.account = accounts[0];
  }

  async tokenSelected(tokenId: number) {

    this.token = this.tokens.find(t => t.id == tokenId);

    if (!this.token) {
      return;
    }

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
    return this.web3.utils.fromWei(amount, "ether");
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
    return this.web3.utils.toWei(amount, "ether");
  }

  async transfer() {
    const token = this.token!;
    const chain = this.chain!;

    const amount = this.toWei(this.amount.value.toString())
    const callData = token.destination == 'Strax' ?
      token.burnCall(amount, this.address.value) :
      token.transferCall(chain.multisigAddress, amount);

    this.form.disable();
    const txid = await this.ethereum.request({
      method: 'eth_sendTransaction',
      params: [
        {
          from: this.account,
          to: token.erc20,
          value: this.web3.utils.fromDecimal(0),
          data: callData
        }
      ]
    }).finally(() => this.form.enable());

    this.amount.reset();
    var a = `<a target="_blank" href="${chain.txUrl(txid)}">transfer details</a>.`;
    this.alert = { type: 'success', message: 'The Transfer submitted successfully. See your  ' + a }
  }

  async addWallet() {
    await this.ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address: this.token!.erc20,
          symbol: this.token!.ticker,
          image: `${this.baseUrl}/assets/stratis-logo.svg`,
          decimals: 18,
        },
      },
    });
  }

  install() {
    const onboarding = new MetaMaskOnboarding();
    MetaMaskOnboarding.isMetaMaskInstalled
    onboarding.startOnboarding();
  }
}
