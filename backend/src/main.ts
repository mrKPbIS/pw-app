import express, {} from 'express';
import { getDataSource } from './adapters/dataSource';
import config from './config';
import auth from './user/auth.router';

getDataSource();

const app = express();

app.use(express.json());
app.use('/auth', auth);
app.listen(config.APP_PORT);
