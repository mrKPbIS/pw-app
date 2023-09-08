import initApp from './app';
import config from './config';

export async function bootstrap() {
  const app = await initApp();
  app.listen(config.APP_PORT);
}

bootstrap();
