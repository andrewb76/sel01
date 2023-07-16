import { Module, Logger} from '@nestjs/common';
import { AppController } from './app.controller';
import { VkModule } from './vk/vk.module';
import { GptModule } from './gpt/gpt.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { PrometheusModule } from "@willsoto/nestjs-prometheus";
import { utilities as nestWinstonModuleUtilities, WinstonModule } from 'nest-winston';
import LokiTransport = require("winston-loki");
import * as winston from 'winston';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { config } from './app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
      envFilePath: '.env'
    }),
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        transports: [
          // new LokiTransport({
          //   host: `https://${config.get('grafana.user')}:${config.get('grafana.key')}@${config.get('grafana.pod')}.grafana.net/loki/api/v1/push`,
          //   onConnectionError: err => { console.error(err, '**&&**') },
          // }),
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.timestamp(),
              winston.format.ms(),
              nestWinstonModuleUtilities.format.nestLike('vkgpt', {
                colors: false,
                prettyPrint: false,
              }),
            ),
          }),
        ]      
      }),
      inject: [ConfigService],

    }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot({ wildcard: true }), 
    PrometheusModule.register({
      // pushgateway: {
      //   url: "https://251245:eyJrIjoiMDhmOTBhYTYwZGM1MDU1NDNhZWUyNGIwZjk1ZTE2ZTk2MzJjODhiNSIsIm4iOiJ2a2dwdF9wdWIiLCJpZCI6NTY0MTkwfQ==@prometheus-prod-01-eu-west-0.grafana.net/api/prom/push",
      // },
    }),
    VkModule, 
    GptModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
