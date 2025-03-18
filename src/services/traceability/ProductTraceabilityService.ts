import { TraceabilityRecord } from '@prisma/client';
import { TraceabilityRepository, NotificationService } from '../../types/services';

const QUALITY_THRESHOLDS = {
  temperature: { min: 15, max: 30 },
  humidity: { min: 40, max: 70 }
} as const;

type QualityParameter = keyof typeof QUALITY_THRESHOLDS;

interface TraceabilityRecord {
  id: string;
  productId: string;
  farmerId: string;
  timestamp: Date;
  stage: 'PLANTING' | 'GROWING' | 'HARVESTING' | 'STORAGE' | 'TRANSPORT' | 'DELIVERY';
  data: {
    location: {
      lat: number;
      lng: number;
    };
    temperature?: number;
    humidity?: number;
    handlingMethod?: string;
    qualityChecks?: Array<{
      parameter: string;
      value: number;
      unit: string;
    }>;
  };
}

export class ProductTraceabilityService {
  private readonly traceabilityRepository: TraceabilityRepository;
  private readonly notificationService: NotificationService;

  constructor(
    traceabilityRepository: TraceabilityRepository,
    notificationService: NotificationService
  ) {
    this.traceabilityRepository = traceabilityRepository;
    this.notificationService = notificationService;
  }

  async recordTraceabilityEvent(event: Omit<TraceabilityRecord, 'id'>): Promise<string> {
    const record = await this.traceabilityRepository.createRecord({
      ...event,
      timestamp: new Date()
    });

    // Update product status
    await this.traceabilityRepository.updateProductStatus(record.productId, record.stage);

    return record.id;
  }

  async getProductHistory(productId: string): Promise<TraceabilityRecord[]> {
    return this.traceabilityRepository.getProductHistory(productId);
  }

  private async checkQualityIssues(record: TraceabilityRecord): Promise<void> {
    if (record.data.qualityChecks) {
      const issues = this.identifyQualityIssues(record.data.qualityChecks);
      if (issues.length > 0) {
        await this.notificationService.notifyFarmer(record.farmerId, {
          type: 'QUALITY_ALERT',
          message: {
            en: `Quality issues detected: ${issues.join(', ')}`,
            ta: `தர சிக்கல்கள் கண்டறியப்பட்டன: ${issues.join(', ')}`
          }
        });
      }
    }
  }

  private identifyQualityIssues(checks: TraceabilityRecord['data']['qualityChecks']): string[] {
    const issues: string[] = [];

    checks?.forEach(check => {
      const parameter = check.parameter as QualityParameter;
      const threshold = QUALITY_THRESHOLDS[parameter];
      if (threshold && (check.value < threshold.min || check.value > threshold.max)) {
        issues.push(`${check.parameter} out of range`);
      }
    });

    return issues;
  }
} 