import { Body, Controller, HttpCode, Get } from '@nestjs/common';
import { formatDuration, intervalToDuration, fromUnixTime } from 'date-fns'

@Controller('/')
export class AppController {
  constructor() {
  }

  @Get('/')
  @HttpCode(200)
  main(): string {
    return 'Ok'
  }
}
