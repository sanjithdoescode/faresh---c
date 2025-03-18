interface SettlementBatch {
  id: string;
  farmerId: string;
  orders: Array<{
    orderId: string;
    amount: number;
    commission: number;
  }>;
  totalAmount: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  scheduledDate: Date;
  completedDate?: Date;
  bankDetails: {
    accountNumber: string;
    ifscCode: string;
    accountName: string;
  };
}

export class PaymentSettlementService {
  private readonly settlementRepository: SettlementRepository;
  private readonly bankingService: BankingService;
  private readonly notificationService: NotificationService;

  constructor(
    settlementRepository: SettlementRepository,
    bankingService: BankingService,
    notificationService: NotificationService
  ) {
    this.settlementRepository = settlementRepository;
    this.bankingService = bankingService;
    this.notificationService = notificationService;
  }

  async createSettlementBatch(farmerId: string): Promise<SettlementBatch> {
    // Get pending orders for settlement
    const pendingOrders = await this.settlementRepository.getPendingOrders(farmerId);
    
    // Calculate amounts and commissions
    const processedOrders = pendingOrders.map(order => ({
      orderId: order.id,
      amount: order.amount,
      commission: this.calculateCommission(order)
    }));

    // Create settlement batch
    const batch = await this.settlementRepository.createBatch({
      farmerId,
      orders: processedOrders,
      totalAmount: this.calculateTotalAmount(processedOrders),
      status: 'PENDING',
      scheduledDate: this.getNextSettlementDate()
    });

    // Schedule settlement
    await this.scheduleSettlement(batch.id);

    return batch;
  }

  async processSettlement(batchId: string): Promise<void> {
    const batch = await this.settlementRepository.findById(batchId);
    
    try {
      // Initiate bank transfer
      await this.bankingService.initiateTransfer({
        amount: batch.totalAmount,
        bankDetails: batch.bankDetails,
        reference: batchId
      });

      // Update status
      await this.settlementRepository.updateStatus(batchId, 'COMPLETED');
      
      // Notify farmer
      await this.notificationService.sendSettlementNotification(batch);
    } catch (error) {
      await this.handleSettlementFailure(batch, error);
    }
  }

  private calculateCommission(order: { amount: number }): number {
    const COMMISSION_RATE = 0.02; // 2% commission
    return order.amount * COMMISSION_RATE;
  }

  private calculateTotalAmount(orders: Array<{ amount: number; commission: number }>): number {
    return orders.reduce((total, order) => total + order.amount - order.commission, 0);
  }

  private getNextSettlementDate(): Date {
    const date = new Date();
    // Schedule for next business day
    date.setDate(date.getDate() + 1);
    while (date.getDay() === 0 || date.getDay() === 6) {
      date.setDate(date.getDate() + 1);
    }
    return date;
  }

  private async scheduleSettlement(batchId: string): Promise<void> {
    await this.settlementRepository.scheduleSettlement(batchId);
  }

  private async handleSettlementFailure(batch: SettlementBatch, error: Error): Promise<void> {
    await this.settlementRepository.updateStatus(batch.id, 'FAILED');
    await this.notificationService.sendSettlementFailureNotification(batch.farmerId, error.message);
    await this.logFailure(batch, error);
  }

  private async logFailure(batch: SettlementBatch, error: Error): Promise<void> {
    // Log the failure for monitoring and debugging
    console.error('Settlement failure:', {
      batchId: batch.id,
      farmerId: batch.farmerId,
      amount: batch.totalAmount,
      error: error.message,
      timestamp: new Date()
    });

    // You might want to store this in a proper logging system
    await this.settlementRepository.logFailure(batch.id, {
      error: error.message,
      timestamp: new Date()
    });
  }
} 