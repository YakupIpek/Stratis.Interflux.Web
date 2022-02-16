import { formatNumber } from '@angular/common';
import { Inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';
import { Utils } from '../services/utils';
/*
 * Formats satoshi values as in Cirrus Unit
 * E.g.
 * 1_021_030_000 | coin => 10.21
 * 1_021_030_000 | coin:'long' => 10.2103
*/
@Pipe({ name: 'coin' })
export class CoinFormatPipe implements PipeTransform {

  constructor(@Inject(LOCALE_ID) public readonly locale: string) { }

  transform(value: number, format?: string): string {
    var digitsInfo = format == 'long' ? '1.8-8' : '1.2-2';
    var coins = Utils.toCRS(value);
    return formatNumber(coins, this.locale, digitsInfo);
  }

}
