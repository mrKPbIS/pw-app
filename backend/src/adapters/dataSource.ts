import config from '../config';
import { DataSource } from 'typeorm';
import { User } from '../entity/user';
import { Transaction } from '../entity/transaction';

let AppDataSource: DataSource | null = null;
let dataSource: DataSource | null = null;

async function getDataSource() {
  if (!dataSource) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return getDataSource();
  } else {
    return dataSource;
  }
}

export async function initDataSource() {
  try {
    if (AppDataSource === null) {
      AppDataSource = new DataSource({
        type: 'mssql',
        host: config.DB_HOST,
        port: config.DB_PORT,
        username: config.DB_USERNAME,
        password: config.DB_PASSWORD,
        database: config.DB_NAME,
        synchronize: false,
        entities: [User, Transaction],
        extra: {
          trustServerCertificate: true,
        },
        logging: true,
      });
      dataSource = await AppDataSource.initialize();
      console.log('Data source initialized');
    }
    return getDataSource();
  } catch (err) {
    console.log('Error during initializing Data Source');
    throw err;
  }
}
