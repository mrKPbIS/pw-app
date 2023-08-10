import { Router } from 'express';
import { checkSchema } from 'express-validator';
import { authorizationMiddleware, AuthorizedRequestInterface } from '../middleware/authorization.middleware';
import { UserRepository } from './user.repository';

const userRouter = Router();
const userRepository = new UserRepository();

userRouter.use(authorizationMiddleware);

// TODO: reduce fields in response
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
        users,
        count,
      },
    });
  } catch (err) {
    next(err);
  }
});

// TODO: reduce fields in response
userRouter.get('/profile', async (req: AuthorizedRequestInterface, res) => {
  const user = req.user;
  return res.send({
    success: true,
    data: user,
  });
});

export default userRouter;
