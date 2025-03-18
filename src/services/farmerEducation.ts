import { Product, SkillPriority, NotificationMessage } from '../types';
import { 
  FarmerRepository, 
  ProductRepository, 
  LearningRepository 
} from '../repositories/interfaces';
import { NotificationService } from './interfaces';

interface LearningModule {
  id: string;
  title: {
    en: string;
    ta: string;
  };
  type: 'VIDEO' | 'ARTICLE' | 'INTERACTIVE';
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  topics: string[];
  durationMinutes: number;
  offline: boolean;
}

interface Farmer {
  id: string;
  preferredLanguage: 'en' | 'ta';
  needsOfflineAccess: boolean;
  // other farmer properties
}

interface LearningGap {
  topicId: string;
  priority: number;
  reason: string;
}

export class FarmerEducationService {
  private readonly farmerRepository: FarmerRepository;
  private readonly productRepository: ProductRepository;
  private readonly learningRepository: LearningRepository;
  private readonly notificationService: NotificationService;

  constructor(
    farmerRepository: FarmerRepository,
    productRepository: ProductRepository,
    learningRepository: LearningRepository,
    notificationService: NotificationService
  ) {
    this.farmerRepository = farmerRepository;
    this.productRepository = productRepository;
    this.learningRepository = learningRepository;
    this.notificationService = notificationService;
  }

  private async getFarmerProfile(farmerId: string): Promise<Farmer> {
    return this.farmerRepository.findById(farmerId);
  }

  private async getFarmerProducts(farmerId: string): Promise<Product[]> {
    return this.productRepository.findByFarmerId(farmerId);
  }

  private async analyzeLearningGaps(
    farmer: Farmer,
    products: Product[]
  ): Promise<LearningGap[]> {
    const completedModules = await this.learningRepository.getCompletedModules(farmer.id);
    const requiredSkills = this.getRequiredSkills(products);
    
    return this.identifyGaps(completedModules, requiredSkills);
  }

  private async getPersonalizedContent(
    gaps: LearningGap[],
    language: string
  ): Promise<LearningModule[]> {
    return this.learningRepository.findModulesByGaps(gaps, language);
  }

  private async updateLearningProgress(
    farmerId: string,
    moduleId: string,
    progress: number
  ): Promise<void> {
    await this.learningRepository.updateProgress(farmerId, moduleId, progress);
  }

  private async suggestNextModules(
    farmerId: string,
    completedModuleId: string
  ): Promise<void> {
    const nextModules = await this.learningRepository.getNextModules(completedModuleId);
    await this.notifyFarmerOfNextModules(farmerId, nextModules);
  }

  private async checkAndAwardCertificate(
    farmerId: string,
    moduleId: string
  ): Promise<void> {
    const eligibility = await this.learningRepository.checkCertificateEligibility(
      farmerId,
      moduleId
    );
    if (eligibility.isEligible) {
      await this.issueCertificate(farmerId, moduleId);
    }
  }

  async getRecommendedModules(farmerId: string): Promise<LearningModule[]> {
    // Get farmer's profile and products
    const farmer = await this.getFarmerProfile(farmerId);
    const products = await this.getFarmerProducts(farmerId);
    
    // Analyze learning needs
    const learningGaps = await this.analyzeLearningGaps(farmer, products);
    
    // Get personalized recommendations
    const recommendations = await this.getPersonalizedContent(
      learningGaps,
      farmer.preferredLanguage
    );

    // Filter for offline availability if needed
    return farmer.needsOfflineAccess 
      ? recommendations.filter(module => module.offline)
      : recommendations;
  }

  async trackProgress(
    farmerId: string,
    moduleId: string,
    progress: number
  ): Promise<void> {
    // Update progress
    await this.updateLearningProgress(farmerId, moduleId, progress);
    
    // If module completed, suggest next steps
    if (progress === 100) {
      await this.suggestNextModules(farmerId, moduleId);
      
      // Award completion certificate if applicable
      await this.checkAndAwardCertificate(farmerId, moduleId);
    }
  }

  private getRequiredSkills(products: Product[]): string[] {
    return products.reduce((skills: string[], product) => {
      const productSkills = this.getProductSkillRequirements(product);
      return [...new Set([...skills, ...productSkills])];
    }, []);
  }

  private identifyGaps(completedModules: string[], requiredSkills: string[]): LearningGap[] {
    return requiredSkills
      .filter(skill => !completedModules.includes(skill))
      .map(skill => ({
        topicId: skill,
        priority: this.calculatePriority(skill),
        reason: `Required for current products`
      }));
  }

  private getProductSkillRequirements(product: Product): string[] {
    return product.skills || [];
  }

  private calculatePriority(skill: string): number {
    const SKILL_PRIORITIES: SkillPriority = {
      'pest_management': 0.9,
      'water_management': 0.8,
      'organic_farming': 0.7,
      'soil_management': 0.8,
      'harvest_techniques': 0.6,
      'storage_methods': 0.5
    };

    return SKILL_PRIORITIES[skill] || 0.3; // Default priority for unknown skills
  }

  private async notifyFarmerOfNextModules(
    farmerId: string, 
    modules: LearningModule[]
  ): Promise<void> {
    const message: NotificationMessage = {
      type: 'LEARNING_RECOMMENDATION',
      modules: modules.map(m => ({
        id: m.id,
        title: m.title
      }))
    };
    await this.notificationService.send(farmerId, message);
  }

  private async issueCertificate(farmerId: string, moduleId: string): Promise<void> {
    const certificate = await this.learningRepository.generateCertificate(farmerId, moduleId);
    await this.notificationService.sendCertificateNotification(farmerId, certificate);
  }
} 