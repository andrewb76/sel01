import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { VkService } from './vk/vk.service.cb';
import { formatDuration, intervalToDuration, fromUnixTime } from 'date-fns'

@Controller('/')
export class AppController {
  constructor(private readonly vkService: VkService) {}

  @Post('/')
  @HttpCode(200)
  bot(@Body() cb: any): string {
    if (cb?.object?.message?.date) {
      console.log(fromUnixTime(cb.object.message.date))
      let duration = intervalToDuration({
        start: fromUnixTime(cb.object.message.date), 
        end: new Date(),
      });

      cb.object.message.age_minutes = duration.minutes;

      console.log(
        // cb,
        'IN msg ::: ', 
        `${formatDuration(duration, {
          delimiter: ', '
        })} - [${cb.object.message.conversation_message_id}] - [${cb.object.message.from_id}] - [${cb.object.message.text}]`
      );
    }
    const resp = this.vkService.getBotCB(cb);
    return resp;
  }
}
