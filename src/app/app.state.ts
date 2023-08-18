import { Injectable, OnInit } from '@angular/core';
import { RxState } from '@rx-angular/state';
import { ApplicationSettings, prompt } from '@nativescript/core';
import { map } from 'rxjs';

export interface AppState {
  age: number;
  bpm: number;
  currentBpm: number;
  distance: number;
  time: any;
  pace: number;
  timerStatus: string;
}

@Injectable({
  providedIn: 'root',
})
export class AppStateService extends RxState<AppState> {
  constructor() {
    super();
    this.set({
      currentBpm: 123,
      distance: 0,
      time: 0,
      pace: 0,
      timerStatus: 'PAUSED',
    });
  }
}
