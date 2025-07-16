import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Data, Router } from '@angular/router';
import { GoogleBookInfo, GoogleBookSearchResults, OpenLibraryAuthorInfo, OpenLibraryWorkInfo, OpenLibraryBookSearchInfo, DatabaseBook } from '../../interfaces/book.interface';
import { AsyncPipe, CommonModule, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { environment } from '../../../environments/environment';
import { BookService } from '../../services/books/book.service';
import { catchError, map, Observable, of, Subscription, take, throwError } from 'rxjs';
import { wantToReadAIAgents } from '../../data/want-to-read-ai-agents';
import { AuthService } from '../../services/auth/auth.service';
import { BookBuddyUser } from '../../interfaces/user.interface';
import {MatDividerModule} from '@angular/material/divider';
@Component({
  selector: 'app-book-page',
  imports: [ DatePipe, MatButtonModule, MatDividerModule, CommonModule ],
  templateUrl: './book-page.component.html',
  styleUrl: './book-page.component.scss'
})
export class BookPageComponent implements OnInit, OnDestroy{
    constructor(private router: Router, private route: ActivatedRoute, private bookService: BookService, private authService: AuthService, private changeDetector: ChangeDetectorRef){

    }

    public api_type = environment.books.bookByIdApi;

    public wantToReadAIAgents = wantToReadAIAgents;
    public usersWhoWantToRead: Array<BookBuddyUser> = [] as Array<BookBuddyUser>
    public userLoggedIn = false;
    public userWantsToRead: boolean = false;
    public userInfo: BookBuddyUser = {} as BookBuddyUser;
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
    this.subscriptions.push(
      this.authService.userInfo.subscribe(userInfo => {
        if(userInfo && userInfo.id){
          console.log('bookpage init db profile: ', userInfo);
          this.userInfo = userInfo;
          this.userLoggedIn = true;
          this.changeDetector.detectChanges();
          this.processBookData();
        }else{
          this.restoreToLoggedOutState();
          this.changeDetector.detectChanges();
        }
      })
    );
    this.subscriptions.push(this.authService.$isLoggedIn.subscribe(login => {
      if(!login){
        this.restoreToLoggedOutState();
        this.changeDetector.detectChanges();
      }
    }))
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

  public processBookData(){
    this.route.queryParams.subscribe(params => {
      // clear existing want-to-read column for new data:
      this.usersWhoWantToRead = [];
      this.userWantsToRead = false;
      this.changeDetector.detectChanges();
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
                  this.checkIfBookOnUserReadList(res);
                }else{
                  console.log('user not logged in')
                }
              }));
              this.changeDetector.detectChanges();
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
            })
          }));
        }
        return throwError(() => new Error('Something went wrong. Please try again.'));
      })
    ).subscribe(res => {
      // book already exists in DB, so add user to existing book:
      const book = res as DatabaseBook;
      const usersWantToRead = JSON.stringify(book.usersWantToRead);
      console.log(`res: ${book.title} - ${usersWantToRead}`)
      this.checkIfLoggedIn();
      this.bookService.updateBookWantToRead(this.userInfo.id, book.id).subscribe(created => {
        this.setUserWantsToRead(created);
      })
    }))
  }

  public setUserWantsToRead(created: DatabaseBook): void{
    console.log('ADDED book to user list - ', created);
    this.userWantsToRead = true;
    this.usersWhoWantToRead.push(this.userInfo);
    this.changeDetector.detectChanges();
  }

}
