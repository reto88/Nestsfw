import { Component, OnInit, OnDestroy } from '@angular/core';
import { RealtimeService } from './service/realtime.service';
import { numericIdObject } from './service/models/numeric-id-object.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  constructor(private realtimeService: RealtimeService) { }
  title = 'SFW Info Board';
  isSubscribed = false;
  isLoaded = false;
  receivedValues: numericIdObject[];
  exampleObject = <numericIdObject[]>[{
    numericId: "3200000",
    name: "Outside",
    description:"temperature roof",
    unit: "°C",
    picture: 1
  },
  {
    numericId: "42110251",
    name: "SFW ",
    description:"temperature floor",
    unit: "°C",
    picture: 2
  },
  {
    numericId: "42110253",
    name: "SFW ",
    description:"temperature ceiling",
    unit: "°C",
    picture: 2
  }];
  ngOnInit() {
    this.getLiveData(this.exampleObject)
  }
  getLiveData(arRealtime: numericIdObject[]) {
    this.isLoaded=false;
    console.log('getLiveData');
    this.realtimeService.getData(arRealtime).subscribe((data) => {
      this.isSubscribed = true;
      this.isLoaded = true;
      this.receivedValues = data;
    //  console.log("receivedData:", data);
    });
  }
  ngOnDestroy() {
    if (this.isSubscribed == true) {
      this.realtimeService.unsubscribe();
      this.isSubscribed = false;
    }

  }
}
