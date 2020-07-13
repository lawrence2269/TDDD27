import { TestBed } from '@angular/core/testing';

import { VerifyOTPService } from './verify-otp.service';

describe('VerifyOTPService', () => {
  let service: VerifyOTPService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VerifyOTPService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
