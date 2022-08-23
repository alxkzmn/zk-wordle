import app from '../../src/app';

describe('\'salt\' service', () => {
  it('registered the service', () => {
    const service = app.service('salt');
    expect(service).toBeTruthy();
  });
});
