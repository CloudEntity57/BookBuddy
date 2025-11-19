import { ChangeDetectorRef, Component, ElementRef, inject, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { GoogleBookInfo, OpenLibraryBookResults, OpenLibraryBookSearchInfo } from '../../../interfaces/book.interface';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { catchError, debounceTime, distinctUntilChanged, filter, map, Subscription, switchMap, take, takeWhile, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { BookService } from '../../../services/books/book.service';
import { CommonModule } from '@angular/common';
import { BaseBook } from '../base-book/base-book';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-book-dropdown-option',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatTooltipModule, MatSelectModule, MatInputModule, MatAutocompleteModule, MatButtonToggleModule, MatIconModule ],
  templateUrl: './book-dropdown-option.component.html',
  styleUrl: './book-dropdown-option.component.scss'
})
export class BookDropdownOptionComponent extends BaseBook implements OnInit, OnDestroy{
  constructor(router: Router, private changeDetector: ChangeDetectorRef, private bookService: BookService){
    super(router);
  }
  @Input() dropdown_type: string = "navbar-search";
  @Input() dropdown_text: string = "What do you want to read?";
  @ViewChild('bookBuddySearchInput', { static: true }) searchInputElement!: ElementRef;
  public searchOption: string | null = null;
  public displayChoicesModal: boolean = false;
  public searchChoice?: string;
  public formSubmitted: boolean = false;

  fb = inject(FormBuilder);

  private subscriptions: Array<Subscription> = [];

  public book_form!: FormGroup;

  ngOnInit(): void {
    this.book_form = this.fb.group({
      book_search: ['']
    })
    this.listenForSearchChanges();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  public setChoicesModal(cancel: boolean){
    if(cancel) {
      this.displayChoicesModal = false;
      this.changeDetector.detectChanges();
      return;
    }
    if(this.searchOption) return;
    this.displayChoicesModal = true;
  }

  public search(){
    this.changeDetector.detectChanges();
    const bookSearchControl = this.book_form.get('book_search') as FormControl;
    this.subscriptions.push(this.bookService.bookSearch(bookSearchControl.value, environment.books.bookSearchApi, this.searchChoice).pipe(
      catchError(error => {
        console.log('error: ', error);
        throw(error)}
      ),
      map(val => val?.filter(book => {
        const source = book.source;
        let output = false;
        switch(source){
          case "google":
            output = book.volumeInfo !== undefined
            && book.volumeInfo.authors !== undefined 
            && book.volumeInfo?.description !== undefined
            && book.volumeInfo?.imageLinks !== undefined;
            break;
          case "openLibrary":
            output = true;
            break;
          default:
            output = true;
        }
        return output;
      } ))
    )
    .subscribe(val => {
      this.bookList = val;
      console.log('booklist: ', this.bookList)
      this.formSubmitted = true;
      this.searchInputElement.nativeElement.focus();
      this.changeDetector.detectChanges();
    }));    
    this.subscriptions.push(bookSearchControl.valueChanges.pipe(take(1)).subscribe(val => {
      this.bookList = [];
      this.formSubmitted = false;
    }));
  }

  public handleSearchTypeSelection(){
    console.log('choice: ', this.searchChoice)
    switch(this.searchChoice){
      case 'author':
        this.dropdown_text = 'Type an Author';
        break;
      case 'title':
        this.dropdown_text = 'Type a Title';
        break;
      case 'both':
        this.dropdown_text = 'ex: "Author: Joyce, Title: Ulysses"';
        break;
      default:
        this.dropdown_text = 'Search Books, Authors';
        break;
    }
    setTimeout(()=> {
      this.displayChoicesModal = false;
      this.searchInputElement.nativeElement.focus();
      this.changeDetector.detectChanges();
    }, 700);
  }

  public listenForSearchChanges(): void{
    const bookSearchControl = this.book_form.get('book_search') as FormControl;
    this.subscriptions.push(bookSearchControl.valueChanges.pipe(
      takeWhile(()=> this.searchChoice == null),
      debounceTime(150),
      tap(val => {
        if(!val) this.bookList = [];
        this.changeDetector.detectChanges();
      }),
      filter(term => term?.length >= 3),
      distinctUntilChanged(),
      switchMap(res => this.bookService.bookSearch(res, environment.books.bookSearchApi))
    ).pipe(
      catchError(error => {
        console.log('error: ', error);
        throw(error)}
      ),
      map(val => val?.filter(book => {
        const source = book.source;
        let output = false;
        switch(source){
          case "google":
            output = book.volumeInfo !== undefined
            && book.volumeInfo.authors !== undefined 
            && book.volumeInfo?.description !== undefined
            && book.volumeInfo?.imageLinks !== undefined;
            break;
          case "openLibrary":
            output = true;
            break;
          default:
            output = true;
        }
        return output;
      } ))
    )
    .subscribe(val => {
      this.formSubmitted = true;
      this.bookList = val;
      console.log('booklist: ', this.bookList)
      this.changeDetector.detectChanges();
    }));  
  }

  public handleBookSelect(book_option: any){
    this.book_form.reset();
    this.formSubmitted = false;
    this.goToBookPage(book_option);
    this.changeDetector.detectChanges();
  }


}

