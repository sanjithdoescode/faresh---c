import { S3 } from 'aws-sdk';
import { logEvent } from '../../../utils/monitoring/logger';

export class StorageHealthCheck {
  private readonly s3: S3;
  private readonly bucket: string;

  constructor(s3: S3, bucket: string) {
    this.s3 = s3;
    this.bucket = bucket;
  }

  async check(): Promise<boolean> {
    try {
      const startTime = Date.now();
      
      // Check if we can list objects in the bucket
      await this.s3.listObjectsV2({
        Bucket: this.bucket,
        MaxKeys: 1
      }).promise();
      
      const duration = Date.now() - startTime;
      logEvent('info', 'Storage health check completed', { duration });
      
      return true;
    } catch (error) {
      logEvent('error', 'Storage health check failed', { error });
      return false;
    }
  }

  async getLatency(): Promise<number> {
    const measurements: number[] = [];
    
    for (let i = 0; i < 3; i++) {
      const startTime = Date.now();
      try {
        await this.s3.headBucket({ Bucket: this.bucket }).promise();
        measurements.push(Date.now() - startTime);
      } catch (error) {
        logEvent('error', 'Storage latency check failed', { error });
      }
    }

    return measurements.length > 0
      ? measurements.reduce((a, b) => a + b, 0) / measurements.length
      : -1;
  }
} 