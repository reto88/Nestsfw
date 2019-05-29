import {Injectable} from '@angular/core';
import * as signalR from '@aspnet/signalr';
import {Observable, Observer} from 'rxjs';
import { numericIdObject } from './models/numeric-id-object.model';

// interface for RT Data
export interface ICurrentDataItem {
  numericId: string;
  value: number;
  timestamp: string;
  quality?: number;
}

@Injectable({
  providedIn: 'root'
})
export class RealtimeService {
  observer: Observer<numericIdObject[]>;
  connection: signalR.HubConnection;
  receivedObjectArray: numericIdObject[];
  arrayNumId;

  getData(liveValueObjectArray: numericIdObject[]): Observable<numericIdObject[]> {
    // get array of numericIds of the LiveValueObjectArray
    const _numericId = this.getLiveValuesIds(liveValueObjectArray);

 //  console.log(_numericId + 'numId'+ JSON.stringify(liveValueObjectArray));
    this.receivedObjectArray = liveValueObjectArray;
    // websocket connection to the realtime server
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl('https://visualizer.nestcollaboration.ch/Realtime/realtimedata')
      .build();
    this.connection.start().catch(function (err) {
    }).then(() => {
      // init the subscribted values with numericId
      this.connection.invoke('JoinNumericIdGroup', _numericId).then((vl: ICurrentDataItem[]) => {
        const initObjectArr = this.mapReceivedRtValue(vl, this.receivedObjectArray);
     //  console.log(JSON.stringify(initObjectArr)+'objecarr');
       this.observer.next(initObjectArr);
      });
    });
    // next when on value change and updated LiveValuveObject
    this.connection.on('updateData', (dt: ICurrentDataItem[]) => {
      const updatedObjectArr = this.mapReceivedRtValue(dt, this.receivedObjectArray);
     // console.log(JSON.stringify(updatedObjectArr)+'updatedObjectArr');
       this.observer.next(updatedObjectArr);
    });
    return this.createObservable();
  }

// get array of numericIds of the LiveValueObjectArray
  getLiveValuesIds(livevalue: numericIdObject[]) {
    this.arrayNumId = new Array<string>();
    for (const item of livevalue) {
      this.arrayNumId.push(item.numericId);
    }
    if (this.arrayNumId[0] != null) {
      return this.arrayNumId;
    }
  }

// maps the realtime data to the livevalueObjectArray
  mapReceivedRtValue(receivedRT: ICurrentDataItem[], liveValueObjectArray: numericIdObject[]) {
    const liveValueObjectArrayMap = liveValueObjectArray;
    for (const receivedId of receivedRT) {
      const itemIndex = receivedRT.findIndex(item => item.numericId === receivedId.numericId);
      receivedRT[itemIndex] = receivedId;
     //     console.log('LiveValuesUpdated' + JSON.stringify(liveValueObjectArrayMap));
    }
    // realtime array aufspliten index von objekt finden welcher mit empfangen numericid matched
    for (const receivedId of receivedRT) {
      const itemIndex = liveValueObjectArrayMap.findIndex(item => item.numericId === receivedId.numericId);
 
      
      liveValueObjectArrayMap[itemIndex].value = parseFloat(Number(receivedId.value).toFixed(2)); // werte  auf 2 Kommastellen runden
      liveValueObjectArrayMap[itemIndex].timestamp = receivedId.timestamp; // Zeitstempel ersetzen
   //   console.log('LiveValuesUpdated' + JSON.stringify(liveValueObjectArrayMap));
    }
    return liveValueObjectArrayMap;
  }

// stop connection to realtime server
  stopConnection() {
    this.connection.stop().catch(function (err) {
    }).then(() => {
     //   console.log(JSON.stringify(this.connection));

      }
    );
  }

// on destroy -> unsubscribe
  unsubscribe() {
    console.log('unsub');
    this.connection.invoke('LeaveNumericIdGroup', this.arrayNumId);
  }

  createObservable(): Observable<numericIdObject[]> {
    return new Observable(observer => {
      this.observer = observer;
    });
  }
}
