import { User } from '../entity/user';
import { decodeToken } from '../common/token';
import { UserRepository } from '../users/user.repository';
import { ForbiddenRequestError, UnauthorizedRequestError } from './errors.middleware';

const userRepository = new UserRepository();

// TODO: remove any
//  move interface to separated file
export interface AuthorizedRequestInterface extends Record<string, any> {
  user?: User,
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
    if (typeof userData.id !== 'number') {
      throw new UnauthorizedRequestError('Provided bearer token is broken');
    } else {
      const user = await userRepository.findById(userData.id);
      if (!user) {
        throw new ForbiddenRequestError('User not found');
      }
      req.user = user;
      next();
    }
  } catch (err) {
    next(err);
  }
}
