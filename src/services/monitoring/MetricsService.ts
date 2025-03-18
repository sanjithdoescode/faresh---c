import { MetricsRepository } from '../../repositories/interfaces';
import { logEvent } from '../../utils/monitoring/logger';

export class MetricsService {
  private readonly metricsRepository: MetricsRepository;
  private readonly metricsBuffer: Map<string, number[]>;
  private readonly flushInterval: number = 60000; // 1 minute

  constructor(metricsRepository: MetricsRepository) {
    this.metricsRepository = metricsRepository;
    this.metricsBuffer = new Map();
    this.startFlushInterval();
  }

  recordMetric(name: string, value: number): void {
    if (!this.metricsBuffer.has(name)) {
      this.metricsBuffer.set(name, []);
    }
    this.metricsBuffer.get(name)!.push(value);
  }

  private startFlushInterval(): void {
    setInterval(() => this.flushMetrics(), this.flushInterval);
  }

  private async flushMetrics(): Promise<void> {
    try {
      const metrics: Record<string, number> = {};
      
      this.metricsBuffer.forEach((values, name) => {
        if (values.length > 0) {
          metrics[name] = this.calculateAverage(values);
          this.metricsBuffer.set(name, []);
        }
      });

      if (Object.keys(metrics).length > 0) {
        await this.metricsRepository.updateMetrics(metrics);
      }
    } catch (error) {
      logEvent('error', 'Failed to flush metrics', { error });
    }
  }

  private calculateAverage(values: number[]): number {
    return values.reduce((a, b) => a + b, 0) / values.length;
  }
} 