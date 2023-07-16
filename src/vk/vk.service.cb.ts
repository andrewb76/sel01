import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Timeout } from '@nestjs/schedule';
import { VkUsersService } from './vk.service.user';
import { getUnixTime } from 'date-fns';

const VkBot = require('node-vk-bot-api');

@Injectable()
export class VkService {
  private isReady = false;
  private bot;
  private logger = new Logger(VkService.name);

  constructor(
    private eventEmitter: EventEmitter2, 
    private config: ConfigService,
    private vkUsers: VkUsersService,
  ) {
    this.bot = new VkBot({
      token: this.config.get('vk.vkToken'),
      group_id: this.config.get('vk.groupId'),
      confirmation: this.config.get('vk.confirmationToken'),  
      secret: this.config.get('vk.secret'), 
    });

    // this.bot.command('start', (ctx) => {
    //   ctx.replay(`Ready for work ...`)
    //   // this.isReady && this.processRequest(ctx);
    // });
    
    this.bot.command('/', (ctx) => {
      this.isReady && this.processRequest(ctx);
      // ctx.scene.enter('meet');
    });

    this.bot.use(async (ctx, next) => {
      try {
        next();
      } catch (error) {
        this.logger.error(error);
      }
    });
    
    // this.logger.log('Starting polling ...');
    // this.bot.startPolling((err) => {
    //   if (err) {
    //     this.logger.error(err, 'Start polling Error');
    //   }
    // });
  }

  @OnEvent('vk.replay')
  private async vkReply(payload: any): Promise<void> {
      this.logger.log(`@OnEvent('vk.replay') [${payload.to}] [${payload.text}]`);
      this.logger.debug(payload);
      try {
          await this.bot.sendMessage(payload.to, payload.text);
      } catch (error) {
          this.logger.error(JSON.stringify(error, null, 2));           
      }
  }

  public getBotCB(cb: any) {
    this.logger.log(cb, 'VkS::getBotCB start');
    return this.bot.webhookCallback(cb);
  }
  
  private async processRequest(ctx) {
    const { message } = ctx;
    const age = getUnixTime(new Date()) - message.date;
    this.logger.log({ message: message.text, age }, 'VkS::processRequest');
    if (age > 90) { // Игнорируем старые запросы
      return;
    }
    // this.logger.log(message, 'VK_S:process message >>>');
    const user = await this.vkUsers.getUserStrById(message.from_id);
    // this.logger.log(user, 'VK_S:get user info >>>');
    const payload = {
      addedAt: new Date(),
      owner: message.from_id,
      request: message.text.substr(1),
      user,
      message,
    }
    this.logger.log(payload, 'VK_S:E:gpt.request');
    this.eventEmitter.emit('gpt.request', payload);
  }
  
  @Timeout(3000)
  private start2() {
    this.isReady = true;
  }
}
