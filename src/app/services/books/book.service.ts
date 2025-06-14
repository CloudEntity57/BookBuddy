import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { GoogleBookInfo, GoogleBookResults } from '../../interfaces/book.interface';
import { AbstractBookService } from '../abstract-book.service';


@Injectable({
  providedIn: 'root',
})
export class BookService extends AbstractBookService<GoogleBookInfo, GoogleBookResults>{


  constructor(http: HttpClient) {
    super(http);
  }

  // public bookSearch(val: string) : Observable<GoogleBookInfo> {
  //   return this.http.get(`https://www.googleapis.com/books/v1/volumes?q=${val}`) as Observable<GoogleBookInfo>
  // }

  // public getBookById(id: string): Observable<GoogleBookInfo>{
  //   return this.http.get(`https://www.googleapis.com/books/v1/volumes/${id}`) as Observable<GoogleBookInfo>;
  // }

}
