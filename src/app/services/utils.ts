import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Utils {
  static satoshi = 10 ** 8;
  static secondsInAnHour = 60 * 60;
  static secondsInAMinute = 60;

  constructor() { }

  public static toSatoshi(value: number): number {
    return Math.trunc(value * this.satoshi);
  }

  public static toCRS(value: number): number {
    return value / this.satoshi;
  }

}
