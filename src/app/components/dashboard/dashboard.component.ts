import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { BuddyService } from '../../services/buddies/buddy.service';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { BookBuddyUser } from '../../interfaces/user.interface';
import { ProgressBarService } from '../../services/progress-bar.service';
import { AuthService } from '../../services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { ImageService } from '../../services/images/image.service';
import { BookService } from '../../services/books/book.service';
import { GoogleBookInfo } from '../../interfaces/book.interface';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MessageService } from '../../services/messages/message.service';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    MatButtonModule
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
  ngOnInit(): void {
     console.log('INIT NEW Landing PAGE')
        this.subscriptions.push(
          this.authService.userInfo.pipe(takeUntil(this.$userInitiated)).subscribe(userInfo => {
            if(userInfo && userInfo.id && !this.userInfo.id){
            this.progressBarService.startProgressBar();
              console.log('landingpage init db profile: ', userInfo);
              this.userInfo = userInfo;
              this.userLoggedIn = true;
              if(userInfo.wantToRead && userInfo.wantToRead.length > 0){
                userInfo.wantToRead.forEach(book => {
                  this.subscriptions.push(this.bookService.bookSearch(book.title+' '+book.author, "google").subscribe({
                    next: bookResults => {
                      const googleBookResults: Array<GoogleBookInfo> = bookResults as Array<GoogleBookInfo>;
                      console.log('google returned books for booklist: ', googleBookResults)
                      const newBook = googleBookResults.find(bk => {
                        // if(bk && bk.volumeInfo || !bk.volumeInfo?.title || !bk.volumeInfo.authors || !bk.volumeInfo.imageLinks){
                        //   return;
                        // }
                            return bk?.volumeInfo?.title === book.title && bk?.volumeInfo?.authors[0] === book.author && bk?.volumeInfo?.imageLinks && bk?.volumeInfo?.imageLinks.smallThumbnail
                        });
                      if(!newBook || !newBook.id) return;
                      console.log('new book in list: ', newBook)
                      this.wantToReadList.push(newBook);
                      // this.changeDetector.detectChanges();
                    },
                    error: error => console.log('error getting book by id: ', error.message)
                  }));
                });
              }
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
        this.subscriptions.push(this.authService.userInfo.subscribe(userInfo => {
          if(this.userInfo && this.userInfo.id){
            this.userInfo = userInfo;
            this.changeDetector.detectChanges();
          }
        }));
    
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


