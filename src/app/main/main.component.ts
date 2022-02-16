import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Chain } from '../services/chain';
import { TokenService } from '../services/token.service';
import { Token } from '../services/tokens';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  connected = false;
  connecting = false;
  metaMaskInstalled = false;
  account = '';
  addressValue = '';
  amountValue = 0;
  balance = 0;
  chain?: Chain;
  tokenOptions: { title: string; tokens: Token[]; }[] = [];
  token?: Token;
  form: FormGroup;
  tokens: Token[];

  constructor(private tokenService: TokenService) {
    this.chain = tokenService.chains[0];
    this.tokens = tokenService.tokens;
    this.tokenOptions = [
      {
        title: 'ETH To Strax Chain',
        tokens: this.tokens.filter(t => t.destination == 'Strax' && t.chain == this.chain),
      },
      {
        title: 'ETH To Cirrus Sidechain',
        tokens: this.tokens.filter(t => t.destination == 'Cirrus'),
      }
    ];

    this.form = new FormGroup({
      amount: new FormControl(null, { validators: [Validators.required] }),
      address: new FormControl(null, { validators: [Validators.required] }),
    });
  }

  get amount() { return this.form.get('amount')!; }
  get address() { return this.form.get('address')!; }

  ngOnInit(): void {
  }

  tokenSelected(event: Event) {
    var id = +(event.target as any).value;
    this.token = this.tokens.find(t=>t.id == id);
  }

  connect() {
    this.connected = true;
  }

  setFullBalance() {
    this.form.get('amount')!.setValue(this.balance);
  }
  transfer() {

  }
}
