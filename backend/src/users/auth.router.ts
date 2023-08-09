import { Router } from 'express';
import { checkSchema, validationResult } from 'express-validator';
import { UserRepository } from './user.repository';
import { createToken } from '../common/token';
import { BadRequestError, ForbiddenRequestError, ValidationError } from '../middleware/errors.middleware';

const authRouter = Router();
const userRepository = new UserRepository();

authRouter.post('/register', checkSchema({
  email: {
    isEmail: true,
    errorMessage: 'should be email',
  },
  password: {
    isString: true,
    isLength: {
      errorMessage: 'should be a string with length not less than 6',
      options: {
        min:6,
      }
    },
  },
  name: {
    isString: true,
    errorMessage: 'should be a string',
  }
}, ['body']), async (req, res, next) => {
  try {
    const validation = validationResult(req);
    if (!validation.isEmpty()) {
      throw new ValidationError(validation);
    }
    const { email, name, password } = req.body;
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

authRouter.post('/login', checkSchema({
  email: {
    isEmail: true,
    errorMessage: 'should be email',
  },
  password: {
    isString: true,
    isLength: {
      errorMessage: 'should be a string with length not less than 6',
      options: {
        min:6,
      }
    },
  },
}, ['body']), async (req, res, next) => {
  try {
    const validation = validationResult(req);
    if (!validation.isEmpty()) {
      throw new ValidationError(validation);
    }
    const { email, password } = req.body;
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
