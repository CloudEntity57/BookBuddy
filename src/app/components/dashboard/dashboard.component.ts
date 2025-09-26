import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { BuddyService } from '../../services/buddies/buddy.service';
import { filter, Subject, Subscription, takeUntil } from 'rxjs';
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
  public userImageService!: ImageService;
  constructor(private router: Router, private authService: AuthService, private buddyService: BuddyService, private progressBarService: ProgressBarService, private changeDetector: ChangeDetectorRef, private imageService: ImageService, private bookService: BookService, private messageService: MessageService ){ 
    this.userImageService = imageService
  }
  private subscriptions: Array<Subscription> = [];
  public buddies: Array<BookBuddyUser> = [];
  public userInfo: BookBuddyUser = {} as BookBuddyUser;
  public userLoggedIn: boolean = false;
  public wantToReadList: Array<any> = [];
  public haveReadList: Array<any> = [];
  ngOnInit(): void {
     console.log('INIT NEW Landing PAGE')
        this.subscriptions.push(
          this.authService.userInfo.pipe(takeUntil(this.$userInitiated)).subscribe(userInfo => {
            if(userInfo && userInfo.id && !this.userInfo.id){
            this.progressBarService.startProgressBar();
              console.log('landingpage init db profile: ', userInfo);
              this.userInfo = userInfo;
              this.userLoggedIn = true;
              this.updateUserDashboardItems(userInfo)
              // retrieve buddy list
              this.subscriptions.push(this.buddyService.getBuddies(this.userInfo.id).subscribe({
                next: buddies => {
                  this.buddies = buddies;
                  console.log('landing page loaded buddies: ', this.buddies)
                  this.progressBarService.stopProgressBar();
                },
                error: err => {
                  console.log('error retrieving buddies: ', err)
                }
              }));
              this.$userInitiated.next();
              this.changeDetector?.detectChanges();
            }else{
              this.resetPageDefaults();
              this.changeDetector?.detectChanges();
            }
          })
        );
    
    //  
    this.subscriptions.push(this.authService.$isLoggedIn.subscribe(login => {
      if(!login){
        this.resetPageDefaults();
        this.changeDetector?.detectChanges();
      }
    }));
    this.subscriptions.push(this.buddyService.$buddies.subscribe(buddies => {
      this.buddies = buddies;
      this.changeDetector.detectChanges();
    }));
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  public updateUserDashboardItems(userInfo: BookBuddyUser){
    this.wantToReadList = [];
    this.haveReadList = [];
    if(userInfo.wantToRead && userInfo.wantToRead.length > 0){
      userInfo.wantToRead.forEach(book => {
        this.subscriptions.push(this.bookService.getAPIBookById(book.apiId, "google").subscribe({
          next: bookResult => {
            this.wantToReadList.push(bookResult);
          },
          error: error => console.log('error getting book by id: ', error.message)
        }));
      });
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


