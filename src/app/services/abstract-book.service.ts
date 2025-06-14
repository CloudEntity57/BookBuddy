import { HttpClient } from "@angular/common/http";
import { map, Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { GoogleBookResults } from "../interfaces/book.interface";

export abstract class AbstractBookService<T , S extends GoogleBookResults> {

  constructor(private http: HttpClient) { }

  
  public bookSearch(val: string) : Observable<Array<T>> {
    return this.http.get<S>(`${environment.books.bookSearchApi}${val}`).pipe(map(res => res?.items)) as Observable<Array<T>>
  }

  public getBookById(id: string): Observable<T>{
    return this.http.get(`${environment.books.bookFetchApi}${id}`) as Observable<T>;
  }
  
}
