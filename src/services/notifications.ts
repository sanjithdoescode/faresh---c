// Notification service supporting SMS and in-app notifications

interface NotificationPayload {
  userId: string;
  type: 'ORDER_UPDATE' | 'PAYMENT_RECEIVED' | 'LOW_INVENTORY' | 'PRICE_ALERT';
  message: {
    en: string;
    ta: string;
  };
  data?: Record<string, any>;
}

export class NotificationService {
  async sendNotification(payload: NotificationPayload): Promise<void> {
    try {
      // Send SMS for critical updates (preferred by farmers)
      if (this.isCriticalUpdate(payload.type)) {
        await this.sendSMS(payload);
      }

      // Store notification for in-app display
      await this.storeNotification(payload);

      // Send push notification if user has app installed
      if (await this.hasAppInstalled(payload.userId)) {
        await this.sendPushNotification(payload);
      }
    } catch (error) {
      console.error('Notification failed:', error);
      // Queue for retry if failed
      await this.queueForRetry(payload);
    }
  }

  private isCriticalUpdate(type: string): boolean {
    return ['ORDER_UPDATE', 'PAYMENT_RECEIVED'].includes(type);
  }
} 