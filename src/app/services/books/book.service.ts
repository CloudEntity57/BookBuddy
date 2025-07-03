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
        map(res => res?.items?.map(a => {
          a.source = "google"; return a;
        }))
      ) as Observable<Array<GoogleBookInfo>>;
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

  public getAPIBookById(id: string, api_type: string): Observable<GoogleBookInfo | OpenLibraryWorkInfo>{
    /** GOOGLE */
      if(api_type === "google") {
        return this.http.get<GoogleBookInfo>(`${id}`).pipe(
        map(a => {
          a.source = "google"; 
          console.log(`a: ${a}`)
          return a;
        })
      );
      }
    /** OPEN LIBRARY */
      if(api_type === "openLibrary"){
        const headers = new HttpHeaders({'User-Agent':'bookbuddy/1.0 by josh foster, 713-822-8407, josh@allenb.com'})
        return this.http.get<OpenLibraryWorkInfo>(`${environment.books.openLibraryWorksApi}${id}.json`,{ headers }).pipe(
          map(a => {
            a.source = "openLibrary"; 
            console.log(`a: ${a}`)
            return a;
          }))
      }
      return of();
  }

  public getBookByAuthorAndTitle(author: string, title: string) : Observable<any>{
    return this.http.get(`${environment.apiUrl}/Book/${author}/${title}`) as Observable<any>;
  }

  public getAuthor(author_key: string): Observable<OpenLibraryAuthorInfo>{
    return this.http.get(`${environment.books.openLibraryWorksApi}${author_key}.json`) as Observable<OpenLibraryAuthorInfo>;
  }

}
