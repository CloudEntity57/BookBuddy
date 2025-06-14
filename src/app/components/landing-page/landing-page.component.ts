import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { HttpClient } from '@angular/common/http';
import { BookService } from '../../services/books/book.service';
import { GoogleBookInfo, GoogleBookResults } from '../../interfaces/book.interface';
import { Router } from '@angular/router';
import { BaseBook } from '../base-book';


@Component({
  selector: 'app-landing-page',
  imports: [ CommonModule, ReactiveFormsModule, MatSelectModule, MatInputModule, MatAutocompleteModule ],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})
export class LandingPageComponent extends BaseBook<GoogleBookInfo> implements OnInit, OnDestroy{
  constructor(private bookService: BookService, router: Router, private changeDetector: ChangeDetectorRef ){
    super(router)
  }

  http = inject(HttpClient);

  fb = inject(FormBuilder);

  private subscriptions: Array<Subscription> = [];

  public book_form!: FormGroup;



  ngOnInit(): void {
    this.book_form = this.fb.group({
      book_search: ['']
    })
    const bookSearchControl = this.book_form.get('book_search') as FormControl;
        this.subscriptions.push(bookSearchControl.valueChanges.subscribe(val => {
          if(val && val.length > 3){
            this.subscriptions.push(this.bookService.bookSearch(val).subscribe(res => {
              console.log('RES:',res)
              this.bookList = res;
              this.changeDetector.detectChanges();
            }
            ))
          }

        }));
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  public searchKeystroke(event: any){
    console.log(`event: ${event}`)
  }




}
