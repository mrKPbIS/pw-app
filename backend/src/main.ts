import { initDataSource } from './adapters/dataSource';
import app from './app';
import config from './config';

async function bootstrap() {
  await initDataSource();
  app.listen(config.APP_PORT);
}

bootstrap();
