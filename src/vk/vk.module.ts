import { Module } from '@nestjs/common';
import { VkUsersService } from './vk.user.cache.service';
import { VkService } from './vk.service.cb';
import { VkController } from './vk.controller';

@Module({
  // imports: [],
  controllers: [VkController],
  providers: [VkService, VkUsersService]
})
export class VkModule {}
