import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import { errorHandler } from './middleware/errors.middleware';
import { AppDataSource } from './adapters/dataSource';
import config from './config';
import { User } from './entity/user';
import { Transaction } from './entity/transaction';
import { userModule } from './users';
import { transactionModule } from './transactions';

export default async function() {
  const app = express();
  const server = http.createServer(app);
  const io = new Server(
    server,
    { cors: { origin: '*', } }
  );
  const entities = [User, Transaction];
  const dataSource = new AppDataSource({
    type: 'mssql',
    host: config.DB_HOST,
    port: config.DB_PORT,
    username: config.DB_USERNAME,
    password: config.DB_PASSWORD,
    database: config.DB_NAME,
    // TODO: app crashes if synchronize set true and DB already exists
    synchronize: false,
    entities,
    extra: {
      trustServerCertificate: true,
    },
    logging: true,
  }, entities.map(entity => entity.name));

  await dataSource.init();
  const { authRouter, userRouter } = userModule(dataSource.getRepository(User.name));
  const { transactionRouter } = transactionModule(dataSource.getRepository(Transaction.name), io);

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

  io.on('connection', (socket) => {
    console.log('new socket connection');
  });

  return server;
}
