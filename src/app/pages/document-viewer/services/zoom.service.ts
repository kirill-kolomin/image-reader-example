import {Injectable, Signal, signal} from '@angular/core';
import {DEFAULT_ZOOM_VALUE} from '../../../domain/default-zoom-value';

const ZOOM_STEP = 0.1;
const MAX_ZOOM_LEVEL = 2;
const MIN_ZOOM_LEVEL = 0.5;

@Injectable()
export class ZoomService {
  zoomLevel: Signal<number>;

  #zoomLevel = signal(DEFAULT_ZOOM_VALUE);

  constructor() {
    this.zoomLevel = this.#zoomLevel.asReadonly();
  }

  increaseZoom(): void {
    const currentZoom = this.#zoomLevel();
    this.#zoomLevel.set(Math.min(currentZoom + ZOOM_STEP, MAX_ZOOM_LEVEL));
  }

  decreaseZoom(): void {
    const currentZoom = this.#zoomLevel();
    this.#zoomLevel.set(Math.max(currentZoom - ZOOM_STEP, MIN_ZOOM_LEVEL));
  }
}
