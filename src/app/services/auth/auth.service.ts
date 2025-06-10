import { Injectable } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { googleAuthConfig } from './auth.config';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private oAuthService: OAuthService) {
    this.configure();
  }

  public $isLoggedIn = new BehaviorSubject<boolean>(false);
  public userProfile: any = null;

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
      }else{
        this.$isLoggedIn.next(false);
      }
    })
    this.oAuthService.events.subscribe(e => {
      console.log(`auth service event: ${e.type}`)
      if(e.type === 'logout'){
        this.$isLoggedIn.next(false);
      }
    })
  }


  public async initUserInfo(){
     await this.oAuthService.loadUserProfile().then((userProfile: object) => {
      console.log('User Profile:', userProfile);
      this.userProfile = userProfile;
    });
  }

  // get isLoggedIn(): boolean {
  //   const loggedIn = this.oAuthService.hasValidAccessToken();
  //   return loggedIn;
  // }

}
