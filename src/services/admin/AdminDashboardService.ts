import { 
  MetricsRepository, 
  UserRepository, 
  OrderRepository,
  ProductRepository 
} from '../../types/repositories';

interface DashboardMetrics {
  userStats: {
    totalFarmers: number;
    totalConsumers: number;
    activeUsers: number;
  };
  transactionStats: {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
  };
  productStats: {
    totalProducts: number;
    outOfStock: number;
    lowStock: number;
  };
  systemHealth: {
    serverStatus: 'HEALTHY' | 'DEGRADED' | 'DOWN';
    databaseLatency: number;
    apiLatency: number;
    errorRate: number;
  };
}

export class AdminDashboardService {
  private readonly metricsRepository: MetricsRepository;
  private readonly userRepository: UserRepository;
  private readonly orderRepository: OrderRepository;
  private readonly productRepository: ProductRepository;

  constructor(
    metricsRepository: MetricsRepository,
    userRepository: UserRepository,
    orderRepository: OrderRepository,
    productRepository: ProductRepository
  ) {
    this.metricsRepository = metricsRepository;
    this.userRepository = userRepository;
    this.orderRepository = orderRepository;
    this.productRepository = productRepository;
  }

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const [userStats, transactionStats, productStats, systemHealth] = await Promise.all([
      this.getUserStats(),
      this.getTransactionStats(),
      this.getProductStats(),
      this.getSystemHealth()
    ]);

    return {
      userStats,
      transactionStats,
      productStats,
      systemHealth
    };
  }

  private async getUserStats(): Promise<DashboardMetrics['userStats']> {
    const stats = await this.userRepository.getStats();
    return {
      totalFarmers: stats.farmers,
      totalConsumers: stats.consumers,
      activeUsers: stats.active
    };
  }

  private async getTransactionStats(): Promise<DashboardMetrics['transactionStats']> {
    const stats = await this.orderRepository.getStats();
    return {
      totalOrders: stats.count,
      totalRevenue: stats.revenue,
      averageOrderValue: stats.revenue / stats.count
    };
  }

  private async getProductStats(): Promise<DashboardMetrics['productStats']> {
    const products = await this.productRepository.getProductStats();
    return {
      totalProducts: products.total,
      outOfStock: products.outOfStock,
      lowStock: products.lowStock
    };
  }

  private async getSystemHealth(): Promise<DashboardMetrics['systemHealth']> {
    const [dbLatency, apiLatency, errorRate] = await Promise.all([
      this.metricsRepository.getDatabaseLatency(),
      this.metricsRepository.getApiLatency(),
      this.metricsRepository.getErrorRate()
    ]);

    return {
      serverStatus: this.determineServerStatus(dbLatency, apiLatency, errorRate),
      databaseLatency: dbLatency,
      apiLatency,
      errorRate
    };
  }

  private determineServerStatus(
    dbLatency: number,
    apiLatency: number,
    errorRate: number
  ): DashboardMetrics['systemHealth']['serverStatus'] {
    if (errorRate > 5 || dbLatency > 1000 || apiLatency > 1000) {
      return 'DOWN';
    }
    if (errorRate > 1 || dbLatency > 500 || apiLatency > 500) {
      return 'DEGRADED';
    }
    return 'HEALTHY';
  }
} 