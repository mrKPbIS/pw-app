import jwt from 'jsonwebtoken';
import config from '../config';

const secret = config.JWT_SECRET;

export interface TokenUserData {
  id: number,
  email: string,
}

export function createToken(userData: TokenUserData): string {
  return jwt.sign(userData, secret);
}

export function decodeToken(token: string): TokenUserData | null {
  try {
    const { id, email } = jwt.verify(token, secret);
    return { id, email };
  } catch (err) {
    return null;
  }
}
