import { Component, inject, Input, OnChanges, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ProgressBarService } from '../../services/progress-bar.service';
import { BookService } from '../../services/books/book.service';

@Component({
  selector: 'app-book-stars-edit',
  imports: [MatIconModule],
  templateUrl: './book-stars-edit.component.html',
  styleUrl: './book-stars-edit.component.scss'
})
export class BookStarsEditComponent implements OnChanges {
  @Input() bookId: string = '';
  @Input() userId: string = '';
  @Input() savedRating: number = 0; // This will hold the user's saved rating
  public starsFilled: number = 0; // This will hold the current number of filled stars
  public currentlyEditing: boolean = false;
  public userRating: number = 0; // This will hold the user's saved rating
  private progressBarService = inject(ProgressBarService); 
  private bookService = inject(BookService); 
  public ngOnChanges(): void {
    // Initialize starsFilled with the saved rating when the component initializes
    console.log('saved rating in book-stars-edit component: ', this.savedRating);
    this.starsFilled = this.savedRating;
    this.userRating = this.savedRating;
  }
  public onMouseOver(starIndex: number): void {
    this.starsFilled = starIndex;
    this.currentlyEditing = true;
    console.log(`Mouse over star ${starIndex}, stars filled: ${this.starsFilled}`);  
  }
  public onMouseOut(): void {
    this.starsFilled = this.currentlyEditing ? this.userRating : this.starsFilled;
  }
  public saveRating(starIndex: number): void {
    this.progressBarService.startProgressBar();
    this.currentlyEditing = false;
    this.starsFilled = starIndex;
    this.userRating = starIndex;
    this.bookService.saveBookRating(this.userId, this.bookId, starIndex).subscribe({
      next: (response) => {
        console.log(`Saved rating: ${starIndex} stars`);
        this.progressBarService.stopProgressBar();
      }
    });
  }

}
