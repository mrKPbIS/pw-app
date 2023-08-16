// import { describe, it } from 'node:test';
import request from 'supertest';
import app from './app';

describe('App', () => {

  it('should return pong', () => {
    return request(app)
      .get('/ping')
      .expect(200)
      .then((response) => {
        expect(response.text).toBe('pong');
      });
  });
});
