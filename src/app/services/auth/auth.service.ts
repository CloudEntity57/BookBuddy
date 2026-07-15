import { Injectable } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { googleAuthConfig } from './auth.config';
import { BehaviorSubject, catchError, filter, map, Observable, throwError } from 'rxjs';
import { BookBuddyCreateUser, BookBuddyUser, GoogleUser, UserAPIResponse } from '../../interfaces/user.interface';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { NotificationService } from '../notifications/notification.service';
import { SignalRService } from '../signalR/signal-r.service';
import { Store } from '@ngrx/store';
import { loginSuccess, logoutSuccess, userInfoUpdated } from './store/auth.actions';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private oAuthService: OAuthService, private http: HttpClient, private notificationService: NotificationService, private signalRService: SignalRService, private store: Store) {
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
    // this.$isLoggedIn.next(false);
    this.store.dispatch(userInfoUpdated({userInfo: null}));
    this.store.dispatch(logoutSuccess({isLoggedIn: false}));
    this.oAuthService.logOut();
  }

  public async configure(){
    console.log('configuring oauth')
    this.oAuthService.configure(googleAuthConfig);
    this.oAuthService.loadDiscoveryDocumentAndTryLogin().then(_ => {
      if(this.oAuthService.hasValidIdToken()){
        console.log('has valid token')
        // this.$isLoggedIn.next(true);
        this.store.dispatch(loginSuccess({isLoggedIn: true}));
      }
      else{
        console.log('nobody is logged in')
        // this.$isLoggedIn.next(false);
      }
      this.oAuthService.setupAutomaticSilentRefresh();
    })
    this.oAuthService.events.subscribe(e => {
      console.log(`auth service event: ${e.type}`)
      if(e.type === 'token_expires'){
        console.log('token has expired - initializing token refresh flow')
        const refreshToken = this.oAuthService.getRefreshToken();
        console.log('Refresh token:', refreshToken);
        this.oAuthService.refreshToken();
      }
      if(e.type === 'logout'){
        this.$isLoggedIn.next(false);
        this.userInfo.next({} as BookBuddyUser);
      }
    })
  }

  public refreshUserInfo(userId: string): void{
    if(!userId || userId == undefined) return;
    this.getUserById(userId).subscribe({
      next: user => {
        if(!user){
          console.log('no user found');
          return;
        }
        this.userInfo.next(user);
      },
      error: err => {
        console.log('error while refreshing user info: ', err);
      }
    });
  }

  public getAccessToken(){
    return this.oAuthService.getAccessToken();
  }


  public async initUserInfo(){
     await this.oAuthService.loadUserProfile().then((user) => {
      const userProfile = user as UserAPIResponse;
      console.log('User Profile:', userProfile);
      // check if user exists in DB
      const email = userProfile.info.email;
      this.getUserByEmail(email).subscribe({
        next: user => {
          console.log('USER EXISTS IN DB: ', user)
          this.userInfo.next(user);
          // save user id in session storage
          sessionStorage.setItem('user_id', user.id);
          // this.notificationService.startConnection();
          this.signalRService.startConnection();
          this.notificationService.listenForSignalRConnection();    
      },
        error: (err: HttpErrorResponse) => {
          if(err.status == 404){
            this.newUserLogic(err, userProfile);
          }
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
          // Migrate Google image → SQL Server
          this.cacheGoogleProfileImage(user.id, user.avatarUrl).then(resp => {
            console.log('photo successfully cached: ', resp)
          })
          this.getUserById(user.id).subscribe({
            next: user => {
              this.userInfo.next(user);
            }
          });
        },
        error: (err: HttpErrorResponse) => {
          console.log('ERROR creating new user: ', err)
        }
      });
    }
  }

  async cacheGoogleProfileImage(userId: string, googleUrl: string): Promise<void> {
    try {
      // Fetch image from Google URL
      const response = await fetch(googleUrl);
      const blob = await response.blob();

      // Convert Blob → File for FormData
      const file = new File([blob], 'profile.jpg', { type: blob.type });

      // Prepare FormData
      const formData = new FormData();
      formData.append('file', file);

      // Upload to API
      await this.http
        .post(`${environment.apiUrl}/users/upload-image/${userId}`, formData).toPromise();
    } catch (err) {
      console.error('Failed to cache Google profile image:', err);
    }
  }

  public getUserByEmail(userEmail: string): Observable<BookBuddyUser>{
    return this.http.get<BookBuddyUser>(`${environment.apiUrl}/Users/email/${userEmail}`).pipe(
        catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }

  public getUserById(userId: string): Observable<BookBuddyUser>{
    return this.http.get<BookBuddyUser>(`${environment.apiUrl}/Users/id/${userId}`).pipe(
        catchError((error: HttpErrorResponse) => throwError(() => error))
    );  }

  public saveNewUser(userDto: BookBuddyCreateUser): Observable<BookBuddyUser>{
    return this.http.post<BookBuddyUser>(`${environment.apiUrl}/Users`, userDto).pipe(
        catchError((error: HttpErrorResponse) => throwError(() => error))
    ); 
  }

}
