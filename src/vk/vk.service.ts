import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Timeout } from '@nestjs/schedule';

const VkBot = require('node-vk-bot-api');
const vkApi = require('node-vk-bot-api/lib/api');
const vkToken = 'vk1.a.I8M4twDsZMgWEjynnIft4likyiWwKUgV5N5Pdo9oBBseSsXEFj6pWDc59rvZLSKh5gcbyfqx6-kgIuoQgGohVtNwPAX0worxD6v39ugFdoy6EkNvfEI-OoxYl2k3--v-krLlpX2fXfdqKicNp3qKEeYtwSMUba5T3YDq0DlLFjJ6ncqNltfcg0Pam-PJ6objAlIsQt3Gp3zgBeD2u07Hmg';

@Injectable()
export class VkService {
    private isReady = false;
    private bot;
    private api;
    private logger = new Logger(VkService.name);

    constructor(
        // private readonly logger: Logger,
        private eventEmitter: EventEmitter2,
    ) {
        this.bot = new VkBot(vkToken);
        this.api = (method, params) => {
            return vkApi(method, { ...params, access_token: vkToken });
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
                        // cb: this.bot.sendMessage,
                    });
                    // try {
                    //     await this.bot.sendMessage(message.from_id, { message: `Принято, ${userName.first_name}` });
                    // } catch (error) {
                    // }
                }

            });
        });

          
        
        // this.bot.on((ctx) => {
        //     const { message } = ctx;
        //     if (this.isReady && message.type === 'message_new') {
        //         this.eventEmitter.emit('gpt.request', {
        //             owner: message.from_id,
        //             request: message.text.substr(1),
        //         }) 
        //     }
        //     // this.logger.log('helo --------------==>>', JSON.stringify(ctx.message, null, 2));

        //     // ctx.reply('Hello!');
        // });
          
    }
        
    @Timeout(1000)
    private start1() {
        this.logger.log('Start timeout pooling --------------==>>');
        this.bot.startPolling(() => {
            this.logger.log('Start pooling --------------==>>');
        });
    }    
    
    @Timeout(3000)
    private start2() {
        this.isReady = true;
    }

    // @Interval(2000)
    // private testGen() {
    //     this.eventEmitter.emit('gpt.request', {
    //         userId: 1,
    //         request: `${this.getRandomInt(9)}+${this.getRandomInt(9)}`,
    //     }) 
    // }

    @OnEvent('vk.replay')
    private async vkReply(payload: any): Promise<void> {
        this.logger.log(`@OnEvent('vk.replay') [${payload.to}] [${payload.text}]`);
        try {
            await this.bot.sendMessage(payload.to, payload.text);
        } catch (error) {
            this.logger.error(JSON.stringify(error, null, 2));           
        }
    }

    private getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }
}
