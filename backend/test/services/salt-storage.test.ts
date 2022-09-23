import app from '../../src/app';

describe('\'SaltStorage\' service', () => {
  it('registered the service', () => {
    const service = app.service('salt-storage');
    expect(service).toBeTruthy();
  });
});
