import { Alert } from './alert';
import { Product } from './product';
import { Vehicle, DeliveryRequest, Route, DeliveryStatus } from './transportation';

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

export interface VehicleRepository {
  findAvailable(location: DeliveryRequest['pickupLocation'], weight: number): Promise<Vehicle[]>;
  updateLocation(vehicleId: string, location: Vehicle['currentLocation']): Promise<void>;
  getById(id: string): Promise<Vehicle>;
}

export interface DeliveryRepository {
  create(data: {
    vehicleId: string;
    request: DeliveryRequest;
    route: Route;
    cost: number;
  }): Promise<string>;
  getById(id: string): Promise<DeliveryRequest>;
  updateStatus(id: string, status: string): Promise<void>;
}

export interface TrackingService {
  initialize(deliveryId: string): Promise<void>;
  getStatus(deliveryId: string): Promise<DeliveryStatus>;
  updateLocation(deliveryId: string, location: { latitude: number; longitude: number }): Promise<void>;
} 