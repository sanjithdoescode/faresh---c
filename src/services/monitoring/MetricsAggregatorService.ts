import { MetricsRepository } from '../../repositories/MetricsRepository';
import { logEvent } from '../../utils/monitoring/logger';

interface AggregationRule {
  metricName: string;
  interval: number; // in milliseconds
  aggregationType: 'avg' | 'sum' | 'max' | 'min';
}

export class MetricsAggregatorService {
  private readonly metricsRepository: MetricsRepository;
  private readonly rules: AggregationRule[];
  private intervals: NodeJS.Timeout[] = [];

  constructor(metricsRepository: MetricsRepository) {
    this.metricsRepository = metricsRepository;
    this.rules = this.getAggregationRules();
  }

  private getAggregationRules(): AggregationRule[] {
    return [
      {
        metricName: 'request_latency',
        interval: 300000, // 5 minutes
        aggregationType: 'avg'
      },
      {
        metricName: 'error_count',
        interval: 3600000, // 1 hour
        aggregationType: 'sum'
      }
    ];
  }

  start(): void {
    this.rules.forEach(rule => {
      const interval = setInterval(async () => {
        try {
          await this.aggregateMetric(rule);
        } catch (error) {
          logEvent('error', `Failed to aggregate metric: ${rule.metricName}`, { error });
        }
      }, rule.interval);

      this.intervals.push(interval);
    });
  }

  stop(): void {
    this.intervals.forEach(clearInterval);
    this.intervals = [];
  }

  private async aggregateMetric(rule: AggregationRule): Promise<void> {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - rule.interval);

    const metrics = await this.metricsRepository.getMetrics(
      rule.metricName,
      startTime,
      endTime
    );

    if (metrics.length === 0) return;

    const aggregatedValue = this.calculateAggregation(
      metrics.map(m => m.value),
      rule.aggregationType
    );

    await this.metricsRepository.updateMetrics({
      [`${rule.metricName}_${rule.aggregationType}`]: aggregatedValue
    });
  }

  private calculateAggregation(values: number[], type: AggregationRule['aggregationType']): number {
    switch (type) {
      case 'avg':
        return values.reduce((a, b) => a + b, 0) / values.length;
      case 'sum':
        return values.reduce((a, b) => a + b, 0);
      case 'max':
        return Math.max(...values);
      case 'min':
        return Math.min(...values);
      default:
        throw new Error(`Unsupported aggregation type: ${type}`);
    }
  }
} 