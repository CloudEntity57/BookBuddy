import { Injectable } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { googleAuthConfig } from './auth.config';
import { BehaviorSubject, filter, map, Observable } from 'rxjs';
import { BookBuddyUser, GoogleUser, UserAPIResponse } from '../../interfaces/user.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private oAuthService: OAuthService, private http: HttpClient) {
    this.configure();
  }

  public $isLoggedIn = new BehaviorSubject<boolean>(false);
  public userProfile: any = null;
  public userInfo = new BehaviorSubject<BookBuddyUser>({} as BookBuddyUser);
  public async login() {
    // this.oAuthService.initCodeFlow();
    this.oAuthService.initCodeFlow();
  }

  public logout() {
    this.oAuthService.logOut();
  }

  public async configure(){
    this.oAuthService.configure(googleAuthConfig);
    // this.oAuthService.loadDiscoveryDocumentAndTryLogin();
    this.oAuthService.loadDiscoveryDocumentAndTryLogin({
        customRedirectUri:'http://localhost:4200',
        disableOAuth2StateCheck: true
    }).then(_ => {
      if(this.oAuthService.hasValidAccessToken()){
        this.$isLoggedIn.next(true);
      }else if(!this.oAuthService.hasValidAccessToken){
        console.log('token has expired - initializing token refresh flow')
        this.oAuthService.initCodeFlow();
      }
      else{
        this.$isLoggedIn.next(false);
      }
      this.oAuthService.setupAutomaticSilentRefresh();
    })
    this.oAuthService.events.subscribe(e => {
      console.log(`auth service event: ${e.type}`)
      if(e.type === 'logout' || e.type === 'token_expires'){
        this.$isLoggedIn.next(false);
      }
    })
  }


  public async initUserInfo(){
     await this.oAuthService.loadUserProfile().then((user) => {
      const userProfile = user as UserAPIResponse;
      console.log('User Profile:', userProfile);
      // check if user exists in DB
      const email = userProfile.info.email;
      this.checkIfUserExists(email).pipe().subscribe(user => {
        console.log('USER EXISTS IN DB: ', user)
        this.userInfo.next(user);
      });
      this.userProfile = userProfile;
    });
  }

  public checkIfUserExists(userEmail: string): Observable<BookBuddyUser>{
    return this.http.get(`${environment.apiUrl}/Users/${userEmail}`) as Observable<BookBuddyUser>;
  }

  // get isLoggedIn(): boolean {
  //   const loggedIn = this.oAuthService.hasValidAccessToken();
  //   return loggedIn;
  // }

}
