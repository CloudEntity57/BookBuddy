import { Injectable } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { googleAuthConfig } from './auth.config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private oAuthService: OAuthService) {
    this.configure();
  }

  public async login() {
    await this.oAuthService.loadDiscoveryDocumentAndTryLogin();
    this.oAuthService.initCodeFlow();
  }

  public logout() {
    this.oAuthService.logOut();
  }

  public async configure(){
    this.oAuthService.configure(googleAuthConfig);
    // await this.oAuthService.loadDiscoveryDocumentAndTryLogin();
    // if(!this.oAuthService.hasValidAccessToken()){
    //   this.oAuthService.initLoginFlow(); // starts PKCE flow
    // }
  }


  get userInfo() {
    const claims: any = this.oAuthService.getIdentityClaims();
    return claims ? claims : null;
  }

  get isLoggedIn(): boolean {
    return this.oAuthService.hasValidAccessToken();
  }
}
