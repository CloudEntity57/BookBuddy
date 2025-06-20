import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookDropdownOptionComponent } from './book-dropdown-option.component';

describe('BookDropdownOptionComponent', () => {
  let component: BookDropdownOptionComponent;
  let fixture: ComponentFixture<BookDropdownOptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookDropdownOptionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookDropdownOptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
