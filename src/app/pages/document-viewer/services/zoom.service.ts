import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable()
export class ZoomService {
  private zoomLevelSubject = new BehaviorSubject<number>(1);

  zoomLevel$ = this.zoomLevelSubject.asObservable();

  increaseZoom(): void {
    const currentZoom = this.zoomLevelSubject.value;
    this.zoomLevelSubject.next(Math.min(currentZoom + 0.1, 2)); // Max zoom: 2x
  }

  decreaseZoom(): void {
    const currentZoom = this.zoomLevelSubject.value;
    this.zoomLevelSubject.next(Math.max(currentZoom - 0.1, 0.5)); // Min zoom: 0.5x
  }
}
