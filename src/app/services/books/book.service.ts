import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable, of } from 'rxjs';
import { GoogleBookInfo, GoogleBookSearchResults, OpenLibraryAuthorInfo, OpenLibraryBookResults, OpenLibraryBookSearchInfo, OpenLibraryWorkInfo } from '../../interfaces/book.interface';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root',
})
export class BookService {

  constructor(private http: HttpClient) { }

  // public api_type = "openLibrary";


  public bookSearch(val: string, api_type: string) : Observable<Array<GoogleBookInfo | OpenLibraryBookSearchInfo>> {


    /* For Google Books API: **/
    if(api_type === "google"){
      return this.http.get<GoogleBookSearchResults>(`${environment.books.googleBookSearchApi}intitle:${val}`).pipe(
        map(res => res?.items?.map(a => {a.source = "google"; return a;}))
      ) as Observable<Array<GoogleBookInfo | OpenLibraryBookSearchInfo>>;
    }
  

    /* For Open Library API: **/
    if(api_type === "openLibrary"){
      const headers = new HttpHeaders({'user-agent':'bookbuddy/1.0 by josh foster, 713-822-8407, josh@allenb.com'})
      return this.http.get<OpenLibraryBookResults>(`${environment.books.openLibraryBookSearchApi}${val}`,{ headers }).pipe(
        map(res => res.docs.map(a => {a.source="openLibrary"; return a;}).slice(0,15))
      ) as Observable<Array<OpenLibraryBookSearchInfo>>;
    }

    return of([]);

  }

  public getBookById(id: string, api_type: string): Observable<GoogleBookInfo | OpenLibraryWorkInfo>{
    /** GOOGLE */
      if(api_type === "google") {
        return this.http.get(`${id}`) as Observable<GoogleBookInfo>;
      }
    /** OPEN LIBRARY */
      if(api_type === "openLibrary"){
        const headers = new HttpHeaders({'User-Agent':'bookbuddy/1.0 by josh foster, 713-822-8407, josh@allenb.com'})
        return this.http.get(`${environment.books.openLibraryWorksApi}${id}.json`,{ headers }) as Observable<OpenLibraryWorkInfo>;
      }
      return of();
  }

  public getAuthor(author_key: string): Observable<OpenLibraryAuthorInfo>{
    return this.http.get(`${environment.books.openLibraryWorksApi}${author_key}.json`) as Observable<OpenLibraryAuthorInfo>;
  }

}
