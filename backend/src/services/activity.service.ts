import { AppDataSource } from '../config/database';
import { ActivityLog, ActivityType } from '../entities';

const activityRepository = AppDataSource.getRepository(ActivityLog);

export interface CreateActivityDto {
  opportunity_id: string;
  user_id: string;
  activity_type: ActivityType;
  description: string;
  old_value?: any;
  new_value?: any;
}

export interface PaginatedActivities {
  items: ActivityLog[];
  total: number;
  page: number;
  limit: number;
}

export class ActivityService {
  /**
   * Log an activity
   */
  async logActivity(data: CreateActivityDto): Promise<ActivityLog> {
    const activity = activityRepository.create(data);
    return activityRepository.save(activity);
  }

  /**
   * Get activities for an opportunity
   */
  async getActivitiesByOpportunity(
    opportunityId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedActivities> {
    const skip = (page - 1) * limit;

    const [items, total] = await activityRepository.findAndCount({
      where: { opportunity_id: opportunityId },
      relations: ['user'],
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });

    return {
      items,
      total,
      page,
      limit,
    };
  }

  /**
   * Get recent activities for a user
   */
  async getActivitiesByUser(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedActivities> {
    const skip = (page - 1) * limit;

    const [items, total] = await activityRepository.findAndCount({
      where: { user_id: userId },
      relations: ['opportunity', 'user'],
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });

    return {
      items,
      total,
      page,
      limit,
    };
  }

  /**
   * Get recent activities for a team
   */
  async getActivitiesByTeam(
    teamId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedActivities> {
    const skip = (page - 1) * limit;

    const query = activityRepository
      .createQueryBuilder('activity')
      .leftJoinAndSelect('activity.user', 'user')
      .leftJoinAndSelect('activity.opportunity', 'opportunity')
      .where('opportunity.team_id = :teamId', { teamId })
      .orderBy('activity.created_at', 'DESC')
      .skip(skip)
      .take(limit);

    const [items, total] = await query.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
    };
  }

  /**
   * Add manual activity (call, meeting, email, etc.)
   */
  async addManualActivity(
    opportunityId: string,
    userId: string,
    activityType: ActivityType,
    description: string
  ): Promise<ActivityLog> {
    return this.logActivity({
      opportunity_id: opportunityId,
      user_id: userId,
      activity_type: activityType,
      description,
    });
  }
}

export default new ActivityService();
