import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as winston from 'winston';
import { WINSTON_MODULE_NEST_PROVIDER, utilities as nestWinstonModuleUtilities, WinstonModule } from 'nest-winston';


async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      // options (same as WinstonModule.forRoot() options)
        transports: [
          // new LokiTransport({
          //   host: "https://385021:eyJrIjoiOWE5OGM4MDk3YThlMjgwMWI2MzhjYWQ1MTYwYzA1NTgwZmNhZThkNCIsIm4iOiJ2a2dwdCIsImlkIjo3OTQxMDF9@logs-prod-017.grafana.net/loki/api/v1/push",
          //   onConnectionError: err => { console.error('**&&**', err) },
          // }),
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.timestamp(),
              winston.format.ms(),
              nestWinstonModuleUtilities.format.nestLike('vkgpt', {
                colors: true,
                prettyPrint: true,
              }),
            ),
          }),
        ]
    })
  });
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  await app.listen(3000);
}
bootstrap();
