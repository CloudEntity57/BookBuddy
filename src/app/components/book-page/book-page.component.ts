import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GoogleBookInfo, OpenLibraryWorkInfo, OpenLibraryBookSearchInfo, DatabaseBook } from '../../interfaces/book.interface';
import { CreateNotificationDTO, Notification, NotificationType } from '../../interfaces/notification.interface';
import { CommonModule, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { environment } from '../../../environments/environment';
import { BookService } from '../../services/books/book.service';
import { catchError, map, Observable, of, Subject, Subscription, switchMap, take, takeUntil, throwError } from 'rxjs';
import { wantToReadAIAgents } from '../../data/want-to-read-ai-agents';
import { AuthService } from '../../services/auth/auth.service';
import { BookBuddyUser } from '../../interfaces/user.interface';
import {MatDividerModule} from '@angular/material/divider';
import { BuddyService } from '../../services/buddies/buddy.service';
import { MatDialog } from '@angular/material/dialog';
import { BuddyRequestDialogComponent } from '../../shared/components/buddy-request-dialog/buddy-request-dialog.component';
import { ProgressBarService } from '../../services/progress-bar.service';
import { MatMenuModule } from '@angular/material/menu';
import { MessageBarComponent } from "../message-bar/message-bar.component";
import { NotificationService } from '../../services/notifications/notification.service';
@Component({
  selector: 'app-book-page',
  imports: [DatePipe,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
    CommonModule
  ],
  templateUrl: './book-page.component.html',
  styleUrl: './book-page.component.scss'
})
export class BookPageComponent implements OnInit, OnDestroy{
    constructor(private router: Router, private route: ActivatedRoute, private bookService: BookService, private authService: AuthService, private buddyService: BuddyService, private progressBarService: ProgressBarService, private notificationsService: NotificationService, private changeDetector: ChangeDetectorRef){
    }
    
    public api_type = environment.books.bookByIdApi;
    public requestNote: string = ''
    readonly dialog = inject(MatDialog);
    public buddies: Array<BookBuddyUser> = [];
    public wantToReadAIAgents = wantToReadAIAgents;
    public usersWhoWantToRead: Array<BookBuddyUser> = [] as Array<BookBuddyUser>
    public userLoggedIn = false;
    public userWantsToRead: boolean = false;
    public userInfo: BookBuddyUser = {} as BookBuddyUser;
    private $userInitiated = new Subject<void>();
    public bookList: Array<OpenLibraryBookSearchInfo> = [];
    public databaseBook?: DatabaseBook;
    public book!: GoogleBookInfo;
    public work!: OpenLibraryWorkInfo;
    // public author?: Array<string> = this.api_type == "openLibrary" ? this.work?.subject_people : this.book?.volumeInfo?.authors;
    public get title() { return this.api_type == "openLibrary" ? this.work?.title :  this.book?.volumeInfo?.title };
    public get date(){ return this.api_type == "openLibrary" ? this.work?.created.value : this.book?.volumeInfo?.publishedDate};
    public get description() { return this.api_type == "openLibrary" ? ( typeof this.work.description == 'object' ? this.work.description.value : this.work.description) : this.book?.volumeInfo?.description};
    public authorEnglish = signal('');
    public subscriptions: Array<Subscription> = [];
    public get smallImageLink(){ return this.api_type == "openLibrary" ? this.work.title :  this.book.volumeInfo?.title };
    public get mediumImageLink(){ return this.api_type == "openLibrary" ? environment.books.openLibraryCoverApi + this.work?.covers[0]+'-M.jpg' : this.book.volumeInfo?.imageLinks?.medium };
    public get bigImageLink(){ return this.api_type == "openLibrary" ? environment.books.openLibraryCoverApi + this.work?.covers[0]+'-L.jpg' : this.book.volumeInfo?.imageLinks?.large };
    public get smallThumbnail(){ return this.api_type == "openLibrary" ? (this.work.covers && environment.books.openLibraryCoverApi +this.work?.covers[0]+'-M.jpg' || "assets/images/generic_cover.png") : (this.book.volumeInfo?.imageLinks?.smallThumbnail || "/assets/images/generic_cover.png")};
    public get thumbnail() { return this.api_type == "openLibrary" ? (environment.books?.openLibraryCoverApi + (this.work?.covers && this.work.covers[0])+'-M.jpg') : this.book?.volumeInfo?.imageLinks?.thumbnail}

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  ngOnInit(): void {
    console.log('INIT NEW BOOK PAGE')
    this.progressBarService.startProgressBar();
    this.subscriptions.push(
      this.authService.userInfo.pipe(takeUntil(this.$userInitiated)).subscribe(userInfo => {
        if(userInfo && userInfo.id && !this.userInfo.id){
          console.log('bookpage init db profile: ', userInfo);
          this.userInfo = userInfo;
          this.userLoggedIn = true;
          // retrieve buddy list
          this.subscriptions.push(this.buddyService.getBuddies(this.userInfo.id).subscribe({
            next: buddies => {
              this.buddies = buddies;
              this.progressBarService.stopProgressBar();
            },
            error: err => {
              console.log('error retrieving buddies: ', err)
            }
          }));
          this.$userInitiated.next();
          this.changeDetector?.detectChanges();
          this.processBookData();
        }else{
          this.restoreToLoggedOutState();
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
    this.subscriptions.push(this.authService.$isLoggedIn.subscribe(login => {
      if(!login){
        this.restoreToLoggedOutState();
        this.changeDetector?.detectChanges();
      }
    }));
    if(!this.userLoggedIn){
      this.processBookData();
    }
    console.log('BOOK: ',this.book);
    console.log('WORK', this.work)

  }

  public restoreToLoggedOutState(): void {
    this.userWantsToRead = false;
    this.userLoggedIn = false;
    this.userInfo = {} as BookBuddyUser;
  }

  public messageUser(user: BookBuddyUser): void{
    console.log('messaging user ', user)
  }


  public processBookData(){
    this.route.queryParams.subscribe(params => {
      // clear existing want-to-read column for new data:
      this.usersWhoWantToRead = [];
      this.userWantsToRead = false;
      this.changeDetector?.detectChanges();
      console.log('NEW PARAMS - ', params)
      const bookId = params['id'];
      console.log('BOOK ID = ',bookId)
      this.subscriptions.push(this.bookService.getAPIBookById(bookId!, environment.books.bookByIdApi).subscribe(book => {
            if(this.api_type === "google" && book.source === "google") this.book = book;
            else if(this.api_type === "openLibrary" && book.source === "openLibrary") this.work = book;
            if(this.api_type === "openLibrary"){
              this.getAuthors(this.work);
            }
            if(this.api_type === "google"){
              this.getAuthors(this.book);
            }                
            // query against author/title to see if book exists as a work in DB
            const bookAuthor = encodeURIComponent(this.book.volumeInfo.authors[0]);
            const bookTitle = encodeURIComponent(this.book.volumeInfo.title);
            console.log('looking for book - ', bookTitle, ' by ', bookAuthor);
            this.subscriptions.push(this.bookService.getBookByAuthorAndTitle(bookAuthor,bookTitle)
              .pipe(catchError(err => {
                this.userWantsToRead = false;
                this.changeDetector.detectChanges;
                console.log('book not found - ergo user doesnt want to read', err);
                throw(err);
              })).subscribe(res => {
                console.log(`res: ${res}`)
                // save database book info
                console.log(`saving ${res.title} as this.databaseBook`)
                this.databaseBook = res as DatabaseBook;
                // populate want to read column with users who want to read:
                this.usersWhoWantToRead = res.usersWantToRead;
                // if user is logged in, check if book is on their read list:
                if(this.userLoggedIn){
                  console.log('user logged in')
                  this.checkIfBookOnUserReadList(res);
                }else{
                  console.log('user not logged in')
                }
                // this.progressBarService.stopProgressBar();
              }));
              this.changeDetector?.detectChanges();
      }));
    });
  }

  public getAuthors(work: OpenLibraryWorkInfo | GoogleBookInfo) : Observable<any>{ 
    if(work.source == "openLibrary"){
      console.log('openlibrary')
      this.subscriptions.push(this.bookService.getAuthor(this.work?.authors[0].author.key).pipe(take(1)).subscribe(authorjson => {
        console.log('author json: ', authorjson)
        if(!authorjson){
          this.authorEnglish.set('no author name found');
        }
        this.authorEnglish.set( authorjson.personal_name || authorjson.name );
      }));
    }
    if(work.source == 'google'){
      console.log('google')
      this.authorEnglish.set(work.volumeInfo?.authors[0] as string)
    }
    return of("Google Books Author Name")
  };

  public checkIfBookOnUserReadList(res: DatabaseBook){
    console.log('checking if book is on read list')
    let book;
    if(res) book = res as DatabaseBook;
    console.log('book found in DB: ', book)
    console.log('user info: ', this.userInfo)
    if(book && book.usersWantToRead?.some(user => user.id === this.userInfo.id)){
      // mark book as on their want to read list
      console.log('book is on user read list')
      this.userWantsToRead = true;
      this.changeDetector.detectChanges();
    }else{
      console.log('book is not on user read list')
    }
  }

  public checkIfLoggedIn(){
    // check if user logged in
    const isLoggedIn = this.userLoggedIn;
    console.log('user logged in: ', isLoggedIn)
    if(!isLoggedIn){
      console.log('USER NOT LOGGED IN');
      const returnUrl = this.router.url;
      localStorage.setItem('returnUrl', returnUrl);
      this.authService.login();
    };
  }

  public wantToRead(cancel?: boolean): void {
    this.progressBarService.startProgressBar();
    if(cancel){
      console.log('REMOVING BOOK FROM WANT TO READ LIST', this.userInfo.id, this.databaseBook?.id)
      this.subscriptions.push(this.bookService.deleteBookWantToRead(this.userInfo.id, this.databaseBook?.id).pipe(catchError(err => {
        console.log('there was an error removing book from want to read list: ', err);
        throw(err);
      })).subscribe(res => {
        if(res){
          this.userWantsToRead = false;
          this.usersWhoWantToRead = this.usersWhoWantToRead.filter(user => user.id !== this.userInfo.id);
          this.changeDetector.detectChanges();
        }
        this.progressBarService.stopProgressBar();
      }));
      return;
    }
    // query against author/title to see if book exists as a work in DB
    const bookAuthor = encodeURIComponent(this.book.volumeInfo.authors[0]);
    const bookTitle = encodeURIComponent(this.book.volumeInfo.title);
    console.log('looking for book - ', bookTitle, ' by ', bookAuthor);
    if(!bookAuthor || !bookTitle){
      console.log('error getting book information, aborting. ');
      return;
    }
    this.subscriptions.push(this.bookService.getBookByAuthorAndTitle(bookAuthor,bookTitle).pipe(
      catchError(err => {
        if(err.status === 404){
          this.checkIfLoggedIn();
          // book doesn't exist in DB, so create a book instance based on author/title in the DB to associate all future want-to-reads with 
          console.log('creating new book in DB');
          const newBook = { author: this.book.volumeInfo.authors[0], title: this.book.volumeInfo.title };
          this.subscriptions.push(this.bookService.createBookInDatabase(newBook).subscribe(res => {
            console.log('NEW BOOK CREATED:',res);
            // add user to list of users who want to read the book
            const book = res;
            const userId = this.userInfo.id;
            this.databaseBook = res;
            this.bookService.updateBookWantToRead(userId, book.id).subscribe(created => {
              this.setUserWantsToRead(created);
              this.progressBarService.stopProgressBar();
            })
          }));
        }
        this.progressBarService.stopProgressBar();
        return throwError(() => new Error('Something went wrong. Please try again.'));
      })
    ).subscribe(res => {
      // book already exists in DB, so add user to existing book:
      const book = res as DatabaseBook;
      const usersWantToRead = JSON.stringify(book.usersWantToRead);
      console.log(`res: ${book.title} - ${usersWantToRead}`)
      this.checkIfLoggedIn();
      this.subscriptions.push(this.bookService.updateBookWantToRead(this.userInfo.id, book.id).subscribe(created => {
        this.setUserWantsToRead(created);
      }));
      this.progressBarService.stopProgressBar();
    }))
  }

  public setUserWantsToRead(created: DatabaseBook): void{
    console.log('ADDED book to user list - ', created);
    this.userWantsToRead = true;
    this.usersWhoWantToRead.push(this.userInfo);
    this.changeDetector.detectChanges();
  }

  public updateUser(){
    console.log('updating user')
    this.subscriptions.push(this.authService.getUserByEmail(this.userInfo.email).subscribe(res => {
      if(!res) return;
      console.log('res: ', res)
      this.userInfo = res;
    }));
  }

  // BUDDY REQUEST LOGIC:

  public sendBuddyRequest(user: BookBuddyUser){
    this.checkIfLoggedIn();
    console.log('sending buddy request to ', user)
    const activeUserID = this.userInfo.id;
    console.log('active user id: ', activeUserID)
    const passiveUserID = user.id;
    const bookTitle = this.book.volumeInfo.title;
    let note = 'I want to be your book buddy'

    const dialogRef = this.dialog.open(BuddyRequestDialogComponent, {
      data: {
        name: user.userName,
        requestNote: this.requestNote
      }
    });
    this.subscriptions.push(dialogRef.afterClosed().subscribe(res => {
      console.log('RES TO REQUEST: ', res)
      if(res !== undefined){
        note = res;
        this.progressBarService.startProgressBar();
        this.buddyService.sendBuddyRequest(activeUserID,passiveUserID,note,bookTitle).subscribe(res => {
          if(res){
            console.log('buddy request successfully sent')
            this.updateUser();
            this.progressBarService.stopProgressBar();
          }
        });
      }
    }));
  }

  public buddyRequestSent(mySentBuddyReqs: Array<BookBuddyUser>, otheruser: BookBuddyUser): boolean {
    if(!mySentBuddyReqs || !otheruser) return false;
    // console.log(otheruser.userName + ' received a buddy request: ',mySentBuddyReqs.some(myReq => myReq.id == otheruser.id))
    return mySentBuddyReqs.some(req => req.id == otheruser.id);
  }

  public buddyRequestReceived(reqs: Array<BookBuddyUser>, user: BookBuddyUser):boolean{
    if(!reqs || !reqs.length) return false;
    return reqs.some(req => req.id === user.id);
  }

  public isExistingBuddy(userId: string, buddies:Array<BookBuddyUser>): boolean{
    return buddies.some(user => user.id == userId);
  }

  public acceptBuddyRequest(requester: BookBuddyUser){
    this.progressBarService.startProgressBar();
    this.subscriptions.push(this.buddyService.acceptBuddyRequest(requester.id, this.userInfo.id).pipe(
      switchMap(res => {
        return this.buddyService.sendCancelBuddyRequest(requester.id, this.userInfo.id) as Observable<boolean | undefined>;
      }),
      switchMap(res => {
        return this.buddyService.getBuddies(this.userInfo.id);
      })
    ).subscribe({
      next: updatedFriendships => {
        if(updatedFriendships){
          console.log('successfully added new buddy, removed buddy request and retrieved latest buddy list');
          this.updateUser();
          this.buddies = updatedFriendships;
          console.log('updated buddies: ', this.buddies);
          this.progressBarService.stopProgressBar();
        }
      },
      error: err => {
        console.log('error accepting buddy request: ', err);
      }
    }));
  }

  public rejectBuddyRequest(requester: BookBuddyUser){
    this.progressBarService.startProgressBar();
    console.log('rejecting buddy request')
    if(!requester){
      console.log('undefined inputs for users ', requester)
      return;
    }
    this.subscriptions.push(this.buddyService.rejectBuddyRequest(requester.id, this.userInfo.id).subscribe(res => {
      if(res) console.log('request ignored');
      this.updateUser();
      this.progressBarService.stopProgressBar();
      this.changeDetector.detectChanges();
    }))
  }

  public cancelBuddyRequest(user: BookBuddyUser){
    this.progressBarService.startProgressBar();
    console.log('canceling buddy request');
    const activeUserID = this.userInfo.id;
    const passiveUserID = user.id;
    this.subscriptions.push(this.buddyService.sendCancelBuddyRequest(activeUserID,passiveUserID).subscribe({
      next: res => {
        if(res){
          console.log('buddy request successfully cancelled');
          this.updateUser();
          this.progressBarService.stopProgressBar();
        }
      },
      error: err => {
        if(err.status === 404){
          return;
        }
      }
    }));
  }

}
