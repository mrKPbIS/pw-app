import { Router } from 'express';
import { checkSchema } from 'express-validator';
import { plainToClass } from 'class-transformer';
import { authorizationMiddleware, AuthorizedRequestInterface } from '../middleware/authorization.middleware';
import { GetUsersResponse } from './dto/getUsersResponse.dto';
import { UserRepository } from './user.repository';
import { GetUsersProfileResponse } from './dto/getUsersProfileResponse.dto';

const userRouter = Router();
const userRepository = new UserRepository();

userRouter.use(authorizationMiddleware);

userRouter.get('/', checkSchema({
  limit: {
    isNumeric: true,
    customSanitizer: {
      options: value => typeof value === 'string' && !Number.isNaN(Number(value))? Number(value): 0,
    },
  },
  offset: {
    customSanitizer: {
      options: value => typeof value === 'string' && !Number.isNaN(Number(value))? Number(value): 0,
    },
  },
  name: {
    default: {
      options: '',
    },
    isString: true,
  }
}, ['query']), async (req, res, next) => {

  try {
    const { limit, offset, name } = req.query;
    const [users, count] = await userRepository.findUsers({ limit, offset, name });
    return res.send({
      success: true,
      data: {
        users: users.map(user => plainToClass(GetUsersResponse, user, { excludeExtraneousValues: true })),
        count,
      },
    });
  } catch (err) {
    next(err);
  }
});

userRouter.get('/profile', async (req: AuthorizedRequestInterface, res) => {
  const user = req.user;
  return res.send({
    success: true,
    data: plainToClass(GetUsersProfileResponse, user, { excludeExtraneousValues: true }),
  });
});

export default userRouter;
