import { Component, OnInit, Input, inject, OnDestroy, EventEmitter, Output, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { BookService } from '../../services/books/book.service';
import { Observable, Subscription } from 'rxjs';
import { ProgressBarService } from '../../services/progress-bar.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-review-form',
  imports: [ 
    MatButtonModule,
    MatInputModule,
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatIconModule,
    CommonModule
  ],
  templateUrl: './review-form.component.html',
  styleUrl: './review-form.component.scss'
})
export class ReviewFormComponent implements OnInit, OnChanges, OnDestroy {
  @Input() userId: string = '';
  @Input() bookId: string = '';
  @Input() apiId: string = '';
  @Input() type: string = 'create'; // default to 'create', can be set to 'edit' for editing an existing review
  @Input() existingReview: string = '';
  @Output() reviewSubmitted: EventEmitter<boolean> = new EventEmitter<boolean>();
  public subscriptions: Array<Subscription> = [];
  public reviewForm!: FormGroup;
  public formBuilder = inject(FormBuilder);
  public bookService = inject(BookService);
  public progressBarService = inject(ProgressBarService);
  public ngOnInit(): void {
    this.reviewForm = this.formBuilder.group({
      review: [this.type === 'edit' ? this.existingReview : '', [  Validators.required, Validators.maxLength(10000)]],
    });
    if(this.existingReview.length > 0){
      console.log('existing review found: ', this.existingReview)
      this.reviewForm.controls['review'].setValue(this.existingReview);
    }
  }
  public ngOnChanges(): void {
    if(this.existingReview.length > 0){
      console.log('existing review found: ', this.existingReview)
      this.reviewForm.controls['review'].setValue(this.existingReview);
    }
  }
  public ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  public submitReview() {
    if (this.reviewForm.valid) {
      this.progressBarService.startProgressBar();
      const review = this.reviewForm.value.review;
      const addReviewRequest = {
        userId: this.userId,
        bookId: this.bookId,
        apiId: this.apiId,
        review: review
      };
      this.subscriptions.push(this.bookService.submitBookReview(addReviewRequest).subscribe({
        next: () => {
          this.progressBarService.stopProgressBar();
          this.reviewSubmitted.emit(true);
          console.log('Review submitted:', review);
        }
      }));
    } else {
      console.log('Review form is invalid');
    }
  }
  public cancel(){
    this.reviewSubmitted.emit(false);
  }
}
