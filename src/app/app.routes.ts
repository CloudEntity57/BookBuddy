import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { BookPageComponent } from './components/book-page/book-page.component';
import { BookPageResolver } from './resolvers/book-page-resolver.service';
import { ProfileComponent } from './components/profile/profile.component';
import { AuthComponent } from './components/auth/auth.component';
import { AuthCallbackComponent } from './components/auth-callback/auth-callback.component';

export const routes: Routes = [
    { path: '', component: LandingPageComponent },
    { path: 'dashboard', component: DashboardComponent },
    { 
        path: 'book', 
        component: BookPageComponent,
        resolve: {
         book:  BookPageResolver
        }
    },
    {
        path: 'profile',
        component: ProfileComponent
    },
    {
        path: 'auth',
        component: AuthComponent
    },
    {
        path: 'auth-callback',
        component: AuthCallbackComponent
    }

];
