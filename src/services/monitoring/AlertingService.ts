import { logEvent } from '../../utils/monitoring/logger';
import { NotificationService } from '../notification/NotificationService';
import { AlertRepository } from '../../repositories/AlertRepository';
import { NotificationType } from '../../types/notification';

interface Alert {
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  type: 'SYSTEM' | 'SECURITY' | 'BUSINESS';
  message: string;
  data: Record<string, any>;
  timestamp: Date;
}

export class AlertingService {
  private readonly notificationService: NotificationService;
  private readonly alertRepository: AlertRepository;

  constructor(
    notificationService: NotificationService,
    alertRepository: AlertRepository
  ) {
    this.notificationService = notificationService;
    this.alertRepository = alertRepository;
  }

  async raiseAlert(alert: Omit<Alert, 'timestamp'>): Promise<void> {
    const fullAlert = {
      ...alert,
      timestamp: new Date()
    };

    // Log alert
    logEvent('alert', alert.message, alert.data);

    // Notify relevant parties based on severity and type
    await this.notifyStakeholders(fullAlert);

    // Store alert for historical tracking
    await this.storeAlert(fullAlert);
  }

  private async notifyStakeholders(alert: Alert): Promise<void> {
    const stakeholders = await this.getStakeholdersForAlert(alert);
    
    await Promise.all(
      stakeholders.map(stakeholder =>
        this.notificationService.send(stakeholder.id, {
          type: 'SYSTEM_ALERT' as NotificationType,
          message: {
            en: alert.message,
            ta: this.translateAlert(alert.message)
          },
          severity: alert.severity
        })
      )
    );
  }

  private async getStakeholdersForAlert(alert: Alert): Promise<Array<{ id: string }>> {
    // Implementation to determine who should be notified based on alert type and severity
    return [];
  }

  private translateAlert(message: string): string {
    // Implementation to translate alert messages to Tamil
    return message;
  }

  private async storeAlert(alert: Alert): Promise<void> {
    await this.alertRepository.create(alert);
  }
} 