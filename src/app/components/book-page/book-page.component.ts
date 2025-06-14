import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GoogleBookInfo, GoogleBookResults } from '../../interfaces/book.interface';
import { BaseBook } from '../base-book';

@Component({
  selector: 'app-book-page',
  imports: [],
  templateUrl: './book-page.component.html',
  styleUrl: './book-page.component.scss'
})
export class BookPageComponent extends BaseBook<GoogleBookInfo> implements OnInit{
  constructor(private route: ActivatedRoute, router: Router){
    super(router);
  }

  ngOnInit(): void {
    this.book = this.route.snapshot.data['book'];
    console.log('BOOK: ',this.book)
  }

}
