import { prisma } from '../lib/prisma';
import { Vehicle } from '../types/transportation';
import { VehicleRepository as IVehicleRepository } from '../types/repositories';

export class VehicleRepository implements IVehicleRepository {
  async findAvailable(location: { latitude: number; longitude: number }, weight: number): Promise<Vehicle[]> {
    return prisma.$queryRaw`
      SELECT *, 
        (6371 * acos(cos(radians(${location.latitude})) 
        * cos(radians(latitude)) 
        * cos(radians(longitude) 
        - radians(${location.longitude})) 
        + sin(radians(${location.latitude})) 
        * sin(radians(latitude)))) AS distance 
      FROM "Vehicle"
      WHERE "capacity" >= ${weight}
      AND "status" = 'AVAILABLE'
      HAVING distance < 10
      ORDER BY distance
      LIMIT 5;
    `;
  }

  async updateLocation(vehicleId: string, location: Vehicle['currentLocation']): Promise<void> {
    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: {
        latitude: location.latitude,
        longitude: location.longitude
      }
    });
  }

  async getById(id: string): Promise<Vehicle> {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id }
    });
    if (!vehicle) throw new Error(`Vehicle not found: ${id}`);
    return vehicle;
  }
} 