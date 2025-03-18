import { TraceabilityRecord, CommunityPost, Comment } from '@prisma/client';
import { NotificationMessage } from './notification';

export interface NotificationService {
  send(userId: string, message: NotificationMessage): Promise<void>;
  notifyFarmer(farmerId: string, message: NotificationMessage): Promise<void>;
}

export interface ModerationService {
  checkContent(content: {
    text?: { en: string; ta: string };
    images?: string[];
  }): Promise<{
    approved: boolean;
    reason?: string;
  }>;
}

export interface TraceabilityRepository {
  createRecord(record: Omit<TraceabilityRecord, 'id'>): Promise<TraceabilityRecord>;
  getProductHistory(productId: string): Promise<TraceabilityRecord[]>;
  updateProductStatus(productId: string, status: string): Promise<void>;
}

export interface CommunityRepository {
  createPost(post: Omit<CommunityPost, 'id'>): Promise<CommunityPost>;
  getPost(postId: string): Promise<CommunityPost>;
  addComment(postId: string, comment: Omit<Comment, 'id'>): Promise<Comment>;
  findUsersByInterests(tags: string[]): Promise<string[]>;
} 