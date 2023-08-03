import { config } from 'dotenv';

config();

export default {
  DB_USERNAME: process.env['DB_USERNAME'],
  DB_PASSWORD: process.env['DB_PASSWORD'],
  DB_HOST: process.env['DB_HOST'],
  DB_PORT: Number(process.env['DB_PORT']),
  DB_NAME: process.env['DB_NAME'],
  APP_PORT: Number(process.env['APP_PORT']),
  JWT_SECRET: process.env['JWT_SECRET'],
};
