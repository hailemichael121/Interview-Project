// api/index.js
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../dist/app.module');

let cachedApp;

async function bootstrap() {
  if (cachedApp) {
    return cachedApp;
  }

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  app.enableCors({
    origin: true,
    credentials: true,
  });

  await app.init();

  cachedApp = app;
  return app;
}

module.exports = async (req, res) => {
  const app = await bootstrap();
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp(req, res);
};
