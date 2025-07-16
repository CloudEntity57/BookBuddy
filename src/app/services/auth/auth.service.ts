import { Injectable } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { googleAuthConfig } from './auth.config';
import { BehaviorSubject, catchError, filter, map, Observable, throwError } from 'rxjs';
import { BookBuddyCreateUser, BookBuddyUser, GoogleUser, UserAPIResponse } from '../../interfaces/user.interface';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
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
    this.oAuthService.initCodeFlow();
  }

  public logout() {
    this.userInfo.next({} as BookBuddyUser);
    this.$isLoggedIn.next(false);
    this.oAuthService.logOut();
  }

  public async configure(){
    console.log('configuring oauth')
    this.oAuthService.configure(googleAuthConfig);
    this.oAuthService.loadDiscoveryDocumentAndTryLogin({
        customRedirectUri:'http://localhost:4200',
        disableOAuth2StateCheck: true
    }).then(_ => {
      if(this.oAuthService.hasValidAccessToken()){
        console.log('has valid token')
        this.$isLoggedIn.next(true);
      }
      else{
        console.log('nobody is logged in')
        this.$isLoggedIn.next(false);
      }
      this.oAuthService.setupAutomaticSilentRefresh();
    })
    this.oAuthService.events.subscribe(e => {
      console.log(`auth service event: ${e.type}`)
      if(e.type === 'logout' || e.type === 'token_expires'){
        console.log('token has expired - initializing token refresh flow')
        const refreshToken = this.oAuthService.getRefreshToken();
        console.log('Refresh token:', refreshToken);
        this.oAuthService.refreshToken();
        this.$isLoggedIn.next(false);
        this.userInfo.next({} as BookBuddyUser);
      }
    })
  }


  public async initUserInfo(){
     await this.oAuthService.loadUserProfile().then((user) => {
      const userProfile = user as UserAPIResponse;
      console.log('User Profile:', userProfile);
      // check if user exists in DB
      const email = userProfile.info.email;
      this.checkIfUserExists(email).subscribe({
        next: user => {
          console.log('USER EXISTS IN DB: ', user)
          this.userInfo.next(user);
        },
        error: (err: HttpErrorResponse) => {
          this.newUserLogic(err, userProfile);
        }

      });
      this.userProfile = userProfile;
    });
  }

  public newUserLogic(err: HttpErrorResponse, userProfile: UserAPIResponse): void{
    if(err.status === 404){
      console.log('USER IS NOT in DB');
      // user doesn't exist in DB. Create a user instance in DB:
      const userDto: BookBuddyCreateUser = {
        userName: userProfile.info.name,
        email: userProfile.info.email,
        avatarUrl: userProfile.info.picture,
        createdAt: new Date()
      };
      this.saveNewUser(userDto).subscribe({
        next: user => {
          console.log('NEW USER CREATED IN DB: ', user)
          this.userInfo.next(user);
        },
        error: (err: HttpErrorResponse) => {
          console.log('ERROR creating new user: ', err)
        }
      });
    }
  }

  public checkIfUserExists(userEmail: string): Observable<BookBuddyUser>{
    return this.http.get<BookBuddyUser>(`${environment.apiUrl}/Users/${userEmail}`).pipe(
        catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }

  public saveNewUser(userDto: BookBuddyCreateUser): Observable<BookBuddyUser>{
    return this.http.post<BookBuddyUser>(`${environment.apiUrl}/Users`, userDto).pipe(
        catchError((error: HttpErrorResponse) => throwError(() => error))
    ); 
  }

}
