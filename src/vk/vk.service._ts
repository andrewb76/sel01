import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Timeout } from '@nestjs/schedule';

const VkBot = require('node-vk-bot-api');
const vkApi = require('node-vk-bot-api/lib/api');

@Injectable()
export class VkService {
    private isReady = false;
    private bot;
    private api;
    private logger = new Logger(VkService.name);

    constructor(
        private eventEmitter: EventEmitter2,
        private config: ConfigService,
    ) {
        this.bot = new VkBot(config.get('vk.vkToken'));
        this.api = (method, params) => {
            return vkApi(method, { ...params, access_token: config.get('vk.vkToken') });
        }
        
        const gptCommandAliases = [
            'скажи', 'помоги', 'Силенко помоги', 'придумай', 'сочини', 'подскажи', 'напиши', 'напомни', 'составь' 
        ];

        gptCommandAliases.forEach(a => {
            this.logger.log(`added GPT alias [${a}] ==>>`);
            
            this.bot.command(`${a}`, async (ctx) => {
                const { message } = ctx;
                if (this.isReady && message.type === 'message_new') {
                    this.logger.log(message);
                    const { response: [user] } = await this.api('users.get', { user_ids: message.from_id })
                    this.logger.log(user);
                    this.eventEmitter.emit('gpt.request', {
                        addedAt: new Date(),
                        owner: message.from_id,
                        request: message.text,//.substr(1),
                        user,
                        message,
                    });
                }
            });
        });
    }
        
    @Timeout(1000)
    private start1() {
        this.logger.log('Start timeout pooling --==>>');
        this.bot.startPolling(() => {
            this.logger.log('Start pooling ----==>>');
        });
    }    
    
    @Timeout(3000)
    private start2() {
        this.isReady = true;
    }

    @OnEvent('vk.replay')
    private async vkReply(payload: any): Promise<void> {
        this.logger.log(`@OnEvent('vk.replay') +++ [${payload.to}] [${payload.text}]`);
        try {
            await this.bot.sendMessage(payload.to, payload.text);
        } catch (error) {
            this.logger.error(JSON.stringify(error, null, 2));           
        }
    }
}
