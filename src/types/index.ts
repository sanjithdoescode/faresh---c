export interface Product {
  id: string;
  name: {
    en: string;
    ta: string;
  };
  price: number;
  quantity: number;
  skills: string[]; // Required skills for farming this product
}

export interface SkillPriority {
  [key: string]: number;
}

export interface NotificationMessage {
  type: 'LEARNING_RECOMMENDATION' | 'CERTIFICATE_AWARDED' | 'SETTLEMENT_NOTIFICATION';
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
} 