import { NotificationMessage } from '../../types';
import { NotificationService as INotificationService } from '../interfaces';
import { DisputeRecord } from '../disputeResolution';
import { SettlementBatch } from '../paymentSettlement';

export class NotificationService implements INotificationService {
  async notifyFarmer(farmerId: string, disputeId: string): Promise<void> {
    await this.sendNotification(farmerId, {
      type: 'DISPUTE_UPDATE',
      message: {
        en: `New dispute notification: ${disputeId}`,
        ta: `புதிய தகராறு அறிவிப்பு: ${disputeId}`
      }
    });
  }

  async notifyConsumer(consumerId: string, disputeId: string): Promise<void> {
    await this.sendNotification(consumerId, {
      type: 'DISPUTE_UPDATE',
      message: {
        en: `Your dispute ${disputeId} has been registered`,
        ta: `உங்கள் தகராறு ${disputeId} பதிவு செய்யப்பட்டுள்ளது`
      }
    });
  }

  async notifyDisputeResolution(dispute: DisputeRecord): Promise<void> {
    const parties = [dispute.raisedBy.id];
    if (dispute.raisedBy.type === 'FARMER') {
      // Add consumer to notification list
      const order = await this.getOrderDetails(dispute.orderId);
      parties.push(order.consumerId);
    } else {
      // Add farmer to notification list
      const order = await this.getOrderDetails(dispute.orderId);
      parties.push(order.farmerId);
    }

    await Promise.all(
      parties.map(partyId =>
        this.sendNotification(partyId, {
          type: 'DISPUTE_RESOLVED',
          message: {
            en: `Dispute ${dispute.id} has been resolved`,
            ta: `தகராறு ${dispute.id} தீர்க்கப்பட்டது`
          }
        })
      )
    );
  }

  async send(userId: string, message: NotificationMessage): Promise<void> {
    await this.sendNotification(userId, message);
  }

  async sendCertificateNotification(
    farmerId: string,
    certificate: {
      id: string;
      moduleId: string;
      completionDate: Date;
    }
  ): Promise<void> {
    await this.sendNotification(farmerId, {
      type: 'CERTIFICATE_AWARDED',
      certificate
    });
  }

  async sendSettlementNotification(batch: SettlementBatch): Promise<void> {
    await this.sendNotification(batch.farmerId, {
      type: 'SETTLEMENT_NOTIFICATION',
      message: {
        en: `Payment of ₹${batch.totalAmount} has been processed`,
        ta: `₹${batch.totalAmount} பணம் செலுத்தப்பட்டது`
      }
    });
  }

  async sendSettlementFailureNotification(
    farmerId: string,
    errorMessage: string
  ): Promise<void> {
    await this.sendNotification(farmerId, {
      type: 'SETTLEMENT_NOTIFICATION',
      message: {
        en: `Payment settlement failed: ${errorMessage}`,
        ta: `பணம் செலுத்துதல் தோல்வியடைந்தது: ${errorMessage}`
      }
    });
  }

  private async sendNotification(userId: string, message: any): Promise<void> {
    // Implementation for sending notifications via SMS, push notifications, etc.
    console.log(`Sending notification to ${userId}:`, message);
  }

  private async getOrderDetails(orderId: string): Promise<{ farmerId: string; consumerId: string }> {
    // Implementation to fetch order details
    throw new Error('Not implemented');
  }
} 