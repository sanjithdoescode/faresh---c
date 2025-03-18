import { Alert } from './alert';
import { Product } from './product';

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

export interface ProductRepository {
  findByFarmerId(farmerId: string): Promise<Product[]>;
  getProductStats(): Promise<{
    total: number;
    outOfStock: number;
    lowStock: number;
  }>;
} 