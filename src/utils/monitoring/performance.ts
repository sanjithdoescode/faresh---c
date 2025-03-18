import { logEvent } from './logger';
import { Metrics } from 'prom-client';

const metrics = new Metrics();

export const performanceMiddleware = (req, res, next) => {
  const start = process.hrtime();

  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds * 1000 + nanoseconds / 1000000;

    metrics.httpRequestDuration.observe({
      method: req.method,
      route: req.route?.path || 'unknown',
      status_code: res.statusCode
    }, duration);

    if (duration > 1000) { // Log slow requests
      logEvent('warn', 'Slow request detected', {
        path: req.path,
        duration,
        method: req.method
      });
    }
  });

  next();
}; 