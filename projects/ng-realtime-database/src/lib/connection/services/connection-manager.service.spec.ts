import { TestBed } from '@angular/core/testing';

import { ConnectionManagerService } from './connection-manager.service';

describe('ConnectionManagerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ConnectionManagerService = TestBed.get(ConnectionManagerService);
    expect(service).toBeTruthy();
  });
});
