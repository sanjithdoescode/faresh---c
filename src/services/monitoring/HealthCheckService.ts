import { logEvent } from '../../utils/monitoring/logger';
import { AlertingService } from './AlertingService';
import { MetricsService } from './MetricsService';
import { DatabaseHealthCheck } from './health/DatabaseHealthCheck';
import { RedisHealthCheck } from './health/RedisHealthCheck';
import { Redis } from 'ioredis';
import { StorageHealthCheck } from './health/StorageHealthCheck';
import { S3 } from 'aws-sdk';

interface HealthCheck {
  name: string;
  check: () => Promise<boolean>;
  criticalService: boolean;
}

export class HealthCheckService {
  private readonly healthChecks: HealthCheck[];
  private readonly alertingService: AlertingService;
  private readonly metricsService: MetricsService;
  private readonly databaseHealthCheck: DatabaseHealthCheck;
  private readonly redisHealthCheck: RedisHealthCheck;
  private readonly storageHealthCheck: StorageHealthCheck;

  constructor(
    alertingService: AlertingService,
    metricsService: MetricsService,
    redis: Redis,
    s3: S3,
    storageBucket: string
  ) {
    this.alertingService = alertingService;
    this.metricsService = metricsService;
    this.databaseHealthCheck = new DatabaseHealthCheck();
    this.redisHealthCheck = new RedisHealthCheck(redis);
    this.storageHealthCheck = new StorageHealthCheck(s3, storageBucket);
    this.healthChecks = this.registerHealthChecks();
  }

  private registerHealthChecks(): HealthCheck[] {
    return [
      {
        name: 'database',
        check: this.checkDatabase.bind(this),
        criticalService: true
      },
      {
        name: 'redis',
        check: this.checkRedis.bind(this),
        criticalService: true
      },
      {
        name: 'storage',
        check: this.checkStorage.bind(this),
        criticalService: false
      }
    ];
  }

  async performHealthCheck(): Promise<boolean> {
    const results = await Promise.all(
      this.healthChecks.map(async (check) => {
        const startTime = Date.now();
        try {
          const healthy = await check.check();
          const duration = Date.now() - startTime;
          
          this.metricsService.recordMetric(`health_check_${check.name}_duration`, duration);
          
          if (!healthy && check.criticalService) {
            await this.alertingService.raiseAlert({
              severity: 'HIGH',
              type: 'SYSTEM',
              message: `Health check failed for ${check.name}`,
              data: { duration }
            });
          }
          
          return healthy;
        } catch (error) {
          logEvent('error', `Health check failed for ${check.name}`, { error });
          return false;
        }
      })
    );

    return results.every(Boolean);
  }

  private async checkDatabase(): Promise<boolean> {
    return this.databaseHealthCheck.check();
  }

  private async checkRedis(): Promise<boolean> {
    return this.redisHealthCheck.check();
  }

  private async checkStorage(): Promise<boolean> {
    return this.storageHealthCheck.check();
  }
} 