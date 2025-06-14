import { Router } from "@angular/router"
import { GoogleBookInfo } from "../interfaces/book.interface";
import { ChangeDetectorRef } from "@angular/core";

export abstract class BaseBook<T extends GoogleBookInfo>{
    constructor(private router: Router){

    }
    public bookList: Array<GoogleBookInfo> = [];
    public book!: T;
    public author?: Array<string> = this.book?.volumeInfo.authors;
    public title?: string = this.book?.volumeInfo.title;
    public get smallImageLink(){ return this.book.volumeInfo.imageLinks.small};
    public get mediumImageLink(){ return this.book.volumeInfo.imageLinks.medium};
    public get smallThumbnail(){ return this.book.volumeInfo.imageLinks.smallThumbnail };
    public get thumbnail() { return this.book.volumeInfo.imageLinks.thumbnail }

    public goToBookPage(book: T){
        this.defineBookVariables(book);
        this.router.navigate(['/book'],{
            queryParams:{
                id: book.id
            }
        });
    } 

    public defineBookVariables(book: T){
        this.author = book.volumeInfo.authors;
        this.title = book.volumeInfo.title;
    }

}
