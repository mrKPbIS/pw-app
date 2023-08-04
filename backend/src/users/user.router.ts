import { Router } from 'express';
import { UserRepository } from './user.repository';
import { authorizationMiddleware, AuthorizedRequestInterface } from '../middleware/authorization.middleware';

const userRouter = Router();
const userRepository = new UserRepository();


userRouter.use(authorizationMiddleware);

// TODO: reduce fields in response
userRouter.get('/', async (req, res) => {
  const limit = typeof req.query['limit'] === 'string'? Number(req.query['limit']): 0;
  const offset = typeof req.query['offset'] === 'string'? Number(req.query['offset']): 0;
  const name = typeof req.query['name'] === 'string'? req.query['name']: '';

  const [users, count] = await userRepository.findUsers({ limit, offset, name });
  return res.send({
    success: true,
    data: {
      users,
      count,
    },
  });
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
