import { ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GoogleBookInfo, GoogleBookSearchResults, OpenLibraryAuthorInfo, OpenLibraryWorkInfo, OpenLibraryBookSearchInfo } from '../../interfaces/book.interface';
import { BaseBook } from '../base-book';
import { AsyncPipe, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { environment } from '../../../environments/environment';
import { BookService } from '../../services/books/book.service';
import { map, Observable, of, take } from 'rxjs';

@Component({
  selector: 'app-book-page',
  imports: [ DatePipe, MatButtonModule ],
  templateUrl: './book-page.component.html',
  styleUrl: './book-page.component.scss'
})
export class BookPageComponent implements OnInit{
    constructor(private router: Router, private route: ActivatedRoute, private bookService: BookService, private changeDetector: ChangeDetectorRef){

    }

    public api_type = environment.books.bookByIdApi;

    public bookList: Array<OpenLibraryBookSearchInfo> = [];
    public book!: GoogleBookInfo;
    public work!: OpenLibraryWorkInfo;
    // public author?: Array<string> = this.api_type == "openLibrary" ? this.work?.subject_people : this.book?.volumeInfo?.authors;
    public get title() { return this.api_type == "openLibrary" ? this.work?.title :  this.book?.volumeInfo?.title };
    public get date(){ return this.api_type == "openLibrary" ? this.work?.created.value : this.book.volumeInfo?.publishedDate};
    public get description() { return this.api_type == "openLibrary" ? ( typeof this.work.description == 'object' ? this.work.description.value : this.work.description) : this.book.volumeInfo?.description};
    public authorEnglish = signal('');

    public getAuthors(work: OpenLibraryWorkInfo | GoogleBookInfo) : Observable<any>{ 
      if(work.source == "openLibrary"){
        console.log('openlibrary')
        this.bookService.getAuthor(this.work?.authors[0].author.key).pipe(take(1)).subscribe(authorjson => {
          console.log('author json: ', authorjson)
          if(!authorjson){
            this.authorEnglish.set('no author name found');
          }
          this.authorEnglish.set( authorjson.personal_name || authorjson.name );
          // this.changeDetector.detectChanges();
        });
      }
      if(work.source == 'google'){
        console.log('google')
        this.authorEnglish.set(work.volumeInfo?.authors.join() as string)
      }
      return of("Google Books Author Name")
      // return this.api_type == "openLibrary" ? environment.books.openLibraryWorksApi + this.work?.authors[0].author.key+'.json' : this.book.volumeInfo?.authors
    };
    public get smallImageLink(){ return this.api_type == "openLibrary" ? this.work.title :  this.book.volumeInfo?.title };
    public get mediumImageLink(){ return this.api_type == "openLibrary" ? environment.books.openLibraryCoverApi + this.work?.covers[0]+'-M.jpg' : this.book.volumeInfo?.imageLinks?.medium };
    public get bigImageLink(){ return this.api_type == "openLibrary" ? environment.books.openLibraryCoverApi + this.work?.covers[0]+'-L.jpg' : this.book.volumeInfo?.imageLinks?.large };
    public get smallThumbnail(){ return this.api_type == "openLibrary" ? (this.work.covers && environment.books.openLibraryCoverApi +this.work?.covers[0]+'-M.jpg' || "assets/images/generic_cover.png") : (this.book.volumeInfo?.imageLinks?.smallThumbnail || "/assets/images/generic_cover.png")};
    public get thumbnail() { return this.api_type == "openLibrary" ? (environment.books?.openLibraryCoverApi + (this.work?.covers && this.work.covers[0])+'-M.jpg') : this.book?.volumeInfo?.imageLinks?.thumbnail}


  ngOnInit(): void {
    if(this.api_type === "google") this.book = this.route.snapshot.data['book'];
    else this.work = this.route.snapshot.data['book'];
    console.log('BOOK: ',this.book);
    console.log('WORK', this.work)
    if(this.api_type === "openLibrary"){
      this.getAuthors(this.work);
    }
  }

}
