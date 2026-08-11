import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { BuddyService } from '../../services/buddies/buddy.service';
import { filter, Observable, Subject, Subscription, take, takeUntil } from 'rxjs';
import { BookBuddyUser } from '../../interfaces/user.interface';
import { ProgressBarService } from '../../services/progress-bar.service';
import { AuthService } from '../../services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { ImageService } from '../../services/images/image.service';
import { BookService } from '../../services/books/book.service';
import { GoogleBookInfo } from '../../interfaces/book.interface';
import { NavigationEnd, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MessageService } from '../../services/messages/message.service';
import { Store } from '@ngrx/store';
import { selectBuddies, selectIsLoggedIn, selectUserInfo } from '../../services/auth/store/auth.selectors';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    MatButtonModule,
    MatTabsModule
  ],
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy{
  public $userInitiated = new Subject<void>();
  public $bookLoaded = new Subject<void>();
  public userImageService!: ImageService;

  constructor(private router: Router, private authService: AuthService, private buddyService: BuddyService, private progressBarService: ProgressBarService, private changeDetector: ChangeDetectorRef, private imageService: ImageService, private bookService: BookService, private messageService: MessageService, private store: Store ){ 
    this.userImageService = imageService
  }
  public $loggedIn!: Observable<boolean>;
  public $userInfo!: Observable<BookBuddyUser | null>;
  public $buddies!: Observable<Array<BookBuddyUser> | null>;
  private subscriptions: Array<Subscription> = [];
  public buddies!: Array<BookBuddyUser> | null;
  public userInfo: BookBuddyUser = {} as BookBuddyUser;
  public userLoggedIn: boolean = false;
  public wantToReadList: Array<GoogleBookInfo> = [];
  public haveReadList: Array<GoogleBookInfo> = [];
  ngOnInit(): void {
    this.$loggedIn = this.store.select(selectIsLoggedIn);
    this.$userInfo = this.store.select(selectUserInfo);
    this.$buddies = this.store.select(selectBuddies);
     console.log('INIT NEW Landing PAGE')
        this.subscriptions.push(
          this.$userInfo.subscribe(userInfo => {
            console.log('dashboard getting user info from store: ', userInfo)
            if(userInfo && userInfo.id){
              this.progressBarService.startProgressBar();
              this.userInfo = userInfo;
              this.userLoggedIn = true;
              this.updateUserDashboardItems(userInfo)
              // retrieve buddy list
              this.subscriptions.push(this.$buddies.subscribe(buddies => {
                this.buddies = buddies;
                console.log('dashboard loaded buddies from store: ', this.buddies)
                this.progressBarService.stopProgressBar();
                this.changeDetector.detectChanges();
              }));
            }else{
              this.resetPageDefaults();
              this.changeDetector?.detectChanges();
            }
          })
        );
    
    //  
    this.subscriptions.push(this.$loggedIn.subscribe(login => {
      if(!login){
        this.resetPageDefaults();
        this.changeDetector?.detectChanges();
      }
    }));
    // this.subscriptions.push(this.buddyService.$buddies.subscribe(buddies => {
    //   this.buddies = buddies;
    //   this.changeDetector.detectChanges();
    // }));
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // This contains an unsolved bug - getting duplicate loads of the same book in want to read list due to some unknown reason in the subscription.
  public updateUserDashboardItems(userInfo: BookBuddyUser){
    console.log('updating dashboard items for user: ', userInfo);
    this.wantToReadList = [];
    this.haveReadList = [];
    if(userInfo.wantToRead && userInfo.wantToRead.length > 0){
      userInfo.wantToRead.forEach(book => {
        console.log('getting book by id: ', book.apiId);
        this.subscriptions.push(this.bookService.getAPIBookById(book.apiId, "google").subscribe({
          next: bookResult => {
            console.log('got book result: ', bookResult);
            // temporary fix for duplicate books in want to read list - check if book already exists in list before adding it
            if(!this.wantToReadList.some(b=> b.volumeInfo.title === bookResult.volumeInfo.title)){
              console.log('(book not yet populated in want to read list)');
              this.wantToReadList.push(bookResult);
            }
          },
          error: error => console.log('error getting book by id: ', error.message)
        }));
      });
      this.changeDetector.detectChanges();
    }
    if(userInfo.haveRead && userInfo.haveRead.length > 0){
      userInfo.haveRead.forEach(book => {
        this.subscriptions.push(this.bookService.getAPIBookById(book.apiId, "google").subscribe({
          next: bookResult => {
            this.haveReadList.push(bookResult);
          },
          error: error => console.log('error getting book by id: ', error.message)
        }));
      });
    }  
    this.changeDetector.detectChanges();
  }

  public goToBookPage(book:GoogleBookInfo){
      try{
          this.router.navigate(['/book'],{
              queryParams:{
                  id: book.id
              }
          });        
      }catch (err){
          console.log('ERROR NAVIGATING - ', err)
      }

  } 

  public initiateMessaging(user: BookBuddyUser): void{
    this.progressBarService.startProgressBar();
    console.log(`the progress bar is running: ${this.progressBarService.isLoading.getValue()}`);
    const user1 = this.userInfo;
    const user2 = user;
    this.subscriptions.push(this.messageService.checkExistingConversation(user1.id, user2.id)
      .subscribe({
        next: (conversation) => {
          // Conversation exists → navigate to chat screen
          console.log('Existing conversation found:', conversation);
          this.messageService.conversationToStage.next(conversation);
          this.progressBarService.stopProgressBar();
        },
        error: (err) => {
          if (err.status === 404) {
            console.log('no existing conversation found. Creating new conversation')
            // No conversation exists → create one
            this.messageService.createNewConversation(user1, user2)
          }
          if (err.status === 500){
            console.log('internal error: ', err.error)
          }
        }
      }));
  }
  public resetPageDefaults(): void{
    
  }


}


