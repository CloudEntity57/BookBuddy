import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { BookType, CreateBookDto, DatabaseBook, GoogleBookInfo, GoogleBookSearchResults, NYTimesListResponse, OpenLibraryAuthorInfo, OpenLibraryBookResults, OpenLibraryBookSearchInfo, OpenLibraryWorkInfo, UserBookDto } from '../../interfaces/book.interface';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root',
})
export class BookService {

  constructor(private http: HttpClient) { }

  // public api_type = "openLibrary";


  public bookSearch(val: string, api_type: string, search_type: string = 'title') : Observable<Array<GoogleBookInfo | OpenLibraryBookSearchInfo>> {

    let googleSearchString: string = '';
    if(search_type === 'title' || 'author') googleSearchString = `${environment.books.googleBookSearchApi}in${search_type}:${val}`;
    if(search_type === 'both') googleSearchString = `${environment.books.googleBookSearchApi}inauthor:${val}`;
    /* For Google Books API: **/
    if(api_type === "google"){
      return this.http.get<GoogleBookSearchResults>(googleSearchString).pipe(
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
        return this.http.get<GoogleBookInfo>(`${environment.books.googleBookFetchApi}${id}`).pipe(
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

  public createBookInDatabase(book: CreateBookDto): Observable<any>{
    return this.http.post(`${environment.apiUrl}/Book`, book).pipe(catchError(err => {
      console.log('error creating new book: ', err.status, '-', err.error);
      return throwError(() => new Error('Something went wrong creating a new book instance. Please try again.'));
    })) as Observable<any>;
  }

  public updateBookWantToRead(userId: string, book: DatabaseBook, apiBookId: string, note: string = '' ): Observable<any>{
    const userBookDto: UserBookDto = {
      bookId: book.id,
      userId,
      apiBookId,
      bookType: BookType.wantToRead,
      note
    }
    return this.http.put(`${environment.apiUrl}/Book/read_status`,userBookDto).pipe(catchError(err => {
      console.log('error saving new book preference: ', err.status, '-', err.error);
      return throwError(() => new Error('Something went wrong adding book to your want to read list. Please try again.'));
    }))
  }

  public updateBookHaveRead(userId: string, book: DatabaseBook, apiBookId: string, note: string = '' ): Observable<any>{
    const userBookDto: UserBookDto = {
      bookId: book.id,
      userId: userId,
      apiBookId: apiBookId,
      bookType: BookType.read,
      note
    }
    return this.http.put(`${environment.apiUrl}/Book/read_status`,userBookDto).pipe(catchError(err => {
      console.log('error saving new book preference: ', err.status, '-', err.error);
      return throwError(() => new Error('Something went wrong adding book to list of books you have read. Please try again.'));
    }))
  }


  public deleteBookWantToRead(userId: string, bookId?: string): Observable<DatabaseBook>{
    return this.http.delete(`${environment.apiUrl}/Book/want_to_read/${userId}/${bookId}`) as Observable<DatabaseBook>
  }

  public deleteBookHasRead(userId: string, bookId?: string): Observable<DatabaseBook>{
    return this.http.delete(`${environment.apiUrl}/Book/has_read/${userId}/${bookId}`) as Observable<DatabaseBook>
  }

  public getAuthor(author_key: string): Observable<OpenLibraryAuthorInfo>{
    return this.http.get(`${environment.books.openLibraryWorksApi}${author_key}.json`) as Observable<OpenLibraryAuthorInfo>;
  }

  public getNyTimesBestsellerList(): Observable<NYTimesListResponse>{
    return this.http.get(`${environment.books.nytBooksApi}/current/hardcover-fiction.json?api-key=${environment.books.nytBooksApiToken}`) as Observable<NYTimesListResponse>;
  }

  public getNyTimesEBooksNonFictionBestsellerList(): Observable<NYTimesListResponse>{
    return this.http.get(`${environment.books.nytBooksApi}/current/combined-print-and-e-book-nonfiction.json?api-key=${environment.books.nytBooksApiToken}`) as Observable<NYTimesListResponse>;
  }

}
