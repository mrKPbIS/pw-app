import { Router } from 'express';
import { UserRepository } from './user.repository';
import { createToken } from '../common/token';

const authRouter = Router();
const userRepository = new UserRepository();

authRouter.post('/register', async (req, res) => {
  const { email, name, password } = req.body;
  let user = await userRepository.findByEmail(email);
  if (user) {
    return res.send({
      success: false,
    });
  }
  try {
    user = await userRepository.createUser({ email, name, rawPassword: password });
    const token = createToken({ id: user.id, email: user.email });
    return res.send({
      success: true,
      token,
    });
  } catch (err) {
    console.log(err);
  }
});

authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await userRepository.findByEmail(email);
  if (!user || !userRepository.confirmPassword(user, password)) {
    return res.send({
      success: false,
    });
  }
  const token = createToken({ id: user.id, email: user.email });
  return res.send({
    success: true,
    token,
  });
});

export default authRouter;
