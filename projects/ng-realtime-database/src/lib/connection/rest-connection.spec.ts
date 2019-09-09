import { RestConnection } from './rest-connection';

describe('RestConnection', () => {
  it('should create an instance', () => {
    expect(new RestConnection(null, null)).toBeTruthy();
  });
});
