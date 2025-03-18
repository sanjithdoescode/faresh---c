import { logEvent } from '../../utils/monitoring/logger';
import { ConfigValidator, ValidatedServiceConfig } from './ConfigValidator';

interface ServiceConfig {
  redis: {
    host: string;
    port: number;
    password: string;
  };
  storage: {
    bucket: string;
    region: string;
  };
  monitoring: {
    errorThreshold: number;
    latencyThreshold: number;
    metricsInterval: number;
  };
}

export class ConfigurationService {
  private config: ValidatedServiceConfig;

  constructor(environment: string) {
    this.config = this.loadConfig(environment);
  }

  private loadConfig(environment: string): ValidatedServiceConfig {
    try {
      const rawConfig = require(`../../config/${environment}.json`);
      return ConfigValidator.validate(rawConfig);
    } catch (error) {
      logEvent('error', 'Failed to load configuration', { error, environment });
      throw new Error(`Configuration load failed for environment: ${environment}`);
    }
  }

  getRedisConfig(): ServiceConfig['redis'] {
    return this.config.redis;
  }

  getStorageConfig(): ServiceConfig['storage'] {
    return this.config.storage;
  }

  getMonitoringConfig(): ServiceConfig['monitoring'] {
    return this.config.monitoring;
  }
} 