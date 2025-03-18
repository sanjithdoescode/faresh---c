import { HealthCheckService } from './HealthCheckService';
import { AlertingService } from './AlertingService';
import { logEvent } from '../../utils/monitoring/logger';

export class HealthCheckScheduler {
  private readonly healthCheckService: HealthCheckService;
  private readonly alertingService: AlertingService;
  private readonly checkInterval: number;
  private interval?: NodeJS.Timeout;

  constructor(
    healthCheckService: HealthCheckService,
    alertingService: AlertingService,
    checkInterval = 60000 // Default: 1 minute
  ) {
    this.healthCheckService = healthCheckService;
    this.alertingService = alertingService;
    this.checkInterval = checkInterval;
  }

  start(): void {
    this.scheduleHealthCheck();
    this.interval = setInterval(() => this.scheduleHealthCheck(), this.checkInterval);
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
    }
  }

  private async scheduleHealthCheck(): Promise<void> {
    try {
      const isHealthy = await this.healthCheckService.performHealthCheck();
      
      if (!isHealthy) {
        await this.alertingService.raiseAlert({
          severity: 'HIGH',
          type: 'SYSTEM',
          message: 'System health check failed',
          data: { timestamp: new Date() }
        });
      }
    } catch (error) {
      logEvent('error', 'Failed to perform scheduled health check', { error });
    }
  }
} 