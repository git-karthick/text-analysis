import { TestBed } from '@angular/core/testing';

import { FlorenceService } from './florence.service';

describe('FlorenceService', () => {
  let service: FlorenceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FlorenceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
