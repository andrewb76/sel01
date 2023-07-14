import { Module } from '@nestjs/common';
import { GptService } from './gpt.service';
import { HttpModule } from '@nestjs/axios';
import { MetricsService } from '../metric.service';

@Module({
    imports: [HttpModule],
    providers: [GptService, MetricsService],
})
export class GptModule {}
