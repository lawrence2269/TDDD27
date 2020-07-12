import { TestBed } from '@angular/core/testing';

import { BsNavbarService } from './bs-navbar.service';

describe('BsNavbarService', () => {
  let service: BsNavbarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BsNavbarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
