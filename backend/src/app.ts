import express, {} from 'express';
import cors from 'cors';
import transactionRouter from './transactions/transaction.router';
import { errorHandler } from './middleware/errors.middleware';
import authRouter from './users/auth.router';
import userRouter from './users/user.router';

const app = express();

app.use(cors({
  origin: '*',
}));
app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/transactions', transactionRouter);
app.use('/ping', (req, res) => {
  res.send('pong');
});
app.use(errorHandler);

export default app;
