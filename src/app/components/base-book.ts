import { Router } from "@angular/router"
import { GoogleBookInfo, GoogleBookSearchResults, OpenLibraryWorkInfo, OpenLibraryBookSearchInfo } from "../interfaces/book.interface";
import { ChangeDetectorRef } from "@angular/core";
import { environment } from "../../environments/environment";
import { FormGroup } from "@angular/forms";

export abstract class BaseBook{
    constructor(private router: Router){

    }

    /** Multiple API type configuration */

    public bookList: Array<OpenLibraryBookSearchInfo | GoogleBookInfo> = [];
    public book!: GoogleBookInfo;
    public work!: OpenLibraryWorkInfo;


    public goToBookPage(book: OpenLibraryBookSearchInfo | GoogleBookInfo){
        try{
            this.router.navigate(['/book'],{
                queryParams:{
                    id: book.source === 'google' ? book.selfLink : book.key
                }
            });        
        }catch (err){
            console.log('ERROR NAVIGATING - ', err)
        }

    } 

    public bookPhotoUrl(book: OpenLibraryBookSearchInfo | GoogleBookInfo){

        /** OPEN LIBRARY  */
            // return `url(${book.volumeInfo?.imageLinks?.smallThumbnail}), url('/assets/images/generic_cover.png')`;
            let urlBase;
            let bookPhotoUrl;
        if(book.source === 'openLibrary'){
            urlBase = book.cover_i;
            if(!urlBase) return "url('assets/images/generic_cover.png')";
            bookPhotoUrl = `url(${environment.books.openLibraryCoverApi+urlBase}-S.jpg)`;
        }
        if(book.source === 'google'){
            urlBase = book.volumeInfo?.imageLinks?.smallThumbnail;
            if(!urlBase) return "url('assets/images/generic_cover.png')";
            bookPhotoUrl = `url(${urlBase})`;
        }

        // console.log('photo url: ', bookPhotoUrl);
        return bookPhotoUrl;
    }



}
