import * as token from './token';

describe('common/token', () => {
  beforeAll(() => {
    process.env['JWT_SECRET'] = 'secret';
  });

  const user: token.TokenUserData = {
    email: 'test@email.com',
    id: 1,
  };

  describe('createToken', () => {
    it('should create valid token', () => {
      const t = token.createToken(user);
      expect(token.decodeToken(t)).toMatchObject(user);
    });
  });

  describe('decodeToken', () => {
    it('should return empty object on error', () => {
      const t = 'nottoken';
      expect(token.decodeToken(t)).toMatchObject({});
    });
  });
});
