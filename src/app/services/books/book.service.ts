import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class BookService {


  constructor(private http: HttpClient) { }

  public bookSearch(val: string) : Observable<Object> {
    return this.http.get(`https://www.googleapis.com/books/v1/volumes?q=${val}`)
  }

}
