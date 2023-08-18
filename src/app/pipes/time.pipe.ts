import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'time',
})
export class TimePipe implements PipeTransform {
  transform(value: number): string {
    if (
      value == null ||
      value === undefined ||
      value == 0 ||
      !isFinite(value)
    ) {
      return '00:00';
    }

    let milliseconds = value % 1000;
    value = (value - milliseconds) / 1000;

    let hours = Math.floor(value / 3600);
    value %= 3600;
    let minutes = Math.floor(value / 60);
    let seconds = value % 60;

    let parts = [];

    if (hours > 0) {
      parts.push(hours.toString().padStart(2, '0'));
    }

    parts.push(minutes.toString().padStart(2, '0'));
    parts.push(seconds.toString().padStart(2, '0'));
    // parts.push(milliseconds.toString().padStart(2, '0'));

    return parts.join(':');
  }
}
