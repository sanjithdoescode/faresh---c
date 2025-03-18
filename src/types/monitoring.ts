export interface HealthStatus {
  serverStatus: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  databaseLatency: number;
  apiLatency: number;
  errorRate: number;
}

export interface MetricData {
  name: string;
  value: number;
  timestamp: Date;
  labels?: Record<string, string>;
}

export interface SystemMetrics {
  cpu: number;
  memory: number;
  requests: number;
  errors: number;
} 