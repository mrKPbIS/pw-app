import express, {} from 'express';
import transactionRouter from './transactions/transaction.router';
import { errorHandler } from './middleware/errors.middleware';
import authRouter from './users/auth.router';
import userRouter from './users/user.router';

const app = express();

app.use(express.json());
app.use('/auth', authRouter);
app.use('/users', userRouter);
app.use('/transactions', transactionRouter);
app.use('/ping', (req, res) => {
  res.send('pong');
});
app.use(errorHandler);

export default app;
