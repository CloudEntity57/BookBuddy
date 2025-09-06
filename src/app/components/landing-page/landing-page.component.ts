import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, Observable, Subscription, switchMap, tap } from 'rxjs';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { HttpClient } from '@angular/common/http';
import { BookService } from '../../services/books/book.service';
import { GoogleBookInfo, GoogleBookSearchResults, OpenLibraryWorkInfo, OpenLibraryBookSearchInfo, NyTimesBook, GoogleBookResponse } from '../../interfaces/book.interface';
import { Router } from '@angular/router';
import { BookDropdownOptionComponent } from "../../shared/components/book-dropdown-option/book-dropdown-option.component";
import { environment } from '../../../environments/environment';
import { BaseBook } from '../../shared/components/base-book/base-book';


@Component({
  selector: 'app-landing-page',
  imports: [CommonModule, ReactiveFormsModule, MatSelectModule, MatInputModule, MatAutocompleteModule, BookDropdownOptionComponent],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})
export class LandingPageComponent extends BaseBook implements OnInit, OnDestroy{
  constructor(private bookService: BookService, router: Router, private changeDetector: ChangeDetectorRef ){
    super(router)
  }

  public altThumbnail: string = "/assets/images/generic_cover.png";

  http = inject(HttpClient);

  fb = inject(FormBuilder);

  private subscriptions: Array<Subscription> = [];

  public book_form!: FormGroup;

  public nyTimesBestsellers!: Array<NyTimesBook>;
  public combinedPrintAndEbookBestsellers!: Array<NyTimesBook>;



  ngOnInit(): void {
    this.book_form = this.fb.group({
      book_search: ['']
    })
    this.listenForSearchChanges();
    // subscribe to NY Times Bestsellers API
    this.subscriptions.push(this.bookService.getNyTimesBestsellerList().subscribe({
      next: bookList => {
        console.log('latest books on bestseller list: ', bookList);
        this.nyTimesBestsellers = bookList.results.books;
        this.changeDetector.detectChanges();
        // convert nyt book info into google book info:
        let googleBestsellers = [];
        this.nyTimesBestsellers.forEach(book => {
          const author = book.author;
          const title = book.title;
          this.subscriptions.push(this.http.get<GoogleBookResponse>(`https://www.googleapis.com/books/v1/volumes?q=isbn:${book.primary_isbn13}`).subscribe({
            next: googleBookResp => {
              // console.log('google nyt book: ', googleBookResp.items[0])
              let googleBook = googleBookResp.items[0];
              if(googleBook){
                googleBook.source = 'google';
              }else{
                console.log('no google version of this book was found')
              }
              googleBestsellers.push(googleBook);
              book.googleBooksVersion = googleBook;
            },
            error: error => console.log('error getting google nyt book: ', error)
          }));
        });
      },
      error: error => console.log('error retrieving ny times bestseller list: ', error)
    }));
       // subscribe to NY Times E-Book Nonfiction Bestsellers API
    this.subscriptions.push(this.bookService.getNyTimesEBooksNonFictionBestsellerList().subscribe({
      next: bookList => {
        console.log('latest books on e-book nonfiction bestseller list: ', bookList);
        this.combinedPrintAndEbookBestsellers = bookList.results.books;
        this.changeDetector.detectChanges();
        // convert nyt book info into google book info:
        let googleBestsellers = [];
        this.combinedPrintAndEbookBestsellers.forEach(book => {
          const author = book.author;
          const title = book.title;
          this.subscriptions.push(this.http.get<GoogleBookResponse>(`https://www.googleapis.com/books/v1/volumes?q=isbn:${book.primary_isbn13}`).subscribe({
            next: googleBookResp => {
              // console.log('google nyt book: ', googleBookResp.items[0])
              let googleBook = googleBookResp.items[0];
              if(googleBook){
                googleBook.source = 'google';
              }else{
                console.log('no google version of this book was found')
              }
              googleBestsellers.push(googleBook);
              book.googleBooksVersion = googleBook;
            },
            error: error => console.log('error getting google nyt ebook: ', error)
          }));
        });
      },
      error: error => console.log('error retrieving ny times e-books bestseller list: ', error)
    }));
  }

  public listenForSearchChanges(): void{
    const bookSearchControl = this.book_form.get('book_search') as FormControl;
    this.subscriptions.push(bookSearchControl.valueChanges.pipe(
      debounceTime(150),
      tap(val => {
        if(!val) this.bookList = [];
        this.changeDetector.detectChanges();
      }),
      filter(term => term.length >= 3),
      distinctUntilChanged(),
      switchMap(res => this.bookService.bookSearch(res, environment.books.bookSearchApi))
    ).subscribe(val => {
      this.bookList = val;
      console.log('booklist: ', this.bookList)
      this.changeDetector.detectChanges();
    }));  
  }

  // public bookUrls(book: any):string{
  //   /** GOOGLE BOOK URLS */
  //   // return `url(${book.volumeInfo?.imageLinks?.smallThumbnail}), url('/assets/images/generic_cover.png')`;
  //   /** OPEN LIBRARY  */
  //       // return `url(${book.volumeInfo?.imageLinks?.smallThumbnail}), url('/assets/images/generic_cover.png')`;
  //   return '';
  // }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  public searchKeystroke(event: any){
    console.log(`event: ${event}`)
  }




}
