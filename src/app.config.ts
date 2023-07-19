
import Transport = require('winston-transport');
// import LokiTransport = require("winston-loki");
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as winston from 'winston';

class MyLokiTransport extends Transport {
  constructor(opts) {
    super(opts);
  }
  log(info, callback) {
    console.log('MyLokiTransport', info)
 // do whatever you want with log data
    callback();
  }
};

export const config = () => ({
  env: process.env.NODE_ENV,
  vk: {
    vkToken: process.env.VK_TOKEN,
    confirmationToken: process.env.VK_CONFIRMATION_TOKEN,
    groupId: parseInt(process.env.VK_GROUP_ID),
    secret: process.env.VK_BOT_SECRET,
    port: parseInt(process.env.VK_BOT_PORT),
    cmdPrefix: '/'
  },
  gpt: {
    apiKey: process.env.GPT_API_KEY,
  },
  loki: {
    user: parseInt(process.env.LOKI_USER),
    key: process.env.LOKI_API_KEY,
    pod: process.env.LOKI_POD,
  },

  logging: {
    production: {
      level: 'verbose',
      transports: [
        // new LokiTransport({
        //   host: `https://${process.env.LOKI_POD}.grafana.net`,
        //   basicAuth: `${process.env.LOKI_USER}:${process.env.LOKI_API_KEY}`,
        //   labels: { 
        //     app: 'vkgpt', 
        //   },
        //   json: true,
        //   format: winston.format.json(),
        //   replaceTimestamp: true,
        //   onConnectionError: err => { console.error(err, '**& LOKI ERROR &**') },
        // }),
        new MyLokiTransport({}),
      ]
    },
    development: {
      level: 'verbose',
      transports: [
        new MyLokiTransport({}),
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            nestWinstonModuleUtilities.format.nestLike('vkgpt', {
              colors: true,
              prettyPrint: true,
            }),
          ),
        }),
      ],
    },
  },
});