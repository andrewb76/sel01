import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const vkApi = require('node-vk-bot-api/lib/api');

interface IVkUser {
  id: number;
  first_name: string;
  last_name: string;
  can_access_closed: Boolean;
  is_closed: Boolean;
}

@Injectable()
export class VkUsersService {
  private users;
  private api;
  private logger = new Logger(VkUsersService.name);

  constructor(
    private config: ConfigService,
  ) {
    this.users = new Map();
    this.api = (method, params) => {
      return vkApi(method, { ...params, access_token: config.get('vk.vkToken') });
    }
  }

  async getUserStrById(id: number): Promise<string> {
    const user = await this.getUserById(id);
    return `${user.first_name} ${user.last_name}`;
  }

  getUserById(id: number): Promise<IVkUser> {
    return new Promise(async (resolve, reject) => {
      const user = this.users.get(id);
      if (user) {
        this.logger.log([id, user.first_name, user.last_name], 'VkUsers:cache');
        return resolve(user);
      } else {
        try {
          const { response: [user] } = await this.api('users.get', { user_ids: id });
          this.users.set(id, user);
          this.logger.log([id, user.first_name, user.last_name], 'VkUsers:api');
          return resolve(user);
        } catch (error) {
          return reject(error);
        }
      }
    });
  }
}
