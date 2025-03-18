import { DeliveryRequest, DeliveryStatus, Vehicle, Route } from '../types/transportation';
import { VehicleRepository, DeliveryRepository, TrackingService } from '../types/repositories';

export class TransportationService {
  private readonly vehicleRepository: VehicleRepository;
  private readonly deliveryRepository: DeliveryRepository;
  private readonly trackingService: TrackingService;

  constructor(
    vehicleRepository: VehicleRepository,
    deliveryRepository: DeliveryRepository,
    trackingService: TrackingService
  ) {
    this.vehicleRepository = vehicleRepository;
    this.deliveryRepository = deliveryRepository;
    this.trackingService = trackingService;
  }

  private async findAvailableVehicles(
    location: DeliveryRequest['pickupLocation'],
    items: DeliveryRequest['items']
  ): Promise<Vehicle[]> {
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    return this.vehicleRepository.findAvailable(location, totalWeight);
  }

  private async optimizeRoute(
    pickup: DeliveryRequest['pickupLocation'],
    dropoff: DeliveryRequest['dropLocation']
  ): Promise<Route> {
    // Implementation for route optimization
    return {
      distance: 0,
      duration: 0,
      waypoints: [pickup, dropoff]
    };
  }

  private calculateDeliveryCost(
    route: Route,
    items: DeliveryRequest['items'],
    vehicle: Vehicle
  ): number {
    const baseCost = route.distance * 2; // Rs. 2 per km
    const weightCost = items.reduce((sum, item) => sum + item.weight, 0) * 0.5; // Rs. 0.5 per kg
    return baseCost + weightCost;
  }

  private async assignDelivery(
    vehicle: Vehicle,
    request: DeliveryRequest,
    route: Route,
    cost: number
  ): Promise<string> {
    return this.deliveryRepository.create({
      vehicleId: vehicle.id,
      request,
      route,
      cost
    });
  }

  private async initializeTracking(deliveryId: string): Promise<void> {
    await this.trackingService.initialize(deliveryId);
  }

  private async getRealtimeStatus(deliveryId: string): Promise<DeliveryStatus> {
    return this.trackingService.getStatus(deliveryId);
  }

  async arrangeDelivery(request: DeliveryRequest): Promise<string> {
    const availableVehicles = await this.findAvailableVehicles(
      request.pickupLocation,
      request.items
    );

    if (availableVehicles.length === 0) {
      throw new Error('No vehicles available');
    }

    const optimizedRoute = await this.optimizeRoute(
      request.pickupLocation,
      request.dropLocation
    );

    const cost = this.calculateDeliveryCost(
      optimizedRoute,
      request.items,
      availableVehicles[0]
    );

    const deliveryId = await this.assignDelivery(
      availableVehicles[0],
      request,
      optimizedRoute,
      cost
    );

    await this.initializeTracking(deliveryId);

    return deliveryId;
  }

  async trackDelivery(deliveryId: string): Promise<DeliveryStatus> {
    return this.getRealtimeStatus(deliveryId);
  }
} 