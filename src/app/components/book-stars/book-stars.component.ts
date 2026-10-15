import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-book-stars',
  imports: [ MatIconModule ],
  templateUrl: './book-stars.component.html',
  styleUrl: './book-stars.component.scss'
})
export class BookStarsComponent {
  @Input() savedRating?: number = 0; // This will hold the user's saved rating
  public starsFilled?: number = 0; // This will hold the current number of filled stars
  public ngOnChanges(): void {
    // Initialize starsFilled with the saved rating when the component initializes
    console.log('saved rating in book-stars-edit component: ', this.savedRating);
    this.starsFilled = this.savedRating;
  }
}
