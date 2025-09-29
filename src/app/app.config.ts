import {
  ApplicationConfig,
  ErrorHandler,
  inject,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {HttpErrorResponse, provideHttpClient} from '@angular/common/http';
import {ErrorServiceService} from './services/error-service.service';

class AppErrorHandler implements ErrorHandler {
  errorService = inject(ErrorServiceService);

  handleError(error: any) {
    if(error instanceof Error) {
      this.errorService.setError(error.message);
    } else if(error instanceof HttpErrorResponse) {
      this.errorService.setError(error.message);
    } else {
      this.errorService.setError(error.toString());
    }
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(),
    {provide: ErrorHandler, useClass: AppErrorHandler}
  ]
};
