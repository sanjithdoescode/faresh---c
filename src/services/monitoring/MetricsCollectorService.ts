import { MetricsService } from './MetricsService';
import { logEvent } from '../../utils/monitoring/logger';

interface MetricCollector {
  name: string;
  collect: () => Promise<number>;
  interval: number;
}

export class MetricsCollectorService {
  private readonly collectors: MetricCollector[];
  private readonly metricsService: MetricsService;
  private intervals: NodeJS.Timeout[] = [];

  constructor(metricsService: MetricsService) {
    this.metricsService = metricsService;
    this.collectors = this.registerCollectors();
  }

  private registerCollectors(): MetricCollector[] {
    return [
      {
        name: 'memory_usage',
        collect: this.collectMemoryMetrics.bind(this),
        interval: 60000 // 1 minute
      },
      {
        name: 'cpu_usage',
        collect: this.collectCPUMetrics.bind(this),
        interval: 30000 // 30 seconds
      }
    ];
  }

  start(): void {
    this.collectors.forEach(collector => {
      const interval = setInterval(async () => {
        try {
          const value = await collector.collect();
          this.metricsService.recordMetric(collector.name, value);
        } catch (error) {
          logEvent('error', `Failed to collect ${collector.name} metrics`, { error });
        }
      }, collector.interval);
      
      this.intervals.push(interval);
    });
  }

  stop(): void {
    this.intervals.forEach(clearInterval);
    this.intervals = [];
  }

  private async collectMemoryMetrics(): Promise<number> {
    const used = process.memoryUsage();
    return used.heapUsed / 1024 / 1024; // Convert to MB
  }

  private async collectCPUMetrics(): Promise<number> {
    const startUsage = process.cpuUsage();
    await new Promise(resolve => setTimeout(resolve, 100));
    const endUsage = process.cpuUsage(startUsage);
    return (endUsage.user + endUsage.system) / 1000000; // Convert to seconds
  }
} 