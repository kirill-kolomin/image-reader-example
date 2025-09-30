import {Injectable, signal} from '@angular/core';
import {toObservable} from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class ErrorServiceService {
  #error = signal('');
  error$ = toObservable(this.#error);

  setError(error: string): void {
    this.#error.set(error);
  }

  clearError(): void {
    this.#error.set('');
  }
}
