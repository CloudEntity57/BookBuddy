import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { BookService } from '../services/books/book.service';
import { GoogleBookInfo } from '../interfaces/book.interface';

@Injectable({
  providedIn: 'root'
})
export class BookPageResolver implements Resolve<GoogleBookInfo> {

  constructor(private bookService: BookService) { }

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<GoogleBookInfo>{
    const bookId = route.queryParams['id'];
    return this.bookService.getBookById(bookId!);
  }
}
