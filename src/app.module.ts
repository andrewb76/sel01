import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { VkModule } from './vk/vk.module';
import { GptModule } from './gpt/gpt.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { PrometheusModule } from "@willsoto/nestjs-prometheus";
import { ConfigModule, ConfigService } from '@nestjs/config';
import { config } from './app.config';
import { WinstonModule } from 'nest-winston';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
      envFilePath: '.env'
    }),
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => (config.get(`logging.${process.env.NODE_ENV}`)),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot({ wildcard: true }), 
    // PrometheusModule.register({
    //   // pushgateway: {
    //   //   url: "https://251245:eyJrIjoiMDhmOTBhYTYwZGM1MDU1NDNhZWUyNGIwZjk1ZTE2ZTk2MzJjODhiNSIsIm4iOiJ2a2dwdF9wdWIiLCJpZCI6NTY0MTkwfQ==@prometheus-prod-01-eu-west-0.grafana.net/api/prom/push",
    //   // },
    // }),
    VkModule, 
    GptModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
