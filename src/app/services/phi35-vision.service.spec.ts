import { TestBed } from '@angular/core/testing';

import { Phi35VisionService } from './phi35-vision.service';

describe('Phi35VisionService', () => {
  let service: Phi35VisionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Phi35VisionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
