import { Module } from '@nestjs/common';
import { VkService } from './vk.service';

@Module({
  imports: [],
  providers: [VkService]
})
export class VkModule {}
