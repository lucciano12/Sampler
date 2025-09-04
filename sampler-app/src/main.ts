import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http"; // Importamos HttpClient y el interceptor de dependencias

bootstrapApplication(App, {
  providers: [
    provideHttpClient(withInterceptorsFromDi())
  ]
});

