import { PrismaClient } from '@prisma/client';
import { Vehicle } from '../types/transportation';
import { VehicleRepository } from '../types/repositories';

export class VehicleRepositoryImpl implements VehicleRepository {
  constructor(private prisma: PrismaClient) {}

  async findAvailable(location: { latitude: number; longitude: number }, weight: number): Promise<Vehicle[]> {
    const vehicles = await this.prisma.vehicle.findMany({
      where: {
        capacity: { gte: weight },
        status: 'AVAILABLE'
      }
    });

    return vehicles.map(v => ({
      id: v.id,
      type: v.type as 'BIKE' | 'VAN' | 'TRUCK',
      capacity: v.capacity,
      currentLocation: {
        latitude: v.latitude,
        longitude: v.longitude
      }
    }));
  }

  async updateLocation(vehicleId: string, location: Vehicle['currentLocation']): Promise<void> {
    await this.prisma.vehicle.update({
      where: { id: vehicleId },
      data: {
        latitude: location.latitude,
        longitude: location.longitude
      }
    });
  }

  async getById(id: string): Promise<Vehicle> {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id }
    });
    if (!vehicle) throw new Error(`Vehicle not found: ${id}`);

    return {
      id: vehicle.id,
      type: vehicle.type as 'BIKE' | 'VAN' | 'TRUCK',
      capacity: vehicle.capacity,
      currentLocation: {
        latitude: vehicle.latitude,
        longitude: vehicle.longitude
      }
    };
  }
} 