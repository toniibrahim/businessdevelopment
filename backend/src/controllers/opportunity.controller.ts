import { Request, Response, NextFunction } from 'express';
import opportunityService from '../services/opportunity.service';
import activityService from '../services/activity.service';
import revenueService from '../services/revenue.service';
import probabilityService from '../services/probability.service';
import {
  CreateOpportunityDto,
  UpdateOpportunityDto,
  UpdateOpportunityStatusDto,
  BulkUpdateOpportunitiesDto,
  OpportunityQueryDto,
} from '../dto/opportunity.dto';
import { ActivityType } from '../entities';

export class OpportunityController {
  /**
   * Get all opportunities (with filters and pagination)
   * GET /api/opportunities
   */
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query: OpportunityQueryDto = req.query as any;
      const user = req.user!;

      const result = await opportunityService.findAll(
        query,
        user.userId,
        user.role,
        req.user?.userId // This would need to be enhanced to get actual team_id
      );

      res.status(200).json(result);
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get opportunity by ID
   * GET /api/opportunities/:id
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = req.user!;

      const opportunity = await opportunityService.findById(id, user.userId, user.role);

      // Get probability breakdown
      const probabilityBreakdown = await probabilityService.calculateProbabilityWithBreakdown({
        project_type: opportunity.project_type,
        project_maturity: opportunity.project_maturity,
        client_type: opportunity.client_type,
        client_relationship: opportunity.client_relationship,
        conservative_approach: opportunity.conservative_approach,
      });

      res.status(200).json({
        ...opportunity,
        probability_breakdown: probabilityBreakdown,
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Create opportunity
   * POST /api/opportunities
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: CreateOpportunityDto = req.body;
      const user = req.user!;

      const opportunity = await opportunityService.create(
        data,
        user.userId,
        user.role,
        undefined // TODO: Get user's team_id from database
      );

      res.status(201).json(opportunity);
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Update opportunity
   * PUT /api/opportunities/:id
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const data: UpdateOpportunityDto = req.body;
      const user = req.user!;

      const opportunity = await opportunityService.update(id, data, user.userId, user.role);

      res.status(200).json(opportunity);
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Delete opportunity
   * DELETE /api/opportunities/:id
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = req.user!;

      await opportunityService.delete(id, user.userId, user.role);

      res.status(204).send();
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Duplicate opportunity
   * POST /api/opportunities/:id/duplicate
   */
  async duplicate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { project_name } = req.body;
      const user = req.user!;

      const opportunity = await opportunityService.duplicate(
        id,
        project_name,
        user.userId,
        user.role
      );

      res.status(201).json(opportunity);
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Update opportunity status
   * PUT /api/opportunities/:id/status
   */
  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const data: UpdateOpportunityStatusDto = req.body;
      const user = req.user!;

      const updates: UpdateOpportunityDto = {
        status: data.status,
        stage: data.stage,
      };

      if (data.notes) {
        updates.update_notes = data.notes;
      }

      const opportunity = await opportunityService.update(id, updates, user.userId, user.role);

      // Log status change activity
      await activityService.logActivity({
        opportunity_id: id,
        user_id: user.userId,
        activity_type: ActivityType.STATUS_CHANGED,
        description: `Status changed to ${data.status}`,
        old_value: { status: opportunity.status },
        new_value: { status: data.status },
      });

      res.status(200).json(opportunity);
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Bulk update opportunities
   * POST /api/opportunities/bulk-update
   */
  async bulkUpdate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: BulkUpdateOpportunitiesDto = req.body;
      const user = req.user!;

      const updates: any = {};
      if (data.stage) updates.stage = data.stage;
      if (data.status) updates.status = data.status;
      if (data.owner_id) updates.owner_id = data.owner_id;
      if (data.team_id) updates.team_id = data.team_id;

      const result = await opportunityService.bulkUpdate(
        data.opportunity_ids,
        updates,
        user.userId,
        user.role
      );

      res.status(200).json(result);
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get opportunity activities
   * GET /api/opportunities/:id/activities
   */
  async getActivities(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await activityService.getActivitiesByOpportunity(id, page, limit);

      res.status(200).json(result);
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Add manual activity to opportunity
   * POST /api/opportunities/:id/activities
   */
  async addActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { activity_type, description } = req.body;
      const user = req.user!;

      const activity = await activityService.addManualActivity(
        id,
        user.userId,
        activity_type,
        description
      );

      res.status(201).json(activity);
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get revenue distribution for opportunity
   * GET /api/opportunities/:id/revenue-distribution
   */
  async getRevenueDistribution(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = req.user!;

      // Verify access to opportunity
      await opportunityService.findById(id, user.userId, user.role);

      const distribution = await revenueService.getRevenueDistribution(id);

      res.status(200).json({
        opportunity_id: id,
        ...distribution,
      });
    } catch (error: any) {
      next(error);
    }
  }
}

export default new OpportunityController();
