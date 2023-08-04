import express, {} from 'express';
import { getDataSource } from './adapters/dataSource';
import config from './config';
import transactionRouter from './transactions/transaction.router';
import authRouter from './users/auth.router';
import userRouter from './users/user.router';

getDataSource();

const app = express();

app.use(express.json());

app.use('/auth', authRouter);
app.use('/users', userRouter);
app.use('/transactions', transactionRouter);
app.listen(config.APP_PORT);
