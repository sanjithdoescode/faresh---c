interface AnalyticsDashboard {
  overview: {
    totalRevenue: number;
    orderCount: number;
    activeCustomers: number;
    productsSold: number;
  };
  trends: {
    daily: MetricTrend[];
    weekly: MetricTrend[];
    monthly: MetricTrend[];
  };
  topProducts: Array<{
    productId: string;
    name: string;
    quantity: number;
    revenue: number;
  }>;
  customerInsights: {
    retention: number;
    satisfaction: number;
    repeatOrders: number;
  };
}

export class DashboardService {
  async getFarmerDashboard(
    farmerId: string,
    timeframe: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR'
  ): Promise<AnalyticsDashboard> {
    const [orders, products, customers] = await Promise.all([
      this.getOrderAnalytics(farmerId, timeframe),
      this.getProductAnalytics(farmerId, timeframe),
      this.getCustomerAnalytics(farmerId, timeframe)
    ]);

    // Generate insights
    const insights = this.generateInsights(orders, products, customers);

    // Add recommendations based on analytics
    const recommendations = await this.generateRecommendations(insights);

    return {
      overview: this.calculateOverview(orders),
      trends: this.calculateTrends(orders, timeframe),
      topProducts: this.getTopProducts(products),
      customerInsights: this.calculateCustomerMetrics(customers),
      recommendations
    };
  }

  private generateInsights(
    orders: OrderAnalytics[],
    products: ProductAnalytics[],
    customers: CustomerAnalytics[]
  ) {
    return {
      growthOpportunities: this.identifyGrowthOpportunities(products),
      riskAreas: this.identifyRiskAreas(orders),
      customerSegments: this.analyzeCustomerSegments(customers)
    };
  }
} 