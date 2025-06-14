import { ChangeDetectorRef, Component, Inject, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WINDOW } from '../assets/window.token';
import { MatButtonModule } from '@angular/material/button';
import { OAuthModule } from 'angular-oauth2-oidc';
import { AuthService } from './services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { fromEvent, throttleTime } from 'rxjs';


@Component({
  selector: 'app-root',
  imports: 
  [ RouterOutlet, 
    MatButtonModule,
    OAuthModule,
    CommonModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{
  constructor(@Inject(WINDOW) private window: Window, private authService: AuthService, private changeDetector: ChangeDetectorRef){
  }
  private lastScrollTop = 0;
  title = 'bookbuddy';
  public isLoggedIn: boolean = false;
  public userIconURL = null;

  ngOnInit(): void {
    this.authService.$isLoggedIn.subscribe((loggedIn)=>{
      if(loggedIn === true){
        this.isLoggedIn = true;
        this.changeDetector.detectChanges();
        // populate the user icon 
        this.authService.initUserInfo().then(res => {
          this.userIconURL = this.authService.userProfile.info.picture;
          console.log('user icon url: ', this.userIconURL)
          this.changeDetector.detectChanges();
        })
      }
      if(loggedIn  === false){
        this.isLoggedIn = false;
        this.changeDetector.detectChanges();
      }
    });
    fromEvent(window, 'scroll').pipe(throttleTime(90)).subscribe(()=>{
      console.log('scrollevent')
      const currentScroll = document.documentElement.scrollTop;
      if(currentScroll > this.lastScrollTop){
        document.querySelector('.main-navbar')?.setAttribute('class','main-navbar vanishing');
        this.changeDetector.detectChanges();
      }else{
        document.querySelector('.main-navbar')?.setAttribute('class', 'main-navbar appearing');
        this.changeDetector.detectChanges();
      }
      this.lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
    });
    fromEvent(window,'scrollend').subscribe(()=>{
      console.log('scrollend')
        const currentScroll = document.documentElement.scrollTop;
        document.querySelector('.main-navbar')?.setAttribute('class', 'main-navbar appearing');
        this.changeDetector.detectChanges();
      
    })
  }

  // public checklogin(){
  //   this.authService.isLoggedIn;
  // }
  

  public login(){
    this.authService.login();
  }

  public logout(){
    this.authService.logout();
  }
}
