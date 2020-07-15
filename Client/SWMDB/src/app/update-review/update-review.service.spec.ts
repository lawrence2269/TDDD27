import { TestBed } from '@angular/core/testing';

import { UpdateReviewService } from './update-review.service';

describe('UpdateReviewService', () => {
  let service: UpdateReviewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UpdateReviewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
