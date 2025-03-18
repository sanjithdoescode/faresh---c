interface CropPlan {
  farmerId: string;
  season: 'RABI' | 'KHARIF' | 'ZAID';
  year: number;
  crops: Array<{
    cropId: string;
    name: {
      en: string;
      ta: string;
    };
    area: number; // in acres
    expectedYield: number;
    plantingDate: Date;
    harvestDate: Date;
    estimatedRevenue: number;
    requirements: {
      water: number; // in liters
      fertilizer: number; // in kg
      labor: number; // in person-days
    };
  }>;
  rotationStrategy: string[];
  risks: Array<{
    type: string;
    probability: number;
    mitigation: string;
  }>;
}

export class CropPlanningService {
  async generateCropPlan(
    farmerId: string,
    season: CropPlan['season'],
    preferences: {
      riskTolerance: number;
      laborAvailability: number;
      waterAvailability: number;
    }
  ): Promise<CropPlan> {
    // Get environmental data
    const [soil, climate, market] = await Promise.all([
      this.getSoilData(farmerId),
      this.getClimateData(farmerId),
      this.getMarketProjections(season)
    ]);

    // Generate optimal crop mix
    const cropMix = await this.optimizeCropMix(
      soil,
      climate,
      market,
      preferences
    );

    // Create detailed plan
    const plan = await this.createDetailedPlan(cropMix, season);

    // Add risk analysis
    const risks = await this.assessRisks(plan, climate, market);

    return {
      ...plan,
      risks,
      rotationStrategy: this.generateRotationStrategy(plan.crops)
    };
  }

  async updatePlanProgress(
    farmerId: string,
    planId: string,
    progress: {
      cropId: string;
      stage: string;
      completedTasks: string[];
      issues?: string[];
    }
  ): Promise<void> {
    await this.trackProgress(planId, progress);
    
    // Generate alerts if needed
    const alerts = this.checkForIssues(progress);
    if (alerts.length > 0) {
      await this.notifyFarmer(farmerId, alerts);
    }
  }
} 