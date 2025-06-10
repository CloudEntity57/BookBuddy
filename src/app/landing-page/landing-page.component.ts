import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { HttpClient } from '@angular/common/http';
import { BookService } from '../services/books/book.service';


@Component({
  selector: 'app-landing-page',
  imports: [ CommonModule, ReactiveFormsModule, MatSelectModule, MatInputModule, MatAutocompleteModule ],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})
export class LandingPageComponent implements OnInit, AfterViewInit, OnDestroy{
  constructor(private bookService: BookService, private changeDetector: ChangeDetectorRef ){

  }

  http = inject(HttpClient);

  fb = inject(FormBuilder);

  private subscriptions: Array<Subscription> = [];

  public book_form!: FormGroup;

  public bookList: any = [];


  ngOnInit(): void {
    this.book_form = this.fb.group({
      book_search: ['']
    })
    const bookSearchControl = this.book_form.get('book_search') as FormControl;
        this.subscriptions.push(bookSearchControl.valueChanges.subscribe(val => {
          // console.log(`val: ${val}`)
          if(val.length > 3){
            this.subscriptions.push(this.bookService.bookSearch(val).subscribe(res => {
              // console.log(`http res: ${res}`)
              this.bookList = res;
              this.changeDetector.detectChanges();
            }
            ))
          }

        }));
  }

  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  public searchKeystroke(event: any){
    console.log(`event: ${event}`)
  }

}
