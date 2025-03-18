import { 
  DisputeRepository, 
  NotificationService, 
  MediationService 
} from './interfaces';

interface Dispute {
  id: string;
  orderId: string;
  raisedBy: {
    id: string;
    type: 'FARMER' | 'CONSUMER';
  };
  type: 'QUALITY' | 'DELIVERY' | 'PAYMENT' | 'OTHER';
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'ESCALATED';
  description: {
    en: string;
    ta: string;
  };
  evidence: Array<{
    type: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
    url: string;
    timestamp: Date;
  }>;
  resolution?: {
    decision: string;
    compensation?: number;
    actionItems: string[];
  };
}

interface DisputeRecord extends Dispute {
  createdAt: Date;
  updatedAt: Date;
  mediatorId?: string;
}

export class DisputeResolutionService {
  private readonly disputeRepository: DisputeRepository;
  private readonly notificationService: NotificationService;
  private readonly mediationService: MediationService;

  constructor(
    disputeRepository: DisputeRepository,
    notificationService: NotificationService,
    mediationService: MediationService
  ) {
    this.disputeRepository = disputeRepository;
    this.notificationService = notificationService;
    this.mediationService = mediationService;
  }

  private async createDisputeRecord(details: Partial<DisputeRecord>): Promise<string> {
    const dispute = await this.disputeRepository.create({
      ...details,
      status: 'OPEN',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return dispute.id;
  }

  private async notifyParties(orderId: string, disputeId: string): Promise<void> {
    const order = await this.disputeRepository.getOrderDetails(orderId);
    await Promise.all([
      this.notificationService.notifyFarmer(order.farmerId, disputeId),
      this.notificationService.notifyConsumer(order.consumerId, disputeId)
    ]);
  }

  private async attemptAutoResolution(disputeId: string): Promise<boolean> {
    const dispute = await this.disputeRepository.findById(disputeId);
    return this.mediationService.attemptAutoResolution(dispute);
  }

  private async assignMediator(disputeId: string): Promise<void> {
    const mediator = await this.mediationService.findAvailableMediator();
    await this.disputeRepository.assignMediator(disputeId, mediator.id);
  }

  private async updateDisputeStatus(
    disputeId: string,
    status: Dispute['status'],
    resolution?: Dispute['resolution']
  ): Promise<void> {
    await this.disputeRepository.updateStatus(disputeId, status, resolution);
  }

  private async executeResolution(
    disputeId: string,
    resolution: Dispute['resolution']
  ): Promise<void> {
    await this.mediationService.executeResolution(disputeId, resolution);
  }

  private async notifyResolution(disputeId: string): Promise<void> {
    const dispute = await this.disputeRepository.findById(disputeId);
    await this.notificationService.notifyDisputeResolution(dispute);
  }

  async raiseDispute(
    orderId: string,
    userId: string,
    userType: 'FARMER' | 'CONSUMER',
    details: Omit<Dispute, 'id' | 'status'>
  ): Promise<string> {
    // Create dispute record
    const disputeId = await this.createDisputeRecord({
      ...details,
      raisedBy: { id: userId, type: userType }
    });

    // Notify relevant parties
    await this.notifyParties(orderId, disputeId);

    // Start automated resolution if possible
    const canAutoResolve = await this.attemptAutoResolution(disputeId);
    
    if (!canAutoResolve) {
      // Assign to human mediator
      await this.assignMediator(disputeId);
    }

    return disputeId;
  }

  async resolveDispute(
    disputeId: string,
    resolution: Dispute['resolution']
  ): Promise<void> {
    await this.updateDisputeStatus(disputeId, 'RESOLVED', resolution);
    await this.executeResolution(disputeId, resolution);
    await this.notifyResolution(disputeId);
  }
} 