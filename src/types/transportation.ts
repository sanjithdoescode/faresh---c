export interface DeliveryRequest {
  pickupLocation: {
    latitude: number;
    longitude: number;
  };
  dropLocation: {
    latitude: number;
    longitude: number;
  };
  items: Array<{
    id: string;
    quantity: number;
    weight: number;
  }>;
  scheduledTime?: Date;
}

export interface Vehicle {
  id: string;
  type: 'BIKE' | 'VAN' | 'TRUCK';
  capacity: number;
  currentLocation: {
    latitude: number;
    longitude: number;
  };
}

export interface DeliveryStatus {
  id: string;
  status: 'PENDING' | 'PICKUP' | 'IN_TRANSIT' | 'DELIVERED';
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
  estimatedDeliveryTime?: Date;
}

export interface Route {
  distance: number;
  duration: number;
  waypoints: Array<{
    latitude: number;
    longitude: number;
  }>;
} 