import { TestBed } from '@angular/core/testing';

import { MovieRequestService } from './movie-request.service';

describe('MovieRequestService', () => {
  let service: MovieRequestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MovieRequestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
