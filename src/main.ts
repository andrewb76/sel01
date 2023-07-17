import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WINSTON_MODULE_NEST_PROVIDER, WinstonModule } from 'nest-winston';


async function bootstrap() {
  const configApp = await NestFactory.create(AppModule);
  const app = await NestFactory.create(AppModule, {});
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  await app.listen(80);
}
bootstrap();
