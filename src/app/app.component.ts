import { ChangeDetectorRef, Component, Inject, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { WINDOW } from '../assets/window.token';
import { MatButtonModule } from '@angular/material/button';
import { OAuthModule } from 'angular-oauth2-oidc';
import { AuthService } from './services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { fromEvent, throttleTime } from 'rxjs';
import { BookDropdownOptionComponent } from "./shared/components/book-dropdown-option/book-dropdown-option.component";
import { environment } from '../environments/environment';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet,
    MatButtonModule,
    OAuthModule,
    RouterLink,
    CommonModule, BookDropdownOptionComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{
  constructor(private authService: AuthService, private changeDetector: ChangeDetectorRef, private router: Router){
  }
  private lastScrollTop = 0;
  title = 'bookbuddy';
  public isLoggedIn: boolean = false;
  public userIconURL?: string;

  ngOnInit(): void {
    this.authService.$isLoggedIn.subscribe((loggedIn)=>{
      if(loggedIn === true){
        this.isLoggedIn = true;
        this.changeDetector.detectChanges();
        this.authService.initUserInfo().then(() => {
          this.authService.userInfo.subscribe(userInfo => {
            console.log('on init db profile: ', userInfo);
            // populate the user icon 
            this.userIconURL = userInfo.avatarUrl;
            console.log('user icon url: ', this.userIconURL)
            this.changeDetector.detectChanges();
          })
        })
      }
      if(loggedIn  === false){
        console.log('no user logged in')
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
      
    });
    // const returnUrl = localStorage.getItem('returnUrl') || '';
    //   this.router.navigateByUrl(returnUrl).then(() => localStorage.removeItem('returnUrl'));
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
