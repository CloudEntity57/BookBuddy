import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WINDOW } from '../assets/window.token';
import { MatButtonModule } from '@angular/material/button';
import { OAuthModule } from 'angular-oauth2-oidc';
import { AuthService } from './auth/auth.service';
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

  ngOnInit(): void {
    if(this.authService.isLoggedIn){
      this.isLoggedIn = true;
      this.changeDetector.detectChanges();
    }
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

  public checklogin(){
    console.log(this.authService.isLoggedIn)

  }
  

  public login(){
    this.authService.login();
  }

  public logout(){
    this.authService.logout();
  }
}
