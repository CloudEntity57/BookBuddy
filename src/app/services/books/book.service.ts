import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, catchError, map, Observable, of, shareReplay, tap, throwError } from 'rxjs';
import { BookType, CreateBookDto, DatabaseBook, GoogleBookInfo, GoogleBookResponse, GoogleBookSearchResults, NyTimesBook, NYTimesListResponse, OpenLibraryAuthorInfo, OpenLibraryBookResults, OpenLibraryBookSearchInfo, OpenLibraryWorkInfo, UserBookDto } from '../../interfaces/book.interface';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root',
})
export class BookService {

  constructor(private http: HttpClient) { }

  // public api_type = "openLibrary";
  public googleBooksApiRequests = new BehaviorSubject(0);
  public nytBooksApiRequests = new BehaviorSubject(0);


  public bookSearch(val: string, api_type: string, search_type: string = 'title') : Observable<Array<GoogleBookInfo>> {
    val = encodeURIComponent(val);
    console.log(`bookSearch called with val: ${val}, api_type: ${api_type}, search_type: ${search_type}`);
    let googleSearchString: string = '';
    if(search_type === 'title' || 'author') googleSearchString = `${environment.books.googleBookSearchApi}in${search_type}:${val}&key=${environment.googleBooksAPIKey}`;
    if(search_type === 'both') googleSearchString = `${environment.books.googleBookSearchApi}${val}&key=${environment.googleBooksAPIKey}`;
    console.log(`googleSearchString: ${googleSearchString}`);
    return this.http.get<GoogleBookSearchResults>(googleSearchString).pipe(
      map(res => {
        console.log('google book search results: ', res);
        return res.items;
      }),
    ) as Observable<Array<GoogleBookInfo>>;
  }

  public getAPIBookById(id: string, api_type: string): Observable<GoogleBookInfo> {
    /** GOOGLE */
      if(api_type === "google") {
        return this.http.get<GoogleBookInfo>(`${environment.books.googleBookFetchApi}${id}?key=${environment.googleBooksAPIKey}`).pipe(
        map(a => {
          a.source = "google"; 
          console.log(`a: ${a}`)
          return a;
        })
      );
      }
    /** OPEN LIBRARY */
      // if(api_type === "openLibrary"){
      //   const headers = new HttpHeaders({'User-Agent':'bookbuddy/1.0 by josh foster, 713-822-8407, josh@allenb.com'})
      //   return this.http.get<OpenLibraryWorkInfo>(`${environment.books.openLibraryWorksApi}${id}.json`,{ headers }).pipe(
      //     map(a => {
      //       a.source = "openLibrary"; 
      //       console.log(`a: ${a}`)
      //       return a;
      //     }))
      // }
      return of();
  }

  public getBookByAuthorAndTitle(author: string, title: string) : Observable<any>{
    return this.http.get(`${environment.apiUrl}/Book/${author.toLowerCase()}/${title.toLowerCase()}`) as Observable<any>;
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

  public updateBookCurrentlyReading(userId: string, book: DatabaseBook, apiBookId: string, note: string = '' ): Observable<any>{
    const userBookDto: UserBookDto = {
      bookId: book.id,
      userId,
      apiBookId,
      bookType: BookType.reading,
      note
    }
    return this.http.put(`${environment.apiUrl}/Book/read_status`,userBookDto).pipe(catchError(err => {
      console.log('error saving new book preference: ', err.status, '-', err.error);
      return throwError(() => new Error('Something went wrong adding book to your currently reading list. Please try again.'));
    }))
  }

  public updateBookDidNotFinish(userId: string, book: DatabaseBook, apiBookId: string, note: string = '' ): Observable<any>{
    const userBookDto: UserBookDto = {
      bookId: book.id,
      userId,
      apiBookId,
      bookType: BookType.dnf,
      note
    }
    return this.http.put(`${environment.apiUrl}/Book/read_status`,userBookDto).pipe(catchError(err => {
      console.log('error saving new book preference: ', err.status, '-', err.error);
      return throwError(() => new Error('Something went wrong adding book to your did not finish list. Please try again.'));
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
  
  public deleteBookCurrentlyReading(userId: string, bookId?: string): Observable<DatabaseBook>{
    return this.http.delete(`${environment.apiUrl}/Book/currently_reading/${userId}/${bookId}`) as Observable<DatabaseBook>
  }

  public deleteBookDidNotFinish(userId: string, bookId?: string): Observable<DatabaseBook>{
    return this.http.delete(`${environment.apiUrl}/Book/did_not_finish/${userId}/${bookId}`) as Observable<DatabaseBook>
  }


  public getAuthor(author_key: string): Observable<OpenLibraryAuthorInfo>{
    return this.http.get(`${environment.books.openLibraryWorksApi}${author_key}.json`) as Observable<OpenLibraryAuthorInfo>;
  }

  public saveBookRating(userId: string, bookId: string, rating: number): Observable<any>{
    return this.http.put(`${environment.apiUrl}/Book/rating`, {userId, bookId, rating}).pipe(catchError(err => {
      console.log('error saving new book rating: ', err.status, '-', err.error);
      return throwError(() => new Error('Something went wrong saving your book rating. Please try again.'));
    }));
  }

  public getNyTimesBestsellerList(): Observable<NYTimesListResponse>{
    return this.http.get(`${environment.books.nytBooksApi}/current/hardcover-fiction.json?api-key=${environment.books.nytBooksApiToken}`).pipe(
    map(list => list as NYTimesListResponse),
    shareReplay(1),
    catchError(err => {console.log('error getting google nyt book: ', err); throw(err)})
  ) as Observable<NYTimesListResponse>;
  }

  public getNyTimesEBooksNonFictionBestsellerList(): Observable<NYTimesListResponse>{
    return this.http.get(`${environment.books.nytBooksApi}/current/combined-print-and-e-book-nonfiction.json?api-key=${environment.books.nytBooksApiToken}`).pipe(
      map(list => list as NYTimesListResponse),
      shareReplay(1)
    ) as Observable<NYTimesListResponse>;
  }

  public convertNytToGoogle(book: NyTimesBook): Observable<GoogleBookInfo>{
    console.log(`converting NY Times book to Google book: ${book.title} by ${book.author}`)
    // return this.http.get<GoogleBookResponse>(`https://www.googleapis.com/books/v1/volumes?q=isbn:${book.primary_isbn13}&key=${environment.googleBooksAPIKey}`).pipe(
    // had to drop the isbn: prefix because it wasn't returning results for any of the books on the NY Times bestseller list, even though they all have valid ISBNs.  Not sure why this is happening, but this works for now.
    // return this.http.get<GoogleBookResponse>(`https://www.googleapis.com/books/v1/volumes?q=${book.primary_isbn13}&key=${environment.googleBooksAPIKey}`).pipe(
    return this.bookSearch(book.author + " " + book.title, "google", "both").pipe(
      map(items => items.find(googleBook => 
        {
          console.log('checking if google book matches nyt book: ', googleBook.volumeInfo.authors[0].toLocaleLowerCase(), ' === ', book.author.toLocaleLowerCase(), ' && ', googleBook.volumeInfo.title.toLocaleLowerCase(), ' === ', book.title.toLocaleLowerCase())
          return book.author.toLocaleLowerCase().includes(googleBook.volumeInfo.authors[0].toLocaleLowerCase()) && googleBook.volumeInfo.title.toLocaleLowerCase() == book.title.toLocaleLowerCase()
        }) as GoogleBookInfo) || {} as GoogleBookInfo,
      shareReplay(1)
    )
  }

}
