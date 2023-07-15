import { Module } from '@nestjs/common';
import { VkService } from './vk.service.cb';
import { VkUsersService } from './vk.user.cache';

@Module({
  // imports: [],
  providers: [VkService, VkUsersService]
})
export class VkModule {}
