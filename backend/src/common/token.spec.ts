import jwt from 'jsonwebtoken';
import * as token from './token';

describe('common/token', () => {
  beforeAll(() => {
    process.env['JWT_SECRET'] = 'secret';
  });

  const user: token.TokenUserData = {
    email: 'test@email.com',
    id: 1,
  };

  it('should create valid token', () => {
    const t = token.createToken(user);
    expect(token.decodeToken(t)).toMatchObject(user);
  });

  it('should reject non-jwt value', () => {
    const t = 'nottoken';
    expect(token.decodeToken(t)).toBe(null);
  });

  it('should reject forged token', () => {
    const t = jwt.sign(user, 'notsecret');
    expect(token.decodeToken(t)).toBe(null);
  });
});
