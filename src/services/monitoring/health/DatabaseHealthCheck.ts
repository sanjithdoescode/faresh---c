import { prisma } from '../../../lib/prisma';
import { logEvent } from '../../../utils/monitoring/logger';

export class DatabaseHealthCheck {
  async check(): Promise<boolean> {
    try {
      const startTime = Date.now();
      
      // Simple query to check database connectivity
      await prisma.$queryRaw`SELECT 1`;
      
      const duration = Date.now() - startTime;
      logEvent('info', 'Database health check completed', { duration });
      
      return true;
    } catch (error) {
      logEvent('error', 'Database health check failed', { error });
      return false;
    }
  }

  async getLatency(): Promise<number> {
    const measurements: number[] = [];
    
    for (let i = 0; i < 5; i++) {
      const startTime = Date.now();
      try {
        await prisma.$queryRaw`SELECT 1`;
        measurements.push(Date.now() - startTime);
      } catch (error) {
        logEvent('error', 'Database latency check failed', { error });
      }
    }

    return measurements.length > 0
      ? measurements.reduce((a, b) => a + b, 0) / measurements.length
      : -1;
  }
} 