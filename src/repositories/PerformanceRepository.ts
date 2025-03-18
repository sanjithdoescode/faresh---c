interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: Date;
  labels: Record<string, string>;
}

export class PerformanceRepository {
  async recordMetric(metric: PerformanceMetric): Promise<void> {
    await prisma.metric.create({
      data: {
        metricName: metric.name,
        value: metric.value,
        timestamp: metric.timestamp,
        dimensions: metric.labels
      }
    });
  }

  async getMetrics(
    name: string,
    startTime: Date,
    endTime: Date
  ): Promise<PerformanceMetric[]> {
    const metrics = await prisma.metric.findMany({
      where: {
        metricName: name,
        timestamp: {
          gte: startTime,
          lte: endTime
        }
      },
      orderBy: {
        timestamp: 'asc'
      }
    });

    return metrics.map(m => ({
      name: m.metricName,
      value: m.value,
      timestamp: m.timestamp,
      labels: m.dimensions as Record<string, string>
    }));
  }
} 