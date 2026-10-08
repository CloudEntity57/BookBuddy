import { Component, inject, Input } from '@angular/core';
import { BookType, GoogleBookInfo } from '../../interfaces/book.interface';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-book-list',
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './book-list.component.html',
  styleUrl: './book-list.component.scss'
})
export class BookListComponent {
[x: string]: any;
  @Input() books: Array<GoogleBookInfo> = [];
  @Input() emptyListMessage: string = 'No books found';
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
}
