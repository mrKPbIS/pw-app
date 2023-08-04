import { User } from '../entity/user';
import { decodeToken } from '../common/token';
import { UserRepository } from '../users/user.repository';

const userRepository = new UserRepository();

// TODO: remove any
//  move interface to separated file
export interface AuthorizedRequestInterface extends Record<string, any> {
  user?: User,
}

export async function authorizationMiddleware(req, res, next) {
  const bearerHeaders = req.headers['authorization'];
  if (typeof bearerHeaders === undefined) {
    res.sendStatus(401);
  }
  const bearer = bearerHeaders.split(' ');
  const bearerToken = bearer[1];
  const userData = decodeToken(bearerToken);
  if (typeof userData.id !== 'number') {
    res.sendStatus(401);
  } else {
    req.user = await userRepository.findById(userData.id);
    next();
  }
}
