import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { Store } from '@ngrx/store';
import { loginSuccess, userInfoUpdated } from '../../services/auth/store/auth.actions';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth-callback',
  imports: [],
  templateUrl: './auth-callback.component.html',
  styleUrl: './auth-callback.component.scss'
})
export class AuthCallbackComponent implements OnInit {

  constructor(private authService: AuthService, private store: Store, private router: Router) { }

  ngOnInit(): void {
    // Grab the auth token from the url query params and store it in session storage
    const urlParams = new URLSearchParams(window.location.search);
    const authToken = urlParams.get('token');
    if(authToken){
      console.log('Auth token received: ', authToken);
      sessionStorage.setItem('authToken', authToken);
      // retrieve user info from the backend using the auth token and store it in session storage
      this.authService.getCurrentUserInfo().subscribe({
        next: userInfo => {
          console.log('User info retrieved: ', userInfo);
          sessionStorage.setItem('userInfo', JSON.stringify(userInfo));
          this.store.dispatch(userInfoUpdated({userInfo: userInfo}));
          this.store.dispatch(loginSuccess({isLoggedIn: true}));
          // Until
          if(!userInfo.profileImageUrl){
            console.log('No profile image found for user, caching Google profile image...');
            this.authService.cacheGoogleProfileImage(userInfo.id, userInfo.avatarUrl || '').then(resp => {
              console.log('successfully cached profile image: ', resp)
            });
          };
          // Redirect to the dashboard or any other page
          this.router.navigate(['/dashboard']);
          // setTimeout(()=> window.location.href = '/dashboard', 5000);
        },
        error: err => {
          console.error('Error retrieving user info: ', err);
          // Handle error, maybe redirect to an error page or show a message
        }
      });
    } else {
      console.error('No auth token found in the callback URL.');
      // Handle error, maybe redirect to an error page or show a message
    }
  }

}
