export interface DisputeRepository {
  create(dispute: Partial<DisputeRecord>): Promise<DisputeRecord>;
  findById(id: string): Promise<DisputeRecord>;
  getOrderDetails(orderId: string): Promise<{ farmerId: string; consumerId: string }>;
  assignMediator(disputeId: string, mediatorId: string): Promise<void>;
  updateStatus(disputeId: string, status: Dispute['status'], resolution?: Dispute['resolution']): Promise<void>;
}

export interface NotificationService {
  notifyFarmer(farmerId: string, disputeId: string): Promise<void>;
  notifyConsumer(consumerId: string, disputeId: string): Promise<void>;
  notifyDisputeResolution(dispute: DisputeRecord): Promise<void>;
  sendSettlementNotification(batch: SettlementBatch): Promise<void>;
  send(userId: string, message: NotificationMessage): Promise<void>;
  sendCertificateNotification(farmerId: string, certificate: {
    id: string;
    moduleId: string;
    completionDate: Date;
  }): Promise<void>;
  sendSettlementFailureNotification(farmerId: string, errorMessage: string): Promise<void>;
}

export interface MediationService {
  attemptAutoResolution(dispute: DisputeRecord): Promise<boolean>;
  findAvailableMediator(): Promise<{ id: string }>;
  executeResolution(disputeId: string, resolution: Dispute['resolution']): Promise<void>;
} 