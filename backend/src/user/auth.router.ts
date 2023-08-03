import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { UserRepository } from './user.repository';
import config from '../config';

const auth = Router();
const userRepository = new UserRepository();
const secret = config.JWT_SECRET;

auth.post('/register', async (req, res) => {
  const { email, name, password } = req.body;
  let user = await userRepository.findByEmail(email);
  if (user) {
    return res.send({
      success: false,
    });
  }
  try {
    user = await userRepository.createUser({ email, name, rawPassword: password });
    const token = jwt.sign({ id: user.id, email: user.email }, secret);
    return res.send({
      success: true,
      token,
    });
  } catch (err) {
    console.log(err);
  }
});

auth.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await userRepository.findByEmail(email);
  if (!user || !userRepository.confirmPassword(user, password)) {
    return res.send({
      success: false,
    });
  }
  const token = jwt.sign({ id: user.id, email: user.email }, secret);
  return res.send({
    success: true,
    token,
  });
});

export default auth;
