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
      this.authService.initUser(authToken);
    } else {
      console.error('No auth token found in the callback URL.');
      // Handle error, maybe redirect to an error page or show a message
    }
  }

}
