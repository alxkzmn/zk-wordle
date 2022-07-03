import app from '../../src/app';

describe('\'clue\' service', () => {
  it('registered the service', () => {
    const service = app.service('clue');
    expect(service).toBeTruthy();
  });
});
