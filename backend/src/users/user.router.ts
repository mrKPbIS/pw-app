import { Router } from 'express';
import { checkSchema } from 'express-validator';
import { plainToClass } from 'class-transformer';
import { authorizationMiddleware, AuthorizedRequestInterface } from '../middleware/authorization.middleware';
import { GetUsersResponse } from './dto/getUsersResponse.dto';
import { UserRepository } from './user.repository';
import { GetUsersProfileResponse } from './dto/getUsersProfileResponse.dto';
import { NotFoundError } from '../middleware/errors.middleware';

const userRouter = Router();
const userRepository = UserRepository.getInstance();

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
  const user = await userRepository.findById(req.user.id);
  return res.send({
    success: true,
    data: plainToClass(GetUsersProfileResponse, user, { excludeExtraneousValues: true }),
  });
});

userRouter.get('/:id', checkSchema({
  id: {
    isNumeric: true,
    toInt: true,
    errorMessage: 'should be Int',
  }
}, ['params']), async (req: AuthorizedRequestInterface, res, next) => {
  const { id } = req.params;
  try {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    } else {
      res.send({
        success: true,
        data: plainToClass(GetUsersProfileResponse, user, { excludeExtraneousValues: true }),
      });
    }
  } catch (err) {
    next(err);
  }
});

export default userRouter;
