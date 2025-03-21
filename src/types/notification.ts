export type NotificationType = 
  | 'LEARNING_RECOMMENDATION' 
  | 'CERTIFICATE_AWARDED' 
  | 'SETTLEMENT_NOTIFICATION' 
  | 'SYSTEM_ALERT'
  | 'QUALITY_ALERT'
  | 'NEW_POST'
  | 'NEW_COMMENT';

export interface NotificationMessage {
  type: NotificationType;
  message?: {
    en: string;
    ta: string;
  };
  modules?: Array<{
    id: string;
    title: {
      en: string;
      ta: string;
    };
  }>;
  certificate?: {
    id: string;
    moduleId: string;
    completionDate: Date;
  };
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
} 