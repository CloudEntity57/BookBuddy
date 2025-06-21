import { ChangeDetectorRef, Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OpenLibraryBookResults, OpenLibraryBookSearchInfo } from '../../../interfaces/book.interface';
import { BaseBook } from '../../../components/base-book';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, Subscription, switchMap, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { BookService } from '../../../services/books/book.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-book-dropdown-option',
  imports: [CommonModule, ReactiveFormsModule, MatSelectModule, MatInputModule, MatAutocompleteModule ],
  templateUrl: './book-dropdown-option.component.html',
  styleUrl: './book-dropdown-option.component.scss'
})
export class BookDropdownOptionComponent extends BaseBook implements OnInit, OnDestroy{
  constructor(router: Router, private changeDetector: ChangeDetectorRef, private bookService: BookService){
    super(router);
  }
  @Input() dropdown_type: string = "navbar-search";
  @Input() dropdown_text: string = "What do you want to read?";

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


}

