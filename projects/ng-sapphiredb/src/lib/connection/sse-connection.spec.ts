import { SseConnection } from './sse-connection';

describe('SseConnection', () => {
  it('should create an instance', () => {
    expect(new SseConnection(null, null)).toBeTruthy();
  });
});
