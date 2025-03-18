interface WeatherForecast {
  date: Date;
  temperature: {
    min: number;
    max: number;
    current: number;
  };
  rainfall: {
    probability: number;
    amount: number; // in mm
  };
  humidity: number;
  windSpeed: number;
  alerts: string[];
}

export class WeatherService {
  async getFarmWeatherForecast(
    location: { lat: number; lng: number },
    days: number = 7
  ): Promise<WeatherForecast[]> {
    try {
      // Fetch weather data from multiple sources for accuracy
      const [primaryData, secondaryData] = await Promise.all([
        this.fetchPrimaryWeatherData(location, days),
        this.fetchSecondaryWeatherData(location, days)
      ]);

      // Combine and normalize data
      const forecast = this.normalizeWeatherData(primaryData, secondaryData);

      // Add farming-specific alerts
      return this.addFarmingAlerts(forecast);
    } catch (error) {
      console.error('Weather forecast failed:', error);
      return this.getOfflineForecast(location);
    }
  }

  private addFarmingAlerts(forecast: WeatherForecast[]): WeatherForecast[] {
    return forecast.map(day => ({
      ...day,
      alerts: [
        ...day.alerts,
        ...this.generateFarmingRecommendations(day)
      ]
    }));
  }
} 