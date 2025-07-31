import { ChangeDetectorRef, Component, Inject, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { WINDOW } from '../assets/window.token';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { OAuthModule } from 'angular-oauth2-oidc';
import { AuthService } from './services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { debounceTime, fromEvent, Subscription, throttleTime } from 'rxjs';
import { BookDropdownOptionComponent } from "./shared/components/book-dropdown-option/book-dropdown-option.component";
import { environment } from '../environments/environment';
import { ProgressBarService } from './services/progress-bar.service';
import { MessageBarComponent } from './components/message-bar/message-bar.component';
import { NotificationService } from './services/notifications/notification.service';
import { Notification } from './interfaces/notification.interface';


@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    MatButtonModule,
    MatIconModule,
    OAuthModule,
    RouterLink,
    MatMenuModule,
    MatProgressBarModule,
    CommonModule, 
    MessageBarComponent,
    BookDropdownOptionComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy{
  constructor(private authService: AuthService, private changeDetector: ChangeDetectorRef, private progressBarService: ProgressBarService, private notificationsService: NotificationService){
  }
  private lastScrollTop = 0;
  title = 'bookbuddy';
  public isLoggedIn: boolean = false;
  public userIconURL?: string;
  public subscriptions: Array<Subscription> = [];
  public isHovering: boolean = false;
  public closeTimeout: any;
  public isLoading: boolean = false;
  public unreadNotifications: boolean = false;
  public notifications: Array<Notification> = [];

  ngOnInit(): void {
    this.subscriptions.push(this.authService.$isLoggedIn.subscribe((loggedIn)=>{
      if(loggedIn === true){
        this.isLoggedIn = true;
        this.changeDetector.detectChanges();
        this.authService.initUserInfo().then(() => {
          this.authService.userInfo.subscribe(userInfo => {
            console.log('on init db profile: ', userInfo);
            // populate the user icon 
            this.userIconURL = userInfo.avatarUrl;
            console.log('user icon url: ', this.userIconURL)
            if(userInfo && userInfo.id){
              this.subscriptions.push(this.notificationsService.getUserNotifications(userInfo.id).subscribe(res => {
                if(res){
                  console.log('got notifications: ', res)
                  this.notifications = res;
                  this.notifications.forEach(notification => {
                    if(notification.isRead === false){
                      this.unreadNotifications = true;
                    }
                  })
                }
              }));            
            }


            this.changeDetector.detectChanges();
          })
        })
      }
      if(loggedIn  === false){
        console.log('no user logged in')
        this.isLoggedIn = false;
        this.changeDetector.detectChanges();
      }
    }));
    this.subscriptions.push(fromEvent(window, 'scroll').pipe(debounceTime(10)).subscribe(()=>{
      const currentScroll = document.documentElement.scrollTop;
      if(currentScroll > this.lastScrollTop){
        console.log(' > last scroll top')
        document.querySelector('.main-navbar')?.setAttribute('class','main-navbar vanishing');
        // setTimeout(() => {
        //   document.querySelector('.main-navbar')?.setAttribute('class', 'main-navbar appearing');
        // },500)
        this.changeDetector.detectChanges();
      }else if(currentScroll <= 200){
        console.log('scrolled to top. current: ', currentScroll)
        document.querySelector('.main-navbar')?.setAttribute('class', 'main-navbar appearing');
        this.changeDetector.detectChanges();
      }
      else{
        console.log('else scroll evt')
        document.querySelector('.main-navbar')?.setAttribute('class', 'main-navbar appearing');
        this.changeDetector.detectChanges();
      }
      this.lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
    }));
    this.subscriptions.push(this.progressBarService.isLoading.subscribe(loading => {
      this.isLoading = loading;
      this.changeDetector.detectChanges();
    }))
    // this.subscriptions.push(fromEvent(window,'scrollend').subscribe(()=>{
    //   console.log('scrollend')
    //     const currentScroll = document.documentElement.scrollTop;
    //     document.querySelector('.main-navbar')?.setAttribute('class', 'main-navbar appearing');
    //     this.changeDetector.detectChanges();
      
    // }));
    // const returnUrl = localStorage.getItem('returnUrl') || '';
    //   this.router.navigateByUrl(returnUrl).then(() => localStorage.removeItem('returnUrl'));
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  
  public dropdownCloseAction(menuTrigger: MatMenuTrigger){
    setTimeout(() => {
      menuTrigger.closeMenu();
    }, 500);
  }

  public onMouseEnter(menuTrigger: MatMenuTrigger) {
    console.log('mouse enter')
    menuTrigger.openMenu();

  }
  public onMouseLeave(menuTrigger: MatMenuTrigger) {
    console.log('mouse leave')
   menuTrigger.closeMenu();
  }

  public login(){
    this.authService.login();
  }

  public logout(){
    this.authService.logout();
  }
}
