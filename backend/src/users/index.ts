import { Repository } from 'typeorm';
import { User } from '../entity/user';
import { UserService } from './user.repository';
import initAuthRouter from './auth.router';
import initUserRouter from './user.router';

export function userModule(userRepository: Repository<User>) {
  const userSerivce = UserService.getInstance(userRepository);
  const authRouter = initAuthRouter(userSerivce);
  const userRouter = initUserRouter(userSerivce);

  return {
    authRouter,
    userRouter,
  } ;
}

