import { Component, inject } from "@angular/core";
import { AppState, AppStateService } from "./app.state";
import { RxActionFactory } from "@rx-angular/state/actions";
import { switchMap, interval, map, pairwise, skip } from "rxjs";
import { selectSlice } from "@rx-angular/state/selections";
// import { HealthService } from "./services/health.service";
import { LocationService } from "./services/location.service";
import distance from "@turf/distance";

interface Actions {
  startTimer: void;
  resetTimer: void;
}

const TIMER_INTERVAL = 1000;

@Component({
  selector: "ns-app",
  template: `
    <RootLayout>
      <GridLayout class="layout" *rxLet="vm$; let vm">
        <ns-monitor colSpan="5" [bpm]="vm.currentBpm" />

        <ns-info
          column="1"
          class="info"
          title="{{ vm.distance | number:'.1-1' }}km"
          icon="&#xf041;"
        />
        <ns-info
          column="2"
          class="info"
          [title]="vm.time | time"
          icon="&#xf017;"
        />
        <ns-info
          column="3"
          class="info"
          [title]="vm.pace | number:'.0-2'"
          icon="&#xf0fb;"
        />

        <Button
          class="start-button fa"
          [text]="vm.timerStatus === 'STARTED' ? '&#xf04c;' : '&#xf04b;'"
          (tap)="startTimer()"
        ></Button>
        <Button
          class="fa reset-button"
          text="&#xf0e2;"
          (tap)="ui.resetTimer()"
        ></Button>
      </GridLayout>
    </RootLayout>
  `,
  styles: [
    `
      .layout {
        columns: 40 33* 33* 33* 40;
        rows: * auto auto auto;
        background-color: #232127;
        color: #707180;
      }
      .info {
        row: 2;
      }
      .start-button {
        row: 3;
        column: 1;
        col-span: 3;
        border-radius: 100%;
        font-size: 60;
        height: 160;
        width: 160;
        margin: 40 0;
        padding: 40;
        background-color: #707180;
        color: #232127;
      }
      .reset-button {
        android-elevation: -4;
        color: #707180;
        background-color: #232127;
        column: 3;
        row: 1;
        column-span: 2;
        padding-left: 36;
        font-size: 20;
      }
    `,
  ],
})
export class AppComponent {
  private stateService = inject(AppStateService);
  // private healthService = inject(HealthService);
  private locationService = inject(LocationService);
  private factory = inject(RxActionFactory<Actions>);

  ui = this.factory.create();
  vm$ = this.stateService
    .select()
    .pipe(
      selectSlice(["time", "pace", "timerStatus", "currentBpm", "distance"])
    );

  private timer$ = this.stateService.select("timerStatus").pipe(
    switchMap((status) => {
      if (status === "STARTED") {
        return interval(TIMER_INTERVAL).pipe(
          map(() => this.stateService.get("time") + TIMER_INTERVAL)
        );
      }
      return [];
    })
  );
  private pace$ = this.stateService.select().pipe(
    selectSlice(["distance", "time"]),
    map(({ distance, time }) => {
      const timeInMinutes = time / 60000;
      return timeInMinutes / distance;
    })
  );
  private distance$ = this.locationService.currentGeoLocation$.pipe(
    pairwise(),
    skip(1),
    map(([prevLocation, currLocation]) => {
      return (
        this.stateService.get("distance") +
        distance(
          [prevLocation.latitude, prevLocation.longitude],
          [currLocation.latitude, currLocation.longitude],
          { units: "kilometers" }
        )
      );
    })
  );

  ngOnInit() {
    this.locationService.enableLocationServices();
    this.stateService.connect("time", this.timer$);
    this.stateService.connect("pace", this.pace$);
    this.stateService.connect("distance", this.distance$);

    this.stateService.connect(
      this.ui.resetTimer$.pipe(
        map(
          (): Partial<AppState> => ({
            distance: 0,
            pace: 0,
            time: 0,
          })
        )
      )
    );
  }

  ngOnDestroy() {
    this.locationService.disableLocationServices();
  }

  startTimer() {
    this.stateService.set("timerStatus", (state) =>
      state.timerStatus === "STARTED" ? "PAUSED" : "STARTED"
    );
  }
}
