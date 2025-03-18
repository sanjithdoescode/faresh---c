// Analytics service for farmer insights

interface SalesMetrics {
  dailyRevenue: number;
  popularProducts: Array<{product: string, quantity: number}>;
  peakHours: Array<{hour: number, orders: number}>;
}

export class FarmerAnalytics {
  async calculateMetrics(farmerId: string): Promise<SalesMetrics> {
    const orders = await prisma.order.findMany({
      where: {
        farmerId,
        status: 'DELIVERED',
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      },
      include: {
        items: true
      }
    });
    
    // Calculate metrics
    return {
      dailyRevenue: this.calculateAverageDailyRevenue(orders),
      popularProducts: this.identifyPopularProducts(orders),
      peakHours: this.analyzePeakHours(orders)
    };
  }
} 