import { AppDataSource } from '../config/database';
import { Opportunity, ActivityType, UserRole, OpportunityStatus, OpportunityStage } from '../entities';
import probabilityService from './probability.service';
import revenueService from './revenue.service';
import activityService from './activity.service';
import { CreateOpportunityDto, UpdateOpportunityDto, OpportunityQueryDto } from '../dto/opportunity.dto';
import { differenceInMonths } from 'date-fns';

const opportunityRepository = AppDataSource.getRepository(Opportunity);

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export class OpportunityService {
  /**
   * Create a new opportunity
   */
  async create(data: CreateOpportunityDto, userId: string, userRole: UserRole, userTeamId?: string): Promise<Opportunity> {
    // Determine owner and team
    const ownerId = data.owner_id || userId;
    let teamId = data.team_id;

    // If no team_id provided, use user's team
    if (!teamId && userTeamId) {
      teamId = userTeamId;
    }

    // Sales users can only create opportunities for themselves
    if (userRole === UserRole.SALES && ownerId !== userId) {
      throw new Error('Sales users can only create opportunities for themselves');
    }

    // Calculate duration in months
    const startDate = new Date(data.starting_date);
    const closeDate = new Date(data.closing_date);

    if (closeDate <= startDate) {
      throw new Error('Closing date must be after starting date');
    }

    const durationMonths = differenceInMonths(closeDate, startDate) + 1;

    // Calculate probability score
    const probabilityScore = data.win_probability_override || await probabilityService.calculateProbability({
      project_type: data.project_type,
      project_maturity: data.project_maturity,
      client_type: data.client_type,
      client_relationship: data.client_relationship,
      conservative_approach: data.conservative_approach || false,
    });

    // Calculate weighted amount and gross margin
    const weightedAmount = data.original_amount * probabilityScore;
    const grossMarginPercentage = data.gross_margin_percentage || 0.13;
    const grossMarginAmount = data.original_amount * grossMarginPercentage;

    // Create opportunity
    const opportunity = opportunityRepository.create({
      project_name: data.project_name,
      update_notes: data.update_notes,
      service_type: data.service_type,
      sector_type: data.sector_type,
      original_amount: data.original_amount,
      project_type: data.project_type,
      project_maturity: data.project_maturity,
      client_type: data.client_type,
      client_relationship: data.client_relationship,
      conservative_approach: data.conservative_approach || false,
      starting_date: startDate,
      closing_date: closeDate,
      client_id: data.client_id,
      owner_id: ownerId,
      team_id: teamId,
      gross_margin_percentage: grossMarginPercentage,
      probability_score: probabilityScore,
      weighted_amount: weightedAmount,
      gross_margin_amount: grossMarginAmount,
      duration_months: durationMonths,
      status: (data.status || OpportunityStatus.ACTIVE) as OpportunityStatus,
      stage: (data.stage || data.project_maturity) as OpportunityStage,
      win_probability_override: data.win_probability_override,
      created_by_id: userId,
      last_modified_by_id: userId,
    });

    const savedOpportunity = await opportunityRepository.save(opportunity);

    // Create revenue distribution
    await revenueService.updateRevenueDistribution(
      savedOpportunity,
      weightedAmount,
      grossMarginPercentage
    );

    // Log activity
    await activityService.logActivity({
      opportunity_id: savedOpportunity.id,
      user_id: userId,
      activity_type: ActivityType.CREATED,
      description: `Opportunity "${data.project_name}" created`,
    });

    return this.findById(savedOpportunity.id);
  }

  /**
   * Find opportunity by ID
   */
  async findById(id: string, userId?: string, userRole?: UserRole): Promise<Opportunity> {
    const query = opportunityRepository
      .createQueryBuilder('opp')
      .leftJoinAndSelect('opp.owner', 'owner')
      .leftJoinAndSelect('opp.team', 'team')
      .leftJoinAndSelect('opp.client', 'client')
      .leftJoinAndSelect('opp.revenue_distribution', 'revenue')
      .where('opp.id = :id', { id });

    // Apply access control
    if (userId && userRole === UserRole.SALES) {
      query.andWhere('opp.owner_id = :userId', { userId });
    } else if (userId && userRole === UserRole.MANAGER) {
      query.andWhere('opp.team_id IN (SELECT team_id FROM users WHERE id = :userId)', { userId });
    }

    const opportunity = await query.getOne();

    if (!opportunity) {
      throw new Error('Opportunity not found');
    }

    return opportunity;
  }

  /**
   * Find opportunities with filters and pagination
   */
  async findAll(
    query: OpportunityQueryDto,
    userId?: string,
    userRole?: UserRole,
    userTeamId?: string
  ): Promise<PaginatedResult<Opportunity>> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const qb = opportunityRepository
      .createQueryBuilder('opp')
      .leftJoinAndSelect('opp.owner', 'owner')
      .leftJoinAndSelect('opp.team', 'team')
      .leftJoinAndSelect('opp.client', 'client');

    // Apply access control
    if (userId && userRole === UserRole.SALES) {
      qb.andWhere('opp.owner_id = :userId', { userId });
    } else if (userId && userRole === UserRole.MANAGER && userTeamId) {
      qb.andWhere('opp.team_id = :userTeamId', { userTeamId });
    }

    // Apply filters
    if (query.status) {
      qb.andWhere('opp.status = :status', { status: query.status });
    }

    if (query.stage) {
      qb.andWhere('opp.stage = :stage', { stage: query.stage });
    }

    if (query.owner_id) {
      qb.andWhere('opp.owner_id = :ownerId', { ownerId: query.owner_id });
    }

    if (query.team_id) {
      qb.andWhere('opp.team_id = :teamId', { teamId: query.team_id });
    }

    if (query.service_type) {
      qb.andWhere('opp.service_type = :serviceType', { serviceType: query.service_type });
    }

    if (query.sector_type) {
      qb.andWhere('opp.sector_type = :sectorType', { sectorType: query.sector_type });
    }

    if (query.min_amount !== undefined) {
      qb.andWhere('opp.original_amount >= :minAmount', { minAmount: query.min_amount });
    }

    if (query.max_amount !== undefined) {
      qb.andWhere('opp.original_amount <= :maxAmount', { maxAmount: query.max_amount });
    }

    if (query.min_probability !== undefined) {
      qb.andWhere('opp.probability_score >= :minProb', { minProb: query.min_probability });
    }

    if (query.max_probability !== undefined) {
      qb.andWhere('opp.probability_score <= :maxProb', { maxProb: query.max_probability });
    }

    if (query.start_date_from) {
      qb.andWhere('opp.starting_date >= :startFrom', { startFrom: query.start_date_from });
    }

    if (query.start_date_to) {
      qb.andWhere('opp.starting_date <= :startTo', { startTo: query.start_date_to });
    }

    if (query.close_date_from) {
      qb.andWhere('opp.closing_date >= :closeFrom', { closeFrom: query.close_date_from });
    }

    if (query.close_date_to) {
      qb.andWhere('opp.closing_date <= :closeTo', { closeTo: query.close_date_to });
    }

    // Search
    if (query.search) {
      qb.andWhere(
        '(opp.project_name ILIKE :search OR opp.update_notes ILIKE :search)',
        { search: `%${query.search}%` }
      );
    }

    // Sorting
    const sortBy = query.sort_by || 'created_at';
    const sortOrder = query.sort_order || 'desc';
    qb.orderBy(`opp.${sortBy}`, sortOrder.toUpperCase() as 'ASC' | 'DESC');

    // Get total count
    const total = await qb.getCount();

    // Get paginated results
    const items = await qb.skip(skip).take(limit).getMany();

    const pages = Math.ceil(total / limit);

    return {
      items,
      total,
      page,
      limit,
      pages,
      has_next: page < pages,
      has_prev: page > 1,
    };
  }

  /**
   * Update opportunity
   */
  async update(
    id: string,
    data: UpdateOpportunityDto,
    userId: string,
    userRole: UserRole
  ): Promise<Opportunity> {
    // Find existing opportunity
    const opportunity = await this.findById(id, userId, userRole);

    // Sales users can only update their own opportunities
    if (userRole === UserRole.SALES && opportunity.owner_id !== userId) {
      throw new Error('Sales users can only update their own opportunities');
    }

    // Track changes for activity log
    const changes: any = {};
    const oldValues: any = {};
    const newValues: any = {};

    // Update fields and track changes
    Object.keys(data).forEach((key) => {
      const oldValue = (opportunity as any)[key];
      const newValue = (data as any)[key];

      if (oldValue !== newValue && newValue !== undefined) {
        oldValues[key] = oldValue;
        newValues[key] = newValue;
        (opportunity as any)[key] = newValue;
      }
    });

    // Recalculate if probability factors changed
    let needsRecalculation = false;

    if (
      data.project_type !== undefined ||
      data.project_maturity !== undefined ||
      data.client_type !== undefined ||
      data.client_relationship !== undefined ||
      data.conservative_approach !== undefined ||
      data.original_amount !== undefined ||
      data.starting_date !== undefined ||
      data.closing_date !== undefined ||
      data.gross_margin_percentage !== undefined
    ) {
      needsRecalculation = true;
    }

    if (needsRecalculation) {
      // Recalculate duration if dates changed
      if (data.starting_date || data.closing_date) {
        const startDate = data.starting_date ? new Date(data.starting_date) : opportunity.starting_date;
        const closeDate = data.closing_date ? new Date(data.closing_date) : opportunity.closing_date;

        if (closeDate <= startDate) {
          throw new Error('Closing date must be after starting date');
        }

        opportunity.duration_months = differenceInMonths(closeDate, startDate) + 1;
      }

      // Recalculate probability
      const probabilityScore = data.win_probability_override || await probabilityService.calculateProbability({
        project_type: opportunity.project_type,
        project_maturity: opportunity.project_maturity,
        client_type: opportunity.client_type,
        client_relationship: opportunity.client_relationship,
        conservative_approach: opportunity.conservative_approach,
      });

      opportunity.probability_score = probabilityScore;
      opportunity.weighted_amount = opportunity.original_amount * probabilityScore;
      opportunity.gross_margin_amount = opportunity.original_amount * opportunity.gross_margin_percentage;

      // Update revenue distribution
      await revenueService.updateRevenueDistribution(
        opportunity,
        opportunity.weighted_amount,
        opportunity.gross_margin_percentage
      );
    }

    // Update last modified
    opportunity.last_modified_by_id = userId;

    const updated = await opportunityRepository.save(opportunity);

    // Log activity
    if (Object.keys(changes).length > 0) {
      await activityService.logActivity({
        opportunity_id: id,
        user_id: userId,
        activity_type: ActivityType.UPDATED,
        description: `Opportunity updated`,
        old_value: oldValues,
        new_value: newValues,
      });
    }

    return this.findById(updated.id);
  }

  /**
   * Delete opportunity
   */
  async delete(id: string, userId: string, userRole: UserRole): Promise<void> {
    const opportunity = await this.findById(id, userId, userRole);

    // Sales users can only delete their own opportunities
    if (userRole === UserRole.SALES && opportunity.owner_id !== userId) {
      throw new Error('Sales users can only delete their own opportunities');
    }

    await opportunityRepository.remove(opportunity);
  }

  /**
   * Duplicate opportunity
   */
  async duplicate(id: string, newName: string, userId: string, userRole: UserRole): Promise<Opportunity> {
    const original = await this.findById(id, userId, userRole);

    // Create new opportunity based on original
    const duplicateData: CreateOpportunityDto = {
      project_name: newName,
      update_notes: `Duplicated from: ${original.project_name}`,
      service_type: original.service_type,
      sector_type: original.sector_type,
      original_amount: original.original_amount,
      gross_margin_percentage: original.gross_margin_percentage,
      project_type: original.project_type,
      project_maturity: original.project_maturity,
      client_type: original.client_type,
      client_relationship: original.client_relationship,
      conservative_approach: original.conservative_approach,
      starting_date: original.starting_date.toISOString(),
      closing_date: original.closing_date.toISOString(),
      client_id: original.client_id,
    };

    return this.create(duplicateData, userId, userRole, original.team_id);
  }

  /**
   * Bulk update opportunities
   */
  async bulkUpdate(
    ids: string[],
    updates: Partial<Opportunity>,
    userId: string,
    userRole: UserRole
  ): Promise<{ updated_count: number; failed: string[] }> {
    const failed: string[] = [];
    let updated_count = 0;

    for (const id of ids) {
      try {
        await this.update(id, updates as UpdateOpportunityDto, userId, userRole);
        updated_count++;
      } catch (error) {
        failed.push(id);
      }
    }

    return { updated_count, failed };
  }
}

export default new OpportunityService();
