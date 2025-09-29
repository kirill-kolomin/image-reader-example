import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {ErrorServiceService} from './services/error-service.service';
import {Observable} from 'rxjs';
import {AsyncPipe} from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AsyncPipe],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  error$: Observable<string>;

  #errorService = inject(ErrorServiceService);

  constructor() {
    this.error$ = this.#errorService.error$;
  }

  clearError(): void {
    this.#errorService.clearError();
  }
}
