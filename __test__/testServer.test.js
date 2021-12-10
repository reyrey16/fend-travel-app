import 'regenerator-runtime/runtime'
const request = require('supertest');
const app = require('../src/server/server');

describe('POST /get-picture', () => {
  it('should return JSON', async () => {
    const res = await request(app)
      .post('/get-picture')
      .send({location: 'hollywood'});
      expect(res.statusCode).toEqual(200);
  });
});