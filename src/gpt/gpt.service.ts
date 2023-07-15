import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Interval } from '@nestjs/schedule';
import { EGptStatus } from './gpt.enums';
import { IGptTask } from './gpt.interfaces';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom, lastValueFrom, map } from 'rxjs';
import { MetricsService } from '../metric.service';
import { differenceInMilliseconds } from 'date-fns';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GptService {
  private logger = new Logger(GptService.name);
  private gptStatus = EGptStatus.ready;
  private hotDelay = 0;
  private pool: Array<IGptTask> = [];
  private userSessions = new Map();

  constructor (
    private readonly eventEmitter: EventEmitter2,
    private readonly http: HttpService,
    private readonly metricsService: MetricsService,
    private readonly config: ConfigService,
  ) {

  }

  @Interval(2000)
  private processing() {
    if (this.gptStatus === EGptStatus.hot && this.hotDelay > 0) {
      this.hotDelay--;    
    } else if (this.gptStatus === EGptStatus.hot && this.hotDelay === 0) {
        this.gptStatus = EGptStatus.ready;
    } else if (this.gptStatus === EGptStatus.ready && this.pool.length) {
      this.logger.log('Trying to get GPT response')
      this.gptStatus = EGptStatus.busy;
      const taskForProcessing = this.pool.shift();
      this.metricsService.setPoolSize(this.pool.length);
      this.resolveTask(taskForProcessing)
        .then((resp) => {
          this.logger.log('GPT Response:', resp);
          this.gptStatus = EGptStatus.ready;
          // taskForProcessing.cb(resp.response);
          this.eventEmitter.emit('vk.replay', {
            // to: taskForProcessing.owner,
            to: taskForProcessing.message.peer_id,
            text: `🤖 Для [${taskForProcessing.user}], ${resp.response}`,
            // message: taskForProcessing.message,
          })
          this.metricsService.incrementRequestCounter('success');
          this.metricsService.setRequestDelayHistogram('success', differenceInMilliseconds(new Date(), taskForProcessing.addedAt));
        }).catch(error => {
          this.metricsService.incrementRequestCounter('failed');
          this.metricsService.setRequestDelayHistogram('failed', differenceInMilliseconds(new Date(), taskForProcessing.addedAt));
          this.logger.warn({ error, taskForProcessing }, '[[ GPT error ]]');
          if (error.status === 429) {
            this.pool.unshift(taskForProcessing),
            this.metricsService.setPoolSize(this.pool.length);

            this.gptStatus = EGptStatus.hot;
            this.hotDelay = 3;
          } else {
            // this.logger.error('GPT Error:', JSON.stringify(?Zerror, null, 2));
            this.gptStatus = EGptStatus.hot;
            this.hotDelay = 4;
          }
        })
    }
  }

  private resolveTask(task: IGptTask): Promise<any> {
    this.logger.log(`resolveTask::poolSize [${this.pool.length}]`)
    const requestBody = {
      model: 'gpt-3.5-turbo',
      // model: 'gpt-4',
      messages: [
        { role: 'user', content: task.request }
      ],
    };
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.get('gpt.apiKey')}`,
      },
    };
    return lastValueFrom(
      this.http.post('https://api.openai.com/v1/chat/completions', requestBody, config)
        .pipe(map(d => { 
          const resp = {
            id: d.data.id,
            userId: task.owner,
            created: d.data.created,
            query: task.request,
            response: d.data.choices[d.data.choices.length - 1].message.content,
          };
          return resp; 
        }))
        .pipe(map(d => {
          // this.logger.log(`gpt.response`, d);
          return d;
        }))
    );
  }

  @OnEvent('gpt.request')
  getHello1(payload: any): void {
    this.logger.log(`@OnEvent('gpt.request')::poolSize [${this.pool.length}] [${payload.request}] [${this.gptStatus}] [${this.hotDelay}]`)
    // return
    this.pool.push({ ...payload,
      addedAt: new Date(),
    });
    this.metricsService.setPoolSize(this.pool.length);
    // payload.cb(payload.owner, 'Заказ в очереди');
    // this.eventEmitter.emit('vk.replay', {
    //   to: payload.owner,
    //   text: `Заказ в очереди`,
    // })
  }
}
