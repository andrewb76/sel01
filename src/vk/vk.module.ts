import { Module } from '@nestjs/common';
import { VkService } from './vk.service.cb';

@Module({
  imports: [],
  providers: [VkService]
})
export class VkModule {}
