import { Component, Input } from '@angular/core';

@Component({
  selector: 'ns-info',
  template: `
  <StackLayout class="info">
    <Label class="icon fa">
      {{ icon }}
    </Label>
    <Label class="title">
      {{ title }}
    </Label>
  </StackLayout>
  `,
  styles: [
    `
    .info {
      text-align: center;
      font-size: 20;
    }
    .icon {
      font-size: 40;
      margin-bottom: 8;
    }
  `,
  ],
})
export class InfoComponent {
  @Input() title: string = '';
  @Input() icon: string = '&';
}
