// Feature flag configuration for phased rollout

const FEATURES = {
  PHASE_1: {
    // Core marketplace features
    BASIC_AUTH: true,
    PRODUCT_LISTING: true,
    SIMPLE_ORDERS: true,
    LOCATION_SERVICES: true,
    OFFLINE_CACHE: true,
    
    // Advanced features disabled in MVP
    ANALYTICS: false,
    REVIEWS: false,
    PRICE_PREDICTIONS: false
  }
};

export const isFeatureEnabled = (feature: string): boolean => {
  return FEATURES.PHASE_1[feature] || false;
}; 