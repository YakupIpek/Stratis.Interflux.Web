import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import MetaMaskOnboarding from '@metamask/onboarding';
import { Network, Alchemy } from "alchemy-sdk";
import { ethers, utils } from 'ethers';
import { fromEvent, Subscription } from 'rxjs';
import { Chain, ChainName } from '../services/chain';
import { TokenService } from '../services/token.service';
import { Destination, Token } from '../services/tokens';
import { environment } from 'src/environments/environment';

const alchemySettings = {
  apiKey: environment.alchemyApiKey,
  network: environment.chain == ChainName.Ropsten ? Network.ETH_ROPSTEN : Network.ETH_MAINNET
};

const alchemy = new Alchemy(alchemySettings);

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, OnDestroy {
  connected = false;
  connecting = false;
  account = '';
  balance = '0';
  chain?: Chain;
  tokenOptions: { title: string; tokens: Token[]; }[] = [];
  nfts: string[] = [];
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
  networks = ChainName;
  destinations = Destination;
  constructor(
    tokenService: TokenService,
    private web3Provider: ethers.providers.Web3Provider,
    @Inject('BASE_URL') private baseUrl: string
  ) {
    this.tokens = tokenService.tokens;
    this.chains = tokenService.chains;
    this.form = new FormGroup({
      tokenId: new FormControl(0, { validators: [] }),
      address: new FormControl(null, { validators: [Validators.required, this.validateAddress], asyncValidators: [this.validateAddressRegistery] }),
      amount: new FormControl(null, { validators: [] }),
      tokenIdentifier: new FormControl(-1, { validators: [] }),
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

    subscription = this.tokenIdentifier.valueChanges.subscribe((value: number) => this.tokenIdentifierSelected(value));

    this.subscription.add(subscription);
  }

  get tokenId() { return this.form.get('tokenId')!; }
  get amount() { return this.form.get('amount')!; }
  get address() { return this.form.get('address')!; }
  get tokenIdentifier() { return this.form.get('tokenIdentifier')!; }

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

    const valid = this.token.validateAddress(address);

    if (valid)
      return {};

    return { address: true };
  }

  validateAddressRegistery = async () => {
    if (this.token?.destination == Destination.Strax)
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
      const txid: string = await this.web3Provider.send('eth_sendTransaction',
        [
          {
            from: this.account,
            to: this.token!.chain.kvStoreAddress,
            value: '0x0',
            data: data
          }
        ]
      );

      this.registeryMessage = 'The address is registering now. Please keep waiting...';

      await this.web3Provider.waitForTransaction(txid, 1);

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

    if (this.token.destination == Destination.CirrusNft)
    {
      //this.form.disable();
      this.registeryMessage = 'Retrieving IDs of NFTs owned by your wallet...';

      const nftsForOwner = await alchemy.nft.getNftsForOwner(this.account);

      this.nfts = [];

      for (const nft of nftsForOwner.ownedNfts) {
        if (nft.contract.address != this.token.contract.address)
          continue;

        this.nfts.push(nft.tokenId)
      }
      
      this.registeryMessage = undefined;
      //this.form.enable();
    }

    if (!this.address.dirty && (this.token!.destination == Destination.Cirrus || this.token!.destination == Destination.CirrusNft)) {
      this.address.setValue(this.returnAddress);
    } else if (!this.address.dirty) {
      this.address.setValue(null);
    }

    this.address.updateValueAndValidity();

    this.amount.clearValidators();

    if (this.token.destination != Destination.CirrusNft)
    {
      this.balance = await this.token!.balance(this.account);

      if (this.token?.decimals == 18)
        this.amount.addValidators([Validators.required, Validators.min(utils.formatUnits("1", 18) as any), Validators.max(utils.formatEther(this.balance) as any)])
      else
        this.amount.addValidators([Validators.required, Validators.min(utils.formatUnits("1", 18) as any), Validators.max(utils.formatUnits(this.balance, this.token?.decimals) as any)])
    }
    else
    {
      this.tokenIdentifier.addValidators([Validators.required, Validators.pattern('^(?!-1$).*$')]);
    }

    this.amount.updateValueAndValidity();
    this.tokenIdentifier.updateValueAndValidity();
  }

  async tokenIdentifierSelected(tokenIdentifier: number)
  {
  }

  updateTokenOptions() {
    this.tokenOptions = [
      {
        title: 'ETH To Strax Chain',
        tokens: this.tokens.filter(t => t.destination == Destination.Strax && t.chain.id == this.chain?.id),
      },
      {
        title: 'ETH To Cirrus Sidechain',
        tokens: this.tokens.filter(t => t.destination == Destination.Cirrus && t.chain.id == this.chain?.id),
      },
      {
        title: 'ETH To Cirrus Sidechain (NFT)',
        tokens: this.tokens.filter(t => t.destination == Destination.CirrusNft && t.chain.id == this.chain?.id),
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
    return await this.web3Provider.send('eth_chainId', []);
  }

  async getAccounts(): Promise<string[]> {
    return await this.web3Provider.send('eth_requestAccounts', []);
  }

  setFullBalance() {
    if (this.token?.decimals == 18)
      this.form.get('amount')!.setValue(utils.formatEther(this.balance));
    else
      this.form.get('amount')!.setValue(utils.formatUnits(this.balance, this.token?.decimals));
  }

  async transfer() {
    const token = this.token!;
    const chain = this.chain!;

    let callData:string = '';

    if (token.destination != Destination.CirrusNft)
    {
      var amount = "";
      if (token.decimals == 18)
        amount = utils.parseEther(this.amount.value.toString()).toString();
      else
        amount = BigInt(this.amount.value * Math.pow(10, token.decimals)).toString();

      callData = token.destination == Destination.Strax ?
        token.burnCall(amount, this.address.value) :
        token.transferCall(chain.multisigAddress, amount);
    }
    else
    {
      // The same transfer() method can be used for ERC721 tokens, the only difference is that the 'amount' is now the token identifier.
      callData = token.nftTransferCall(this.account, chain.multisigAddress, parseInt(this.tokenIdentifier.value));
    }

    this.form.disable();

    const txid = await this.web3Provider.send('eth_sendTransaction',
      [
        {
          from: this.account,
          to: token.erc20,
          value: '0x0',
          data: callData
        }
      ]
    ).finally(() => this.form.enable());
    this.amount.reset();

    var a = `<a target="_blank" href="${chain.txUrl(txid)}">transfer details</a>.`;
    this.alert = { type: 'success', message: 'The Transfer submitted successfully. See your  ' + a };
  }

  async addWallet() {
    await this.ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        // It is not clear if ERC721 is actually supported. In any case, the desktop Metamask has limited NFT support and can only really show a count of NFTs rather than individual metadata.
        type: 'ERC20',
        options: {
          address: this.token!.erc20,
          symbol: this.token!.ticker,
          decimals: this.token!.decimals,
        },
      },
    });
  }

  toEther(amount: string) {
    return utils.formatUnits(amount, this.token?.decimals);
  }

  install() {
    const onboarding = new MetaMaskOnboarding();
    MetaMaskOnboarding.isMetaMaskInstalled
    onboarding.startOnboarding();
  }
}