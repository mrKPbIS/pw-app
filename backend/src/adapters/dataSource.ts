import config from '../config';
import { DataSource } from 'typeorm';
import { User } from '../entity/user';
import { Transaction } from '../entity/transaction';

const AppDataSource = new DataSource({
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
  }
});

let dataSource: DataSource | null = null;

export async function getDataSource() {
  try {
    if (dataSource === null) {
      // TODO: fix double loading
      dataSource = await AppDataSource.initialize();
    }
    console.log('Data Source initialized');
    return dataSource;
  } catch (err) {
    console.log('Error during initializing Data Source');
    throw err;
  }
}
