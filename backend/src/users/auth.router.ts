import { Router } from 'express';
import { checkSchema, validationResult } from 'express-validator';
import { createToken } from '../common/token';
import { BadRequestError, ForbiddenRequestError, NotFoundError, ValidationError } from '../middleware/errors.middleware';
import { UserService } from './user.repository';

export default function (userService: UserService): Router {
  const authRouter = Router();
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
      let user = await userService.findByEmail(email);
      if (user) {
        throw new ForbiddenRequestError('User already registered');
      }
      user = await userService.createUser({ email, name, rawPassword: password });
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
      const user = await userService.findByEmail(email);
      if (!user) {
        throw new NotFoundError('User not found');
      }
      if (!(await userService.confirmPassword(user, password))) {
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

  return authRouter;
}
