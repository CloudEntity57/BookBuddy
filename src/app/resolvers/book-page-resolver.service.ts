import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { BookService } from '../services/books/book.service';
import { GoogleBookInfo, GoogleBookSearchResults, OpenLibraryBookSearchInfo, OpenLibraryWorkInfo } from '../interfaces/book.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BookPageResolver implements Resolve<OpenLibraryWorkInfo | GoogleBookInfo> {

  constructor(private bookService: BookService) { }

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<OpenLibraryWorkInfo | GoogleBookInfo>{
    const bookId = route.queryParams['id'];
    console.log('BOOK ID = ',bookId)
    return this.bookService.getAPIBookById(bookId!, environment.books.bookByIdApi);
  }
}
