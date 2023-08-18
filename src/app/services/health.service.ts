import { Injectable, NgZone } from '@angular/core';
import { Dialogs } from '@nativescript/core';
import {
  AggregateBy,
  HealthData,
  HealthDataType,
} from 'nativescript-health-data';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class HealthService {
  private healthData: HealthData;

  public bpm$ = new BehaviorSubject<number>(0);

  constructor() {
    this.healthData = new HealthData();
    this.healthData
      .isAvailable(false)
      .then((available) => console.log(available));

    console.log('HealthService.ngOnInit()');
    this.isAuthorized();
  }

  async isAvailable() {
    return this.healthData.isAvailable(true);
  }

  async isAuthorized() {
    const isAuthorized = await this.healthData.isAuthorized([
      { name: 'heartRate', accessType: 'read' },
    ]);
    if (!isAuthorized) {
      await this.healthData.requestAuthorization([
        { name: 'heartRate', accessType: 'read' },
      ]);
    }

    setTimeout(
      () =>
        Dialogs.alert({
          title: 'Authentication result',
          message:
            (isAuthorized ? '' : 'Not ') + 'authorized for heart rate data',
          okButtonText: 'Ok!',
        }),
      300
    );

    return isAuthorized;
  }

  getData(
    dataType: string,
    unit?: string,
    aggregateBy?: AggregateBy
  ): Promise<void> {
    return this.healthData
      .query({
        startDate: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
        endDate: new Date(),
        dataType,
        unit,
        aggregateBy,
        sortOrder: 'desc',
      })
      .then((result) => {
        console.log(JSON.stringify(result));
      });
  }

  startMonitoringData(dataType: string, unit: string): void {
    this.healthData.startMonitoring({
      dataType: dataType,
      enableBackgroundUpdates: true,
      backgroundUpdateFrequency: 'immediate',
      onUpdate: (completionHandler: () => void) => {
        console.log(
          'Our app was notified that health data changed, so querying...'
        );
        this.getData(dataType, unit).then(() => completionHandler());
      },
    });
  }

  stopMonitoringData(dataType: string): void {
    this.healthData.stopMonitoring({
      dataType: dataType,
    });
  }
}
