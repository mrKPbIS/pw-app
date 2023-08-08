import { Router } from 'express';
import { UserRepository } from './user.repository';
import { createToken } from '../common/token';
import { BadRequestError, ForbiddenRequestError } from '../middleware/errors.middleware';

const authRouter = Router();
const userRepository = new UserRepository();

authRouter.post('/register', async (req, res, next) => {
  const { email, name, password } = req.body;
  try {
    let user = await userRepository.findByEmail(email);
    if (user) {
      throw new ForbiddenRequestError('User already registered');
    }
    user = await userRepository.createUser({ email, name, rawPassword: password });
    const token = createToken({ id: user.id, email: user.email });
    return res.send({
      success: true,
      data: token,
    });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/login', async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await userRepository.findByEmail(email);
    if (!user || !userRepository.confirmPassword(user, password)) {
      throw new BadRequestError('Password does not match');
    }
    const token = createToken({ id: user.id, email: user.email });
    return res.send({
      success: true,
      data: token,
    });
  } catch (err) {
    next(err);
  }
});

export default authRouter;
