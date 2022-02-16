import { Injectable } from '@angular/core';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { take } from 'rxjs/operators';

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

  public static setTooltipText(tooltip: NgbTooltip, text: string) {
    var animation = tooltip.animation;
    var prevMessage = tooltip.ngbTooltip;

    tooltip.animation = false;

    tooltip.hidden.pipe(take(1)).subscribe(() => {
      tooltip.ngbTooltip = text;
      tooltip.open();
      tooltip.animation = animation;
      tooltip.ngbTooltip = prevMessage;
    });

    tooltip.close();

    return false;
  }

}
