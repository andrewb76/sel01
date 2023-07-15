import { Module } from '@nestjs/common';
import { VkService } from './vk.service.cb';
import { VkUsersService } from './vk.user.cache.service';
import { VkController } from './vk.controller';

@Module({
  // imports: [],
  controllers: [VkController],
  providers: [VkService, VkUsersService]
})
export class VkModule {}
