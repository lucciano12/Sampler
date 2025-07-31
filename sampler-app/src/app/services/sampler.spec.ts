import { TestBed } from '@angular/core/testing';

import { Sampler } from './sampler';

describe('Sampler', () => {
  let service: Sampler;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Sampler);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
