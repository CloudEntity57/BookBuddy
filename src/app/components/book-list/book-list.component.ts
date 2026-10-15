import { Component, inject, Input } from '@angular/core';
import { BookType, GoogleBookInfo } from '../../interfaces/book.interface';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';
import { BookStarsComponent } from '../book-stars/book-stars.component';
import { BookBuddyUser } from '../../interfaces/user.interface';

@Component({
  selector: 'app-book-list',
  imports: [ CommonModule, FontAwesomeModule, BookStarsComponent ],
  templateUrl: './book-list.component.html',
  styleUrl: './book-list.component.scss'
})
export class BookListComponent {
  [x: string]: any;
  @Input() books: Array<GoogleBookInfo> = [];
  @Input() emptyListMessage: string = 'No books found';
  @Input() userInfo: BookBuddyUser = {} as BookBuddyUser;
  public BookType = BookType;
  @Input() ReadStatus = BookType.wantToRead
  public router: Router = inject(Router);

  public goToBookPage(book:GoogleBookInfo){
    try{
        this.router.navigate(['/book'],{
            queryParams:{
                id: book.id
            }
        });        
    }catch (err){
        console.log('ERROR NAVIGATING - ', err)
    }
  }
  // public generateUserRating(book: GoogleBookInfo, userInfo: BookBuddyUser): number {
  //   console.log('generateUserRating called with book:', book, 'userInfo:', userInfo);
  //   if (!book || !userInfo) {
  //     console.log('generateUserRating called with invalid parameters. book:', book, 'userInfo:', userInfo);
  //     return 0; // Return 0 if book or userInfo is not provided
  //   }
  //   const userRating: BookRating | undefined = userInfo.bookRatings?.find(rating => rating.bookId === book.id);
  //   // console.log('generateUserRating called for book:', book.id, 'userRating found:', userRating);
  //   // return userRating ? userRating.rating : 0; // Return the rating if found, otherwise return 0
  // }
}
