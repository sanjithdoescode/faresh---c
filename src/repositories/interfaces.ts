// Add repository interfaces
export interface FarmerRepository {
  findById(id: string): Promise<Farmer>;
}

export interface ProductRepository {
  findByFarmerId(farmerId: string): Promise<Product[]>;
  getProductStats(): Promise<{
    total: number;
    outOfStock: number;
    lowStock: number;
  }>;
}

export interface LearningRepository {
  getCompletedModules(farmerId: string): Promise<string[]>;
  findModulesByGaps(gaps: LearningGap[], language: string): Promise<LearningModule[]>;
  updateProgress(farmerId: string, moduleId: string, progress: number): Promise<void>;
  getNextModules(moduleId: string): Promise<LearningModule[]>;
  checkCertificateEligibility(farmerId: string, moduleId: string): Promise<{ isEligible: boolean }>;
  generateCertificate(farmerId: string, moduleId: string): Promise<{
    id: string;
    moduleId: string;
    completionDate: Date;
  }>;
}

export interface SettlementRepository {
  getPendingOrders(farmerId: string): Promise<Array<{
    id: string;
    amount: number;
  }>>;
  createBatch(batch: Partial<SettlementBatch>): Promise<SettlementBatch>;
  findById(batchId: string): Promise<SettlementBatch>;
  updateStatus(batchId: string, status: SettlementBatch['status']): Promise<void>;
  scheduleSettlement(batchId: string): Promise<void>;
  logFailure(batchId: string, failure: {
    error: string;
    timestamp: Date;
  }): Promise<void>;
}

export interface BankingService {
  initiateTransfer(params: {
    amount: number;
    bankDetails: SettlementBatch['bankDetails'];
    reference: string;
  }): Promise<void>;
}

export interface TraceabilityRepository {
  createRecord(record: Omit<TraceabilityRecord, 'id'>): Promise<TraceabilityRecord>;
  getProductHistory(productId: string): Promise<TraceabilityRecord[]>;
  updateProductStatus(productId: string, status: string): Promise<void>;
}

export interface CommunityRepository {
  createPost(post: Omit<CommunityPost, 'id'>): Promise<CommunityPost>;
  getPost(postId: string): Promise<CommunityPost>;
  addComment(postId: string, comment: Omit<Comment, 'id'>): Promise<Comment>;
  findUsersByInterests(tags: string[]): Promise<string[]>;
}

export interface ModerationService {
  checkContent(content: {
    text?: { en: string; ta: string };
    images?: string[];
  }): Promise<{
    approved: boolean;
    reason?: string;
  }>;
}

export interface AlertRepository {
  create(alert: Alert): Promise<void>;
  findById(id: string): Promise<Alert>;
  findByType(type: Alert['type']): Promise<Alert[]>;
}

export interface MetricsRepository {
  updateMetrics(metrics: Record<string, number>): Promise<void>;
  getStats(): Promise<{
    farmers: number;
    consumers: number;
    active: number;
  }>;
  getDatabaseLatency(): Promise<number>;
  getApiLatency(): Promise<number>;
  getErrorRate(): Promise<number>;
}

export interface UserRepository {
  getStats(): Promise<{
    farmers: number;
    consumers: number;
    active: number;
  }>;
}

export interface OrderRepository {
  getStats(): Promise<{
    count: number;
    revenue: number;
  }>;
}

export interface AnalyticsRepository {
  batchInsert(events: AnalyticsEvent[]): Promise<void>;
} 