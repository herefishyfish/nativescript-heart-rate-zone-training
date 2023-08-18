import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptModule } from '@nativescript/angular';
import { RxActionFactory } from '@rx-angular/state/actions';
import { RxLet } from '@rx-angular/template/let';

import { AppComponent } from './app.component';
import { AppStateService } from './app.state';
import { InfoComponent } from './components/info.component';
import { MonitorComponent } from './components/monitor.component';
import { TimePipe } from './pipes/time.pipe';
import { LocationService } from './services/location.service';
// import { HealthService } from "./services/health.service";

@NgModule({
  bootstrap: [AppComponent],
  imports: [NativeScriptModule, RxLet],
  declarations: [AppComponent, InfoComponent, MonitorComponent, TimePipe],
  providers: [AppStateService, RxActionFactory, LocationService],
  schemas: [NO_ERRORS_SCHEMA],
})
export class AppModule {}
