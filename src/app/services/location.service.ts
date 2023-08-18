import { Injectable } from '@angular/core';
import { CoreTypes } from '@nativescript/core';
import * as geolocation from '@nativescript/geolocation';
import { check, request } from '@nativescript-community/perms';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class LocationService {
  currentGeoLocation$ = new BehaviorSubject<geolocation.Location | null>(null);
  watcher;

  async requestGeoLocation() {
    await this._checkPermissions();

    const location = await geolocation.getCurrentLocation();
    this.currentGeoLocation$.next(location);
  }

  async enableLocationServices() {
    await this._checkPermissions();
    this._watchLocation();
  }

  disableLocationServices(): void {
    geolocation.clearWatch(this.watcher);
  }

  private async _checkPermissions() {
    const hasPermission = await check('location', {
      type: 'always',
      precise: true,
    });
    if (!hasPermission[1]) {
      await request('location', { type: 'always' });
    }
  }

  private _watchLocation(): void {
    this.watcher = geolocation.watchLocation(
      (location) => {
        this.currentGeoLocation$.next(location);
      },
      (error) => {
        console.log(error);
      },
      {
        desiredAccuracy: CoreTypes.Accuracy.high,
        updateDistance: 0,
        updateTime: 500,
        minimumUpdateTime: 500,
      }
    );
  }
}
