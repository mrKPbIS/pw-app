import { decodeToken, TokenUserData } from '../common/token';
import { UnauthorizedRequestError } from './errors.middleware';

//  move interface to separated file
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface AuthorizedRequestInterface extends Record<string, any> {
  user?: TokenUserData,
}

export async function authorizationMiddleware(req, res, next) {
  try {
    const bearerHeaders = req.headers['authorization'];
    if (typeof bearerHeaders === 'undefined') {
      throw new UnauthorizedRequestError('Request should include authorization header');
    }
    const bearer = bearerHeaders.split(' ');
    const bearerToken = bearer[1];
    const userData = decodeToken(bearerToken);
    if (!userData) {
      throw new UnauthorizedRequestError('Provided bearer token is broken');
    } else {
      req.user = userData;
      next();
    }
  } catch (err) {
    next(err);
  }
}
