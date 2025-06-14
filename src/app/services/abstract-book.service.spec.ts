import { TestBed } from '@angular/core/testing';

import { AbstractBookService } from './abstract-book.service';

describe('AbstractBookService', () => {
  let service: AbstractBookService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AbstractBookService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
