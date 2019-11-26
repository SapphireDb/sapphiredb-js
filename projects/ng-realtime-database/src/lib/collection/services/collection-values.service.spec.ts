import { TestBed } from '@angular/core/testing';

import { CollectionValuesService } from './collection-values.service';

describe('CollectionValuesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CollectionValuesService = TestBed.get(CollectionValuesService);
    expect(service).toBeTruthy();
  });
});
