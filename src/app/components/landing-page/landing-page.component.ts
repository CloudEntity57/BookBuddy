import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, Subscription, switchMap, tap } from 'rxjs';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { HttpClient } from '@angular/common/http';
import { BookService } from '../../services/books/book.service';
import { GoogleBookInfo, GoogleBookSearchResults, OpenLibraryWorkInfo, OpenLibraryBookSearchInfo } from '../../interfaces/book.interface';
import { Router } from '@angular/router';
import { BaseBook } from '../base-book';
import { BookDropdownOptionComponent } from "../../shared/components/book-dropdown-option/book-dropdown-option.component";
import { environment } from '../../../environments/environment';


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



  ngOnInit(): void {
    this.book_form = this.fb.group({
      book_search: ['']
    })
    this.listenForSearchChanges();
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
