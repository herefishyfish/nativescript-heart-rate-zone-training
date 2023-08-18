import {
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  Input,
  ViewChild,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { registerElement } from '@nativescript/angular';
import {
  Application,
  CSSType,
  ContentView,
  CoreTypes,
  GridLayout,
  LoadEventData,
  Utils,
} from '@nativescript/core';
import { BehaviorSubject, interval, sampleTime } from 'rxjs';

registerElement('ns-monitor', () => MonitorComponent);

@CSSType('ns-monitor')
@Component({
  selector: 'ns-monitor',
  template: `
    <Label class="bpm">
      {{ bpm }}
    </Label>
    <Label class="max-bpm warning-bpm">
      {{ maxBpm }}
    </Label>
    <Label class="low-bpm warning-bpm">
      {{ minBpm }}
    </Label>
    <Label
      [hidden]="bpm > minBpm && bpm < maxBpm"
      class="message"
      >{{ bpm < minBpm ? 'Speed up!' : 'Slow down' }}</Label
    >

    <ContentView class="line"></ContentView>
    <ContentView class="line" col="2" colSpan="4"></ContentView>
    <ContentView class="line" row="2"></ContentView>
    <ContentView class="line" row="2" col="2" colSpan="4"></ContentView>
    <ContentView #indicator class="indicator"></ContentView>
  `,
  styles: [
    `
      :host {
        columns: 5* 12* 50* 5* 10* 18*;
        rows: auto auto auto;
        text-align: center;
        padding: 50 8;
      }
      .bpm {
        column: 0;
        column-span: 4;
        row: 1;
        font-size: 130;
        text-alignment: right;
        padding: 0;
        margin: 20 0;
        font-weight: bold;
      }
      .message {
        row: 1;
        column: 3;
        column-span: 3;
        color: red;
        text-wrap: true;
        font-weight: bold;
        font-size: 24;
        text-alignment: left;
        vertical-alignment: top;
        margin-left: 8;
        padding-top: 46;
      }
      .line {
        height: 1;
        width: 100%;
        background-color: #707180;
      }
      .indicator {
        background-color: red;
        border-radius: 100%;
        height: 20;
        width: 20;
        col: 4;
        column-span: 3;
        row-span: 4;
        box-shadow: 0 0 10 white;
      }
      .warning-bpm {
        font-size: 20;
      }
      .max-bpm {
        col: 1;
      }
      .low-bpm {
        col: 1;
        row: 2;
      }
    `,
  ],
})
export class MonitorComponent extends GridLayout {
  @ViewChild('indicator', { static: true }) indicator: ElementRef<ContentView>;

  @Input() minBpm: number = 120;
  @Input() maxBpm: number = 180;

  @Input()
  set bpm(value: number) {
    this.bpm$.next(value);
  }
  get bpm(): number {
    return this.bpm$.getValue();
  }
  private bpm$ = new BehaviorSubject<number>(0);

  containerHeight: number = 0;

  @HostListener('loaded', ['$event'])
  onLoad(event: LoadEventData) {
    const container = event.object as GridLayout;
    const density = Utils.layout.getDisplayDensity();
    setTimeout(() => {
      this.containerHeight = container.getMeasuredHeight() - 195 * density;

      this.bpm$.pipe(sampleTime(500)).subscribe((bpm) => {
        const range = this.maxBpm - this.minBpm;
        const normalizedBpm = bpm - this.minBpm;
        const percentage = normalizedBpm / range;

        const position =
          this.containerHeight -
          percentage * this.containerHeight -
          this.containerHeight / 2;

        this.indicator.nativeElement.animate({
          translate: { x: 0, y: position / density },
          curve: CoreTypes.AnimationCurve.easeInOut,
          duration: 500,
        });
      });
    }, 130);
  }

  ngOnInit() {
    interval(500).subscribe(() => {
      let randomChange = Math.floor(Math.random() * 3) + 1;

      let addOrSubtract = Math.random() > 0.5 ? 1 : -1;

      this.bpm += randomChange * addOrSubtract;

      if (this.bpm < 110) {
        this.bpm = 110;
      } else if (this.bpm > 200) {
        this.bpm = 200;
      }
    });
  }
}
