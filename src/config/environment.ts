interface EnvironmentConfig {
  database: {
    url: string;
    maxConnections: number;
    ssl: boolean;
  };
  redis: {
    url: string;
    password: string;
  };
  security: {
    jwtSecret: string;
    rateLimitRequests: number;
    rateLimitWindowMs: number;
  };
  monitoring: {
    sentryDsn: string;
    logLevel: string;
  };
}

const environments: Record<string, EnvironmentConfig> = {
  development: {
    database: {
      url: process.env.DEV_DATABASE_URL!,
      maxConnections: 10,
      ssl: false
    },
    // ... other config
  },
  staging: {
    // Staging config
  },
  production: {
    // Production config
  }
};

export const config = environments[process.env.NODE_ENV || 'development']; 