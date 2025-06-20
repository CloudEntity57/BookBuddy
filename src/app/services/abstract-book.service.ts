import { HttpClient, HttpHeaders } from "@angular/common/http";
import { map, Observable, take, pipe } from "rxjs";
import { environment } from "../../environments/environment";
import { GoogleBookInfo, GoogleBookSearchResults, OpenLibraryAuthorInfo, OpenLibraryBookResults, OpenLibraryBookSearchInfo, OpenLibraryWorkInfo } from "../interfaces/book.interface";

// export abstract class BookService{

//   constructor(private http: HttpClient) { }

//   // public api_type = "openLibrary";


//   public bookSearch(val: string, api_type: string) : Observable<Array<GoogleBookInfo | OpenLibraryBookSearchInfo>> {

//     if(api_type === "google"){
//     // return this.http.get<S>(`${environment.books.bookSearchApi}intitle:${val}`).pipe(
//     //   mergeMap(titles => {
//     //     return this.http.get<S>(`${environment.books.bookSearchApi}inauthor:${val}`).pipe(
//     //       map(authors => {
//     //         return titles.items?.concat(authors?.items)
//     //       })
//     //     )
//     //   }
//     // )) as Observable<Array<T>>;

//     /* For Google Books API: **/

//       return this.http.get<GoogleBookSearchResults>(`${environment.books.googleBookSearchApi}intitle:${val}`).pipe(
//         map(res => res.items)
//       ) as Observable<Array<GoogleBookInfo | OpenLibraryBookSearchInfo>>;
//     }
  

//     /* For Open Library API: **/
//     const headers = new HttpHeaders({'user-agent':'bookbuddy/1.0 by josh foster, 713-822-8407, josh@allenb.com'})
//     return this.http.get<OpenLibraryBookResults>(`${environment.books.openLibraryBookSearchApi}${val}`,{ headers }).pipe(
//       map(res => res.docs.map(a => {a.source="openLibrary"; return a;}).slice(0,15))
//     ) as Observable<Array<OpenLibraryBookSearchInfo>>;


//   }

//   public getBookById(id: string, api_type: string): Observable<GoogleBookInfo | OpenLibraryWorkInfo>{
//     /** GOOGLE */
//      if(api_type === "google") return this.http.get(`${environment.books.googleBookFetchApi}${id}`) as Observable<GoogleBookInfo | OpenLibraryWorkInfo>;
//     /** OPEN LIBRARY */
//         const headers = new HttpHeaders({'User-Agent':'bookbuddy/1.0 by josh foster, 713-822-8407, josh@allenb.com'})

//     return this.http.get(`${environment.books.openLibraryWorksApi}${id}.json`,{ headers }) as Observable<GoogleBookInfo | OpenLibraryWorkInfo>;

//   }

//   public getAuthor(author_key: string): Observable<OpenLibraryAuthorInfo>{
//     return this.http.get(`${environment.books.openLibraryWorksApi}${author_key}.json`) as Observable<OpenLibraryAuthorInfo>;
//   }

// for Open Library API:
  
// }
