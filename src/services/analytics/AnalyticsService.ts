import { logEvent } from '../../utils/monitoring/logger';

interface AnalyticsEvent {
  eventType: 'PAGE_VIEW' | 'ORDER' | 'SEARCH' | 'PRODUCT_VIEW' | 'USER_ACTION';
  userId?: string;
  userType: 'FARMER' | 'CONSUMER';
  data: Record<string, any>;
  timestamp: Date;
}

export class AnalyticsService {
  private readonly analyticsQueue: AnalyticsEvent[] = [];
  private readonly batchSize = 100;

  async trackEvent(event: Omit<AnalyticsEvent, 'timestamp'>): Promise<void> {
    const completeEvent = {
      ...event,
      timestamp: new Date()
    };

    this.analyticsQueue.push(completeEvent);

    if (this.analyticsQueue.length >= this.batchSize) {
      await this.flushEvents();
    }
  }

  private async flushEvents(): Promise<void> {
    try {
      const events = [...this.analyticsQueue];
      this.analyticsQueue.length = 0;

      await Promise.all([
        this.sendToAnalyticsDatabase(events),
        this.updateMetrics(events)
      ]);
    } catch (error) {
      logEvent('error', 'Analytics flush failed', { error });
      // Requeue failed events
      this.analyticsQueue.push(...events);
    }
  }

  private async sendToAnalyticsDatabase(events: AnalyticsEvent[]): Promise<void> {
    try {
      await this.analyticsRepository.batchInsert(events);
    } catch (error) {
      logEvent('error', 'Failed to send events to analytics database', { error });
      throw error;
    }
  }

  private async updateMetrics(events: AnalyticsEvent[]): Promise<void> {
    const metrics = this.aggregateMetrics(events);
    await this.metricsRepository.updateMetrics(metrics);
  }

  private aggregateMetrics(events: AnalyticsEvent[]): Record<string, number> {
    return events.reduce((acc, event) => {
      const key = `${event.eventType}_${event.userType}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }
} 