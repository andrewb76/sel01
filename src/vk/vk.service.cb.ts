import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Interval } from '@nestjs/schedule';

const vk = require('vk-chat-bot');
const { Color, button, Keyboard } = vk.kbd;

@Injectable()
export class VkService {
  private isReady = false;
  private bot;
  private core;
  private logger = new Logger(VkService.name);

  constructor(private eventEmitter: EventEmitter2, private config: ConfigService) {
      
    const { bot, core } = vk.bot(config.get('vk'));
    this.bot = bot;
    this.core = core;

    // ///////////////////////////// CREATE A KEYBOARD //////////////////////////////

const { Color, button, Keyboard } = vk.kbd;

const kbd = new Keyboard(
  [
    // Rows
    [
      button.text("/now"),
      button.text("/info", Color.Primary),
      button.text("/rmkbd", Color.Negative),
      button.text("/help", Color.Positive)
    ],
    [
      button.text("Max rows: 10", Color.Secondary, { a: "b" }),
      button.text("Max cols: 4", Color.Secondary, { a: "b", c: "d" })
    ]
  ],
  false
); // Set 'true' instead of 'false' to make it disappear after a button was pressed

this.core.on('start', $ => {
  // ...send them our keyboard.
  $.text('Thanks for messaging us! Choose from the options below:');
  $.keyboard(kbd);

  // Here, $.send() is added automatically.
});

// core.on("start", $ => {
//   $.text("Hello, this is an example bot for `vk-chat-bot`!");
//   $.keyboard(kbd);
//   // $.send() is called automatically after the handler
// });



    const gptCommandAliases = [
      'скажи', 'помоги', 'Силенко помоги', 'придумай', 'сочини', 'подскажи', 'напиши', 'напомни', 'составь' 
    ];

    // gptCommandAliases.forEach(a => {
    //   this.logger.log(`added GPT alias [${a}] ==>>`);
    //   core.cmd(a, $ => {
    //     this.logger.log(`[GPT][${a}] ==>>`, $);

    //     const { msg } = $;
    //     if (this.isReady && msg.type === 'message_new') {
    //       this.logger.log(msg);
    //     } else {
    //       this.logger.warn(msg);
    //     }
    //     //   this.eventEmitter.emit('gpt.request', {
    //     //     addedAt: new Date(),
    //     //     owner: message.from_id,
    //     //     request: message.text,//.substr(1),
    //     //     user,
    //     //     message,
    //     // });
    //     // $.text('GPT Bot v0.1' + core.help());
    //   }, 'shows the gpt messages');
    // });  

    this.core.cmd('help', $ => {
      $.text('GPT Bot v0.1' + this.core.help());
    }, 'shows the help message');
      
    core.regex(/h(i|ello|ey)/i, $ => {
      $.text('Hello, I am a test bot. You said: ' + $.obj.msg);
    });
        
    // core.on('start', $ => {
    //     //     // ...send them our keyboard.
    //         $.text('Thanks for messaging us!');

    //     //     var kbd = new Keyboard([
    //     //         [ /* Row (array of buttons) */
    //     //           button.text('Secondary'),
    //     //           button.text('Primary', Color.Primary),
    //     //           button.text('Negative', Color.Negative),
    //     //           button.text('Positive', Color.Positive)
    //     //         ],
    //     //         [
    //     //           button.text('Maximum rows is 10, columns - 4.')
    //     //         ],
    //     //       ]);

    //     //     $.keyboard(kbd);
          
    //     //     // Here, $.send() is added automatically.
    // });

    this.core.on('handler_error', $ => {
      $.text("Oops, looks like something went wrong.");
      console.error('handler_error');
    });

    this.bot.start();

    console.log('>>>>>>>>>>>>>>>>>>',this.core.help())
  }
}
