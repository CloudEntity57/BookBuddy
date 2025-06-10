import { ChangeDetectorRef, Component, Inject, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WINDOW } from '../assets/window.token';
import { MatButtonModule } from '@angular/material/button';
import { OAuthModule } from 'angular-oauth2-oidc';
import { AuthService } from './services/auth/auth.service';
import { CommonModule } from '@angular/common';


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
    if(this.window) window?.addEventListener('scroll', ()=>{
      if(window?.scrollY > 15){
        document.querySelector('nav')?.setAttribute('class','main-navbar vanishing');
        this.changeDetector.detectChanges();
      }
    });
    if(this.window) window?.addEventListener('scrollend',()=>{
      if(window?.scrollY === 0){
        document.querySelector('nav')?.setAttribute('class', 'main-navbar appearing');
        this.changeDetector.detectChanges();
      }else{
        document.querySelector('nav')?.setAttribute('class', 'main-navbar navbar-visible appearing');
        this.changeDetector.detectChanges();
      }
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
