import app from './app';
import config from './config';

export async function bootstrap() {
  app.listen(config.APP_PORT);
}

bootstrap();
