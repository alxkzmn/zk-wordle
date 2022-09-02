import app from '../../src/app';

describe('\'commitment\' service', () => {
  it('registered the service', () => {
    const service = app.service('commitment');
    expect(service).toBeTruthy();
  });
});
