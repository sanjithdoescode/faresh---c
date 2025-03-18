import { Alert } from '../types/alert';
import { prisma } from '../lib/prisma';

export class AlertRepository {
  async create(alert: Alert): Promise<void> {
    await prisma.alert.create({
      data: {
        severity: alert.severity,
        type: alert.type,
        message: alert.message,
        data: alert.data,
        timestamp: alert.timestamp
      }
    });
  }

  async findById(id: string): Promise<Alert> {
    const alert = await prisma.alert.findUnique({
      where: { id }
    });
    if (!alert) throw new Error(`Alert not found: ${id}`);
    return alert as Alert;
  }

  async findByType(type: Alert['type']): Promise<Alert[]> {
    const alerts = await prisma.alert.findMany({
      where: { type },
      orderBy: { timestamp: 'desc' }
    });
    return alerts as Alert[];
  }
} 