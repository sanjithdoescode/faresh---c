import { Redis } from 'ioredis';
import { logEvent } from '../../../utils/monitoring/logger';

export class RedisHealthCheck {
  private readonly redis: Redis;

  constructor(redis: Redis) {
    this.redis = redis;
  }

  async check(): Promise<boolean> {
    try {
      const startTime = Date.now();
      
      // Simple ping to check Redis connectivity
      await this.redis.ping();
      
      const duration = Date.now() - startTime;
      logEvent('info', 'Redis health check completed', { duration });
      
      return true;
    } catch (error) {
      logEvent('error', 'Redis health check failed', { error });
      return false;
    }
  }

  async getLatency(): Promise<number> {
    const measurements: number[] = [];
    
    for (let i = 0; i < 5; i++) {
      const startTime = Date.now();
      try {
        await this.redis.ping();
        measurements.push(Date.now() - startTime);
      } catch (error) {
        logEvent('error', 'Redis latency check failed', { error });
      }
    }

    return measurements.length > 0
      ? measurements.reduce((a, b) => a + b, 0) / measurements.length
      : -1;
  }
} 