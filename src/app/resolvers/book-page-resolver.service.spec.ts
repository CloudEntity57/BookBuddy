import { TestBed } from '@angular/core/testing';

import { BookPageResolverService } from './book-page-resolver.service';

describe('BookPageResolverService', () => {
  let service: BookPageResolverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BookPageResolverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
