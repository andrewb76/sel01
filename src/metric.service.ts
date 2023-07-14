// metric.service.ts

import { Injectable } from '@nestjs/common';
import { Counter, Gauge, Histogram, register } from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly requestCounter: Counter<string>;

  private readonly activeUsersGauge: Gauge<string>;
  private readonly poolSizeGauge: Gauge<string>;

  private readonly requestDelayHistogram: Histogram<string>;

  constructor() {
    // Define the number of users requests counter
    this.requestCounter = new Counter({
      name: 'request_counter_total',
      help: 'Total number of users requests',
      labelNames: ['status'],
    });
    register.registerMetric(this.requestCounter);

    // Define the active users gauge
    this.activeUsersGauge = new Gauge({
      name: 'active_users',
      help: 'Number of active users',
      labelNames: [],
    });
    register.registerMetric(this.activeUsersGauge);

    // Define the pool size gauge
    this.poolSizeGauge = new Gauge({
      name: 'pool_size',
      help: 'Size of queries pool',
      labelNames: [],
    });
    register.registerMetric(this.poolSizeGauge);

    // Define the pool size gauge
    this.requestDelayHistogram = new Histogram({
      name: 'request_delay',
      help: 'Time from request to response',
      labelNames: ['status'],
      buckets: [10,50,100,250,500,1000,2000,2500,5000,10000, 20000, 60000, 120000],
    });
    register.registerMetric(this.requestDelayHistogram);
  }

  incrementRequestCounter(status: 'success' | 'failed') {
    this.requestCounter.labels(status).inc();
  }

  setActiveUsers(value: number) {
    this.activeUsersGauge.set({}, value);
  }

  setPoolSize(value: number) {
    this.poolSizeGauge.set({}, value);
  }

  setRequestDelayHistogram(status: 'success' | 'failed', value: any) {
    this.requestDelayHistogram
    .labels(status)
    .observe(value)
  }
}
