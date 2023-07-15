import { Module, Logger} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VkModule } from './vk/vk.module';
import { GptModule } from './gpt/gpt.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { PrometheusModule } from "@willsoto/nestjs-prometheus";
import { utilities as nestWinstonModuleUtilities, WinstonModule } from 'nest-winston';
import LokiTransport = require("winston-loki");
import * as winston from 'winston';
import { ConfigModule } from '@nestjs/config';
import { config } from './app.config';
import { VkService } from './vk/vk.service.cb';
import { VkUsersService } from './vk/vk.user.cache';
// import { VkService } from './vk/vk.service.cb';
// import { VkUsersService } from './vk/vk.user.cache';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
      envFilePath: '.env'
    }),
    WinstonModule.forRoot({
      transports: [
        new LokiTransport({
          host: "https://385021:eyJrIjoiOWE5OGM4MDk3YThlMjgwMWI2MzhjYWQ1MTYwYzA1NTgwZmNhZThkNCIsIm4iOiJ2a2dwdCIsImlkIjo3OTQxMDF9@logs-prod-017.grafana.net/loki/api/v1/push",
          onConnectionError: err => { console.error('**&&**', err) },
        }),
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
    }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot({ wildcard: true }), 
    PrometheusModule.register({
      
      // pushgateway: {
      //   url: "http://127.0.0.1:9091",
      // },
    }),
    VkModule, 
    GptModule,
  ],
  controllers: [AppController],
  providers: [VkService, VkUsersService],
})
export class AppModule {}
