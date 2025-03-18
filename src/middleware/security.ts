import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { Express } from 'express';

export const configureSecurityMiddleware = (app: Express) => {
  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
      error: {
        en: 'Too many requests, please try again later',
        ta: 'அதிக கோரிக்கைகள், பிறகு முயற்சிக்கவும்'
      }
    }
  });

  // Apply security headers
  app.use(helmet());
  
  // Apply rate limiting to all routes
  app.use('/api/', limiter);
  
  // CORS configuration
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    next();
  });
}; 