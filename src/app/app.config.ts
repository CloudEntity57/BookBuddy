import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HTTP_INTERCEPTORS, withInterceptorsFromDi } from '@angular/common/http'
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideOAuthClient } from 'angular-oauth2-oidc';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthInterceptor } from './services/auth/auth.interceptor';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { loginReducer } from './services/auth/store/auth.reducers';
import { AuthEffects } from './services/auth/store/auth.effects';
import { NotificationsEffects } from './services/notifications/store/notifications.effects';
import { notificationsReducer } from './services/notifications/store/notifications.reducers';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    // importProvidersFrom(HttpClientModule),
    provideHttpClient(),
    // provideHttpClient(withInterceptorsFromDi()),
    // { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    provideOAuthClient()
    // provideOAuthClient({
    //   resourceServer: {
    //     allowedUrls: ['http://localhost:4200'],
    //     sendAccessToken: true
    //   }
    // })
    ,
    provideStore({
      loginState: loginReducer,
      notificationsState: notificationsReducer
    }),
    provideEffects([AuthEffects, NotificationsEffects]),
    provideStoreDevtools({ maxAge: 25, trace: true, logOnly: !isDevMode() })
  ]
};
