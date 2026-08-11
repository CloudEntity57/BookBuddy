import { AfterViewInit, ChangeDetectorRef, Component, Inject, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { WINDOW } from '../assets/window.token';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { OAuthModule } from 'angular-oauth2-oidc';
import { AuthService } from './services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { debounceTime, filter, fromEvent, Observable, Subject, Subscription, take, takeUntil } from 'rxjs';
import { BookDropdownOptionComponent } from "./shared/components/book-dropdown-option/book-dropdown-option.component";
import { ProgressBarService } from './services/progress-bar.service';
import { MessageBarComponent } from './components/message-bar/message-bar.component';
import { NotificationService } from './services/notifications/notification.service';
import { Notification, NotificationType } from './interfaces/notification.interface';
import { BookBuddyUser } from './interfaces/user.interface';
import { BuddyService } from './services/buddies/buddy.service';
import { Conversation } from './interfaces/conversation.interface';
import { MessageService } from './services/messages/message.service';
import { SignalRService } from './services/signalR/signal-r.service';
import { MessageDTO } from './interfaces/message.interface';
import { ImageService } from './services/images/image.service';
import { Store } from '@ngrx/store';
import { selectIsLoggedIn, selectUserAvatarUrl, selectUserInfo } from './services/auth/store/auth.selectors';
import { buddiesUpdated, loadBuddies, loginSuccess, userInfoUpdated } from './services/auth/store/auth.actions';


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
export class AppComponent implements OnInit, AfterViewInit, OnDestroy{
  public userImageService!: ImageService;
  constructor(private authService: AuthService, private router: Router, private changeDetector: ChangeDetectorRef, private imageService: ImageService, private progressBarService: ProgressBarService, private notificationsService: NotificationService, private buddyService: BuddyService, private messageService: MessageService, private signalRService: SignalRService, private notificationService: NotificationService, private store: Store){
    this.userImageService = imageService;
    this.selectUserAvatar = this.store.select(selectUserAvatarUrl);

  }
  NotificationType = NotificationType;
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
  public user!: BookBuddyUser;
  public activeConversations: Array<Conversation> = [];
  public latestMessages: any = {};
  private $userReceived = new Subject<void>();
  public selectUserAvatar: Observable<string | null>;
  private $loggedIn!: Observable<boolean>;

  ngOnInit(): void {
    const authToken: string = sessionStorage.getItem('authToken') || '';
    console.log('auth token: ', authToken);
    this.$loggedIn = this.store.select(selectIsLoggedIn);
    if(authToken){
      console.log('app.component.ts found an auth token: ', authToken);
      this.setupUserInfo(authToken);
    }
    this.subscriptions.push(this.$loggedIn.subscribe((loggedIn)=>{
      if(loggedIn){
        console.log('app.component.ts has been informed user just logged in');
        console.log('selecting user from store'); 
        this.store.select(selectUserInfo).pipe(take(1)).subscribe(userInfo => {
          this.user = userInfo || {} as BookBuddyUser;
          this.populateUserInfo(this.user);
        });
      }
    }));
    
    // this.subscriptions.push(this.$loggedIn.subscribe((loggedIn)=>{
    //   if(loggedIn === true){
    //     this.isLoggedIn = true;
    //     this.changeDetector.detectChanges();
    //   }
        // Previously the angular-oauth2-oidc library handled the login flow and user info retrieval, but now we are using a custom backend flow. The following code is commented out because it is no longer needed, but it may be useful for reference in the future.

        // this.authService.initUserInfo().then(() => {
        //   this.authService.userInfo.pipe(takeUntil(this.$userReceived)).subscribe(userInfo => {
        //     console.log('on init db profile: ', userInfo);
        //     this.user = userInfo;
        //     this.store.dispatch(userInfoUpdated({userInfo}));
        //     // populate the user icon 
        //     this.userIconURL = userInfo.avatarUrl;
        //     console.log('user icon url: ', this.userIconURL)
        //     if(userInfo && userInfo.id){
        //       this.$userReceived.next();
        //       // get all current notifications on page load
        //       this.subscriptions.push(this.notificationsService.getUserNotifications(userInfo.id).subscribe(res => {
        //         if(res){
        //           console.log('got user notifications from database: ', res)
        //           this.notifications = res;
        //           this.checkForUnreadNotifications()
        //         }
        //       }));
        //       // get buddies
        //       this.store.dispatch(loadBuddies({userId: userInfo.id}));
        //       console.log('dispatched get buddies action for global state');
        //     }
        //     this.changeDetector.detectChanges();
        //   })
        // })
      // }
    //   if(loggedIn  === false){
    //     console.log('no user logged in')
    //     this.isLoggedIn = false;
    //     this.changeDetector.detectChanges();
    //   }
    // }));
    this.subscriptions.push(this.authService.userInfo.subscribe(user => {
      this.user = user
    }));

    this.subscriptions.push(fromEvent(window, 'scroll').pipe(debounceTime(10)).subscribe(()=>{
      const currentScroll = document.documentElement.scrollTop;
      if(currentScroll > this.lastScrollTop){
        // console.log(' > last scroll top')
        document.querySelector('.main-navbar')?.setAttribute('class','main-navbar vanishing');
        // setTimeout(() => {
        //   document.querySelector('.main-navbar')?.setAttribute('class', 'main-navbar appearing');
        // },500)
        this.changeDetector.detectChanges();
      }else if(currentScroll <= 200){
        // console.log('scrolled to top. current: ', currentScroll)
        document.querySelector('.main-navbar')?.setAttribute('class', 'main-navbar appearing');
        this.changeDetector.detectChanges();
      }
      else{
        // console.log('else scroll evt')
        document.querySelector('.main-navbar')?.setAttribute('class', 'main-navbar appearing');
        this.changeDetector.detectChanges();
      }
      this.lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
    }));
    this.subscriptions.push(this.progressBarService.isLoading.subscribe(loading => {
      this.isLoading = loading;
      this.changeDetector.detectChanges();
    }));

    this.subscriptions.push(this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        window.scrollTo({ top: 0 });
      }
    }));

    this.subscribeToGlobalNotificationsUpdates();

    this.subscribeToGlobalNotificationsUpdateTrigger();

    this.listenForConversationsToStage();
  
    
    // this.subscriptions.push(fromEvent(window,'scrollend').subscribe(()=>{
    //   console.log('scrollend')
    //     const currentScroll = document.documentElement.scrollTop;
    //     document.querySelector('.main-navbar')?.setAttribute('class', 'main-navbar appearing');
    //     this.changeDetector.detectChanges();
      
    // }));
    // const returnUrl = localStorage.getItem('returnUrl') || '';
    //   this.router.navigateByUrl(returnUrl).then(() => localStorage.removeItem('returnUrl'));
  }

  ngAfterViewInit(): void {
      // subscribe to signalR live notifications updates:
      this.subscriptions.push(this.notificationsService.latestNotification.subscribe(notification => {
        if(!notification.id){
          return;
        }
        console.log('we got a new notification in app.component.ts: ', notification)
        this.notificationsService.playNotificationSound();
        this.notifications.push(notification);
        this.unreadNotifications = this.notifications.some(n => n.isRead === false);
        switch(notification.type){
          case NotificationType.BuddyRequest: 
            //refresh user data across app to update buddy request list
            console.log('refreshing user data across app to update buddy request list')
            this.authService.refreshUserInfo(this.user?.id || '');
          break;
          default: console.log('no cases match')
        }
      }));
      this.subscriptions.push(this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe(()=>{
        console.log('NAVIGATION CHANGE: UPDATING USER INFO')
        // update user info
        this.authService.refreshUserInfo(this.user.id);
      }));
  }

  public checkForUnreadNotifications(){
    this.unreadNotifications = false;
    this.notifications.forEach(notification => {
      if(notification.isRead === false){
        this.unreadNotifications = true;
      }
    })
  }

  public setupUserInfo(authToken: string): void {
      console.log('app.component.ts: auth token found in session storage: ', authToken)
      this.authService.getCurrentUserInfo().subscribe({
      // this.store.select(selectUserInfo).subscribe({
        next: userInfo => {
          if(!userInfo || !userInfo.id){
            return;
          }
          this.populateUserInfo(userInfo);
      },
        error: err => {
          console.error('Error retrieving user info: ', err);
          // Handle error, maybe redirect to an error page or show a message
          if(err.status === 401){
            console.log('Unauthorized access. Logging out user and redirecting to login page.')
            this.authService.logout();
            this.router.navigate(['/login']);
          }
        }
      });
  }

  public subscribeToGlobalNotificationsUpdateTrigger(): void{
    this.subscriptions.push(this.notificationsService.$updateNotifications.subscribe(() => {
      console.log('update notifications in application.js triggered')
      this.subscriptions.push(this.notificationsService.getUserNotifications(this.user?.id || '').subscribe({
        next: notifications =>{
          this.notifications = notifications;
          this.checkForUnreadNotifications();
          this.changeDetector.detectChanges();
        },
        error: err => console.log('error getting notifications from api: ', err)
      }));
      // this.subscribeToGlobalNotificationsUpdates();
    }))
  }

  public listenForConversationsToStage(): void{
    this.subscriptions.push(this.messageService.conversationToStage.subscribe(conv => {
      console.log('got a new conversation')
      if(conv) this.openMessageBar(conv);

    }));
  }

  public subscribeToGlobalNotificationsUpdates(): void{
    this.subscriptions.push(this.notificationsService.$notifications.subscribe({
      next: notifications =>{
        this.notifications = notifications;
        this.checkForUnreadNotifications();
        this.changeDetector.detectChanges();
      },
      error: err => console.log('error updating notifications: ', err)
    }));
  }

  public handleMenuIconClick(){
    // call API to update all notifications to 'read' status
    if(this.notifications.some(n => n.isRead === false)){
      this.notifications.forEach(notification => {
        notification.isRead = true;
        this.subscriptions.push(this.notificationsService.updateNotification(notification.id, notification).subscribe({
          next: newNotification => {
            console.log('notification updated as read');
            this.unreadNotifications = false;
            this.changeDetector.detectChanges();
          },
          error: err => console.log('error updating notification: ', err)
        }));
      })    
    }
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  public populateUserInfo(userInfo: BookBuddyUser): void {
          console.log('Appcomponent.ts user info retrieved: ', userInfo);
          sessionStorage.setItem('userInfo', JSON.stringify(userInfo));
          sessionStorage.setItem('user_id', userInfo.id);
          this.store.dispatch(userInfoUpdated({userInfo: userInfo}));
          this.store.dispatch(loginSuccess({isLoggedIn: true}));
          this.isLoggedIn = true;
          // Redirect to the dashboard or any other page
            // populate the user icon 
            this.userIconURL = userInfo.avatarUrl;
            console.log('user icon url: ', this.userIconURL)
            if(userInfo && userInfo.id){
              this.$userReceived.next();
              this.signalRService.startConnection();
              this.notificationService.listenForSignalRConnection();    

              // get all current notifications on page load
              this.subscriptions.push(this.notificationsService.getUserNotifications(userInfo.id).subscribe(res => {
                if(res){
                  console.log('got user notifications from database: ', res)
                  this.notifications = res;
                  this.checkForUnreadNotifications()
                }
              }));
              // get buddies
              this.store.dispatch(loadBuddies({userId: userInfo.id}));
              console.log('dispatched get buddies action for global state');
            }
  }
  
  public buddyRequesterName(userId: string): string{
    const user = this.user?.receivedBuddyRequests?.find(user => user.id == userId);
    return user?.userName || '';
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

  public goToLogin(){
    this.router.navigate(['/auth']);
  }

  public login(){
    this.authService.login();
  }

  public logout(){
    this.authService.logout();
  }

  public acceptBuddyRequest(notification: Notification){
    this.subscriptions.push(this.buddyService.acceptAndCancelBuddyRequest(notification.actorId || '', notification.recipientId).subscribe({
      next: res => {
        console.log('accepted buddy request and canceled the request');
      },
      error: err => console.log('error accepting buddy request')
    }));
  }
  public ignoreBuddyRequest(notification: Notification){

  }
  public initiateMessaging(notification: Notification){

  }

  public goToProfile(){
    console.log('going to profile')
    this.router.navigate(['/profile']);
  }

  public async openMessageBar(conversation: Conversation){
    console.log('opening message bar with ', conversation, ' and user ', this.user)
    console.log('active conversations: ', this.activeConversations)
    try{
      await this.signalRService.hubConnection.invoke("JoinConversation", conversation.id);
    }catch (err){
      console.log(`Error connecting to signalR: ${err}`)
    }
    console.log('successfully invoked hubConnection JoinConversation action for conversation ', conversation.id)
    this.latestMessages[conversation.id] = null;
    this.signalRService.hubConnection.on("ConversationUpdated", newMessage => {
      newMessage = newMessage as MessageDTO;
      console.log(`got a new message - ${newMessage.content}`)
      this.messageService.updateMessage(newMessage.conversationId, newMessage);
      // this.activeConversations.find(conv => conv.id === newMessage.conversationId)?.messages.push(newMessage);
      // this.latestConversationUpdated = conversation.id;
      // const targetConversationIndex = newActiveConversations.indexOf(targetConversation);
      // targetConversation.messages.push(newMessage);
      // newActiveConversations.splice(targetConversationIndex,1);
      // newActiveConversations.push(targetConversation);
      // this.activeConversations = newActiveConversations;
      // this.changeDetector.detectChanges();
    });
    this.activeConversations.push(conversation);
    this.changeDetector.detectChanges();
  }
  public async closeConversation(conversation: Conversation){
    await this.signalRService.hubConnection.invoke("LeaveConversation", conversation.id);
    this.activeConversations = this.activeConversations.filter(conv => {
      return conv != conversation;
    });
  } 
}
