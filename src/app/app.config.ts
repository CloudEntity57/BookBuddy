import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HTTP_INTERCEPTORS, withInterceptorsFromDi } from '@angular/common/http'
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideOAuthClient } from 'angular-oauth2-oidc';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthInterceptor } from './services/auth/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes), 
    provideClientHydration(withEventReplay()),
    // importProvidersFrom(HttpClientModule),
    provideHttpClient(withInterceptorsFromDi()), 
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    provideOAuthClient()
    // provideOAuthClient({
    //   resourceServer: {
    //     allowedUrls: ['http://localhost:4200'],
    //     sendAccessToken: true
    //   }
    // })
  ]
};
