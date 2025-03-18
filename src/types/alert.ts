export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AlertType = 'SYSTEM' | 'SECURITY' | 'BUSINESS';

export interface Alert {
  id?: string;
  severity: AlertSeverity;
  type: AlertType;
  message: string;
  data: Record<string, any>;
  timestamp: Date;
} 