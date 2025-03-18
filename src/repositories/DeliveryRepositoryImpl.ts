import { PrismaClient } from '@prisma/client';
import { DeliveryRequest, Route } from '../types/transportation';
import { DeliveryRepository } from '../types/repositories';

export class DeliveryRepositoryImpl implements DeliveryRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: {
    vehicleId: string;
    request: DeliveryRequest;
    route: Route;
    cost: number;
  }): Promise<string> {
    const delivery = await this.prisma.delivery.create({
      data: {
        vehicleId: data.vehicleId,
        pickupLatitude: data.request.pickupLocation.latitude,
        pickupLongitude: data.request.pickupLocation.longitude,
        dropLatitude: data.request.dropLocation.latitude,
        dropLongitude: data.request.dropLocation.longitude,
        status: 'PENDING',
        cost: data.cost,
        scheduledTime: data.request.scheduledTime
      }
    });

    return delivery.id;
  }

  async getById(id: string): Promise<DeliveryRequest> {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id }
    });
    if (!delivery) throw new Error(`Delivery not found: ${id}`);

    return {
      pickupLocation: {
        latitude: delivery.pickupLatitude,
        longitude: delivery.pickupLongitude
      },
      dropLocation: {
        latitude: delivery.dropLatitude,
        longitude: delivery.dropLongitude
      },
      items: [], // Need to implement items relationship in schema
      scheduledTime: delivery.scheduledTime || undefined
    };
  }

  async updateStatus(id: string, status: string): Promise<void> {
    await this.prisma.delivery.update({
      where: { id },
      data: { status }
    });
  }
} 