import { Comment, CommunityPost } from '@prisma/client';
import { CommunityRepository, NotificationService, ModerationService } from '../../types/services';

export class CommunityService {
  private readonly communityRepository: CommunityRepository;
  private readonly notificationService: NotificationService;
  private readonly moderationService: ModerationService;

  constructor(
    communityRepository: CommunityRepository,
    notificationService: NotificationService,
    moderationService: ModerationService
  ) {
    this.communityRepository = communityRepository;
    this.notificationService = notificationService;
    this.moderationService = moderationService;
  }

  async createPost(
    authorId: string,
    authorType: CommunityPost['authorType'],
    content: CommunityPost['content'],
    tags: string[] = [],
    images: string[] = []
  ): Promise<string> {
    // Check content moderation
    const moderationResult = await this.moderationService.checkContent({
      text: content,
      images
    });

    if (!moderationResult.approved) {
      throw new Error(`Content rejected: ${moderationResult.reason}`);
    }

    // Create post
    const post = await this.communityRepository.createPost({
      authorId,
      authorType,
      content,
      tags,
      images,
      likes: 0,
      comments: [],
      createdAt: new Date()
    });

    // Notify relevant users based on tags
    await this.notifyInterestedUsers(post.tags, post);

    return post.id;
  }

  async addComment(
    postId: string,
    authorId: string,
    content: Comment['content']
  ): Promise<string> {
    // Check content moderation
    const moderationResult = await this.moderationService.checkContent({
      text: content
    });

    if (!moderationResult.approved) {
      throw new Error(`Comment rejected: ${moderationResult.reason}`);
    }

    // Add comment
    const comment = await this.communityRepository.addComment(postId, {
      authorId,
      content,
      createdAt: new Date()
    });

    // Notify post author
    const post = await this.communityRepository.getPost(postId);
    await this.notificationService.send(post.authorId, {
      type: 'NEW_COMMENT',
      message: {
        en: 'New comment on your post',
        ta: 'உங்கள் பதிவில் புதிய கருத்து'
      }
    });

    return comment.id;
  }

  private async notifyInterestedUsers(interestedUsers: string[], post: CommunityPost): Promise<void> {
    await Promise.all(
      interestedUsers.map((userId: string) =>
        this.notificationService.send(userId, {
          type: 'NEW_POST',
          message: {
            en: `New post in your area of interest: ${post.content.en}`,
            ta: `உங்கள் ஆர்வத்தின் பகுதியில் புதிய பதிவு: ${post.content.ta}`
          }
        })
      )
    );
  }
} 