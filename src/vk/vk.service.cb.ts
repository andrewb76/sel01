import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Interval } from '@nestjs/schedule';

const vk = require('vk-chat-bot');
const { Color, button, Keyboard } = vk.kbd;

@Injectable()
export class VkService {
    private bot;
    private core;
    private logger = new Logger(VkService.name);

    constructor(private eventEmitter: EventEmitter2) {
        const params = {
            vkToken: 'vk1.a.I8M4twDsZMgWEjynnIft4likyiWwKUgV5N5Pdo9oBBseSsXEFj6pWDc59rvZLSKh5gcbyfqx6-kgIuoQgGohVtNwPAX0worxD6v39ugFdoy6EkNvfEI-OoxYl2k3--v-krLlpX2fXfdqKicNp3qKEeYtwSMUba5T3YDq0DlLFjJ6ncqNltfcg0Pam-PJ6objAlIsQt3Gp3zgBeD2u07Hmg',
            confirmationToken: '6d2bfa23',
            groupId: 221535749,
            secret: 'aa135f3',
            port: 12345,
         
            cmdPrefix: '/'
          };
         
        const { bot, core } = vk.bot(params);
        this.bot = bot;
        this.core = core;

        core.cmd('help', $ => {
            console.log('0>>>>>>>>>>>>>>');

            // core.help() returns the help message
            $.text('GPT Bot v0.1' + core.help());
          
            // Attach an image from
            // https://vk.com/team?z=photo6492_45624077
            //$.attach('photo', 6492, 456240778);
        }, 'shows the help message');
          
        core.regex(/h(i|ello|ey)/i, $ => {
            console.log('1>>>>>>>>>>>>>>');
            $.text('Hello, I am a test bot. You said: ' + $.msg);
        });
        
        core.on('start', $ => {
            console.log('2>>>>>>>>>>>>>>');

            // ...send them our keyboard.
            $.text('Thanks for messaging us!');

            var kbd = new Keyboard([
                [ /* Row (array of buttons) */
                  button.text('Secondary'),
                  button.text('Primary', Color.Primary),
                  button.text('Negative', Color.Negative),
                  button.text('Positive', Color.Positive)
                ],
                [
                  button.text('Maximum rows is 10, columns - 4.')
                ],
              ]);

            $.keyboard(kbd);
          
            // Here, $.send() is added automatically.
        });

        bot.start();

    }
    
    // @Interval(2000)
    // private testGen() {
    //     this.eventEmitter.emit('gpt.request', {
    //         userId: 1,
    //         request: `${this.getRandomInt(9)}+${this.getRandomInt(9)}`,
    //     }) 
    // }

    // @OnEvent('gpt.request')
    // getHello1(payload: any): void {
    //     this.logger.log(`@OnEvent('gpt.request')`);
    // }

    private getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }
}
