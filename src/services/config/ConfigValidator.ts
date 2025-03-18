import { z } from 'zod';

const ServiceConfigSchema = z.object({
  redis: z.object({
    host: z.string().min(1),
    port: z.number().int().positive(),
    password: z.string()
  }),
  storage: z.object({
    bucket: z.string().min(1),
    region: z.string().min(1)
  }),
  monitoring: z.object({
    errorThreshold: z.number().min(0).max(100),
    latencyThreshold: z.number().positive(),
    metricsInterval: z.number().positive()
  })
});

export type ValidatedServiceConfig = z.infer<typeof ServiceConfigSchema>;

export class ConfigValidator {
  static validate(config: unknown): ValidatedServiceConfig {
    try {
      return ServiceConfigSchema.parse(config);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const issues = error.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message
        }));
        throw new Error(`Configuration validation failed: ${JSON.stringify(issues)}`);
      }
      throw error;
    }
  }
} 