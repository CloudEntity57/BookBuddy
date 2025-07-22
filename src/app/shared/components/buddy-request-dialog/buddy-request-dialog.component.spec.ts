import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuddyRequestDialogComponent } from './buddy-request-dialog.component';

describe('BuddyRequestDialogComponent', () => {
  let component: BuddyRequestDialogComponent;
  let fixture: ComponentFixture<BuddyRequestDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuddyRequestDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuddyRequestDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
