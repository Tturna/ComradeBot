const request = require('supertest');
const webapp = require('../webapp.js');

describe('GET /', () => {
  // Disable warning because we're asserting with supertest
  // eslint-disable-next-line jest/expect-expect
  it('responds with privet', async () => {
    await request(webapp)
      .get('/')
      .expect(200)
      .expect('privet');
  });
});
