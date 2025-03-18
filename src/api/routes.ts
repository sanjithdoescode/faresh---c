// RESTful API endpoints with versioning

const API_ROUTES = {
  v1: {
    farmers: {
      list: '/api/v1/farmers',
      nearby: '/api/v1/farmers/nearby',
      products: '/api/v1/farmers/:id/products',
      orders: '/api/v1/farmers/:id/orders',
    },
    consumers: {
      orders: '/api/v1/consumers/:id/orders',
      favorites: '/api/v1/consumers/:id/favorites',
    },
    products: {
      search: '/api/v1/products/search',
      details: '/api/v1/products/:id',
    },
    orders: {
      create: '/api/v1/orders',
      update: '/api/v1/orders/:id',
      status: '/api/v1/orders/:id/status',
    }
  }
} 