import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { BookPageComponent } from './components/book-page/book-page.component';
import { BookPageResolver } from './resolvers/book-page-resolver.service';
import { ProfileComponent } from './components/profile/profile.component';

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
    }
];
