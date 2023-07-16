import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Timeout } from '@nestjs/schedule';
import { VkUsersService } from './vk.service.user';

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
      token: config.get('vk.vkToken'),
      group_id: config.get('vk.groupId'),
      confirmation: config.get('vk.confirmationToken'),  
      secret: config.get('vk.secret'), 
    });

    // this.bot.command('start', (ctx) => {
    //   ctx.replay(`Ready for work ...`)
    //   // this.isReady && this.processRequest(ctx);
    // });
    
    this.bot.command('/', (ctx) => {
      this.isReady && this.processRequest(ctx);
      // ctx.scene.enter('meet');
    });

    // this.bot.on((ctx) => {
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
    return this.bot.webhookCallback(cb);
  }
  
  private async processRequest(ctx) {
    const { message } = ctx;
    this.logger.verbose(message, 'VkS::processRequest');
    if (message.age_minutes) { // Игнорируем старые запросы
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
