import { prisma } from '../lib/prisma';
import { logEvent } from '../utils/monitoring/logger';
import { MetricsRepository as IMetricsRepository } from '../types/repositories';

export class MetricsRepository implements IMetricsRepository {
  async updateMetrics(metrics: Record<string, number>): Promise<void> {
    try {
      await Promise.all(
        Object.entries(metrics).map(([name, value]) =>
          prisma.metric.create({
            data: {
              metricName: name,
              value,
              timestamp: new Date(),
              dimensions: {}
            }
          })
        )
      );
    } catch (error) {
      logEvent('error', 'Failed to update metrics', { error });
      throw error;
    }
  }

  async getStats(): Promise<{
    farmers: number;
    consumers: number;
    active: number;
  }> {
    const [farmers, consumers, active] = await Promise.all([
      prisma.farmer.count(),
      prisma.consumer.count(),
      prisma.user.count({
        where: {
          lastActivityAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Active in last 30 days
          }
        }
      })
    ]);

    return { farmers, consumers, active };
  }

  async getDatabaseLatency(): Promise<number> {
    const startTime = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    return Date.now() - startTime;
  }

  async getApiLatency(): Promise<number> {
    // Implementation would depend on how you want to measure API latency
    // Could be average response time from application metrics
    return 0;
  }

  async getErrorRate(): Promise<number> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const [errors, total] = await Promise.all([
      prisma.metric.count({
        where: {
          metricName: 'error_count',
          timestamp: {
            gte: oneHourAgo
          }
        }
      }),
      prisma.metric.count({
        where: {
          metricName: 'request_count',
          timestamp: {
            gte: oneHourAgo
          }
        }
      })
    ]);

    return total > 0 ? errors / total : 0;
  }
} 