import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideOAuthClient } from 'angular-oauth2-oidc';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes), 
    provideClientHydration(withEventReplay()),
    // importProvidersFrom(HttpClientModule),
    provideHttpClient(),
    provideOAuthClient()
    // provideOAuthClient({
    //   resourceServer: {
    //     allowedUrls: ['http://localhost:4200'],
    //     sendAccessToken: true
    //   }
    // })
  ]
};
