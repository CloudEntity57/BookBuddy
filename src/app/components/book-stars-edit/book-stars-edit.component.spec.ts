import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookStarsEditComponent } from './book-stars-edit.component';

describe('BookStarsEditComponent', () => {
  let component: BookStarsEditComponent;
  let fixture: ComponentFixture<BookStarsEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookStarsEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookStarsEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
